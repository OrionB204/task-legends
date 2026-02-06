import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Raid, RaidMember, BOSS_TEMPLATES } from '@/types/social';
import { calculateRaidDamage } from '@/lib/gameFormulas';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

export function useRaids() {
  const { user } = useAuth();
  const { profile, addGold, addXp, takeDamage } = useProfile();
  const queryClient = useQueryClient();

  // Fetch all active raids
  const { data: raids = [], isLoading: raidsLoading } = useQuery({
    queryKey: ['raids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raids')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Raid[];
    },
    enabled: !!user,
  });

  // Fetch user's active raid memberships
  const { data: myRaidMemberships = [] } = useQuery({
    queryKey: ['raid_members', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('raid_members')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []) as (RaidMember & { last_damage_check?: string })[];
    },
    enabled: !!user,
  });

  const myActiveRaid = raids.find(
    raid => raid.status === 'active' && myRaidMemberships.some(m => m.raid_id === raid.id)
  );

  // Get damage logs for a raid
  const { data: damageLogs = [] } = useQuery({
    queryKey: ['raid_damage_logs', myActiveRaid?.id],
    queryFn: async () => {
      if (!myActiveRaid) return [];
      const { data, error } = await supabase
        .from('raid_damage_logs' as any)
        .select('*')
        .eq('raid_id', myActiveRaid.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!myActiveRaid,
  });

  // Create a new raid
  const createRaid = useMutation({
    mutationFn: async ({ name, bossIndex }: { name: string; bossIndex: number }) => {
      if (!user) throw new Error('Not authenticated');

      const boss = BOSS_TEMPLATES[bossIndex];
      if (!boss) throw new Error('Boss não encontrado. Selecione um boss válido.');

      console.log('[CreateRaid] Creating raid with boss:', boss.name);

      // 1. Create the raid
      const { data: raid, error: raidError } = await supabase
        .from('raids')
        .insert({
          name: name.trim(),
          boss_name: boss.name,
          boss_max_hp: boss.hp,
          boss_current_hp: boss.hp,
          boss_damage: boss.damage,
          leader_id: user.id,
          status: 'active',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        } as any)
        .select()
        .single();

      if (raidError) {
        console.error('[CreateRaid] Error creating raid:', raidError);
        throw new Error(`Erro ao criar raid: ${raidError.message}`);
      }

      console.log('[CreateRaid] Raid created:', raid.id);

      // 2. Add the creator as a raid member
      const { error: memberError } = await supabase.from('raid_members').insert({
        raid_id: raid.id,
        user_id: user.id,
        is_leader: true,
        damage_dealt: 0,
      });

      if (memberError) {
        console.error('[CreateRaid] Error adding member:', memberError);
        // Try to delete the raid if member insert failed
        await supabase.from('raids').delete().eq('id', raid.id);
        throw new Error(`Erro ao adicionar líder: ${memberError.message}`);
      }

      console.log('[CreateRaid] Leader added successfully');
      return raid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raids'] });
      queryClient.invalidateQueries({ queryKey: ['raid_members'] });
      toast.success('⚔️ Raid criada! Convide heróis para ajudar.');
    },
    onError: (error: any) => {
      console.error('[CreateRaid] Mutation error:', error);
      toast.error(error.message || 'Erro ao criar raid');
    },
  });

  const joinRaid = useMutation({
    mutationFn: async (raidId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('raid_members').insert({
        raid_id: raidId,
        user_id: user.id,
        is_leader: false
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raid_members'] });
      toast.success('🎉 Você entrou na raid!');
    }
  });

  const inviteByEmail = async (raidId: string, identifier: string) => {
    // Search by username since email is not in public profiles
    const { data: profiles, error: searchError } = await supabase
      .from('profiles')
      .select('user_id, username')
      .eq('username', identifier.trim())
      .limit(1);

    if (searchError) throw searchError;
    if (!profiles || profiles.length === 0) throw new Error('Usuário não encontrado');

    const targetUser = profiles[0];

    const { error: insertError } = await supabase
      .from('raid_members').insert({
        raid_id: raidId,
        user_id: targetUser.user_id,
        is_leader: false,
      });

    if (insertError) throw insertError;
    return targetUser;
  };

  const dealDamageToBoss = async (raidId: string, damage: number, taskTitle?: string) => {
    if (!user) return;

    const { data: raid } = await supabase
      .from('raids')
      .select('*')
      .eq('id', raidId)
      .single() as { data: Raid | null, error: any };

    if (!raid || raid.status !== 'active') return;

    const now = new Date();
    const finalDamage = calculateRaidDamage(damage, profile?.level || 1);
    const newHp = Math.max(raid.boss_current_hp - finalDamage, 0);

    await supabase
      .from('raids')
      .update({
        boss_current_hp: newHp,
        status: newHp <= 0 ? 'victory' : 'active'
      } as any)
      .eq('id', raidId);

    // Log player damage
    await supabase.from('raid_damage_logs' as any).insert({
      raid_id: raidId,
      user_id: user.id,
      damage_amount: finalDamage,
      type: 'player_to_boss',
      task_title: taskTitle
    });

    const { data: memberData } = await supabase
      .from('raid_members')
      .select('damage_dealt')
      .eq('raid_id', raidId)
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('raid_members')
      .update({ damage_dealt: ((memberData as any)?.damage_dealt || 0) + finalDamage })
      .eq('raid_id', raidId)
      .eq('user_id', user.id);

    if (newHp <= 0) await handleRaidVictory(raidId);

    // CLASS SKILLS MECHANICS
    // ----------------------
    // We use a counter in raid_members to track every 3 tasks
    const { data: currentMember } = await supabase
      .from('raid_members')
      .select('task_counter, user_id, damage_dealt')
      .eq('raid_id', raidId)
      .eq('user_id', user.id)
      .single() as { data: RaidMember | null, error: any };

    const newCounter = ((currentMember as any)?.task_counter || 0) + 1;

    // Check if skill triggers (every 3 tasks)
    if (newCounter >= 3) {
      await supabase.from('raid_members').update({ task_counter: 0 } as any).eq('raid_id', raidId).eq('user_id', user.id);

      if (profile?.player_class === 'mage') {
        const bonusDamage = Math.floor(finalDamage * 0.5);
        await dealDamageToBoss(raidId, bonusDamage, 'MAGIA: Eco Arcano');
        await supabase.from('messages').insert({
          channel_type: 'raid',
          channel_id: raidId,
          sender_id: user.id,
          content: `🔮 ECO ARCANO! ${profile.username} liberou uma explosão de mana causando ${bonusDamage} de dano extra!`
        });
      } else if (profile?.player_class === 'rogue') {
        const bonusDamage = Math.floor(finalDamage * 0.3);
        await dealDamageToBoss(raidId, bonusDamage, 'RAJADA: Saraivada de Flechas');
        await supabase.from('messages').insert({
          channel_type: 'raid',
          channel_id: raidId,
          sender_id: user.id,
          content: `🏹 SARAIVADA! ${profile.username} disparou uma rajada de flechas causando ${bonusDamage} de dano extra!`
        });
      } else if (profile?.player_class === 'cleric') {
        // Heal everyone in the raid by 10% of their current HP
        const { data: members } = await supabase.from('raid_members').select('user_id').eq('raid_id', raidId);
        if (members) {
          for (const m of members) {
            const { data: p } = await supabase.from('profiles').select('current_hp, max_hp').eq('user_id', m.user_id).single();
            if (p) {
              const healAmount = Math.floor(p.max_hp * 0.1);
              await supabase.from('profiles').update({
                current_hp: Math.min(p.max_hp, p.current_hp + healAmount)
              }).eq('user_id', m.user_id);
            }
          }
        }
        await supabase.from('messages').insert({
          channel_type: 'raid',
          channel_id: raidId,
          sender_id: user.id,
          content: `✨ ORAÇÃO COLETIVA! ${profile.username} curou 10% do HP de todos os membros da Raid!`
        });
      }
    } else {
      await supabase.from('raid_members').update({ task_counter: newCounter } as any).eq('raid_id', raidId).eq('user_id', user.id);
    }

    queryClient.invalidateQueries({ queryKey: ['raids'] });
    queryClient.invalidateQueries({ queryKey: ['raid_members'] });
    queryClient.invalidateQueries({ queryKey: ['raid_damage_logs'] });
  };

  const handleRaidVictory = async (raidId: string) => {
    await addGold(100);
    await addXp(200);
    toast.success(`🏆 VITÓRIA! +100 ouro, +200 XP`, { duration: 5000 });
  };

  const checkDailyBossDamage = async () => {
    if (!user || !myActiveRaid || !profile) return;

    const membership = myRaidMemberships.find(m => m.raid_id === myActiveRaid.id);
    const lastCheck = membership?.last_damage_check;
    const todayStr = new Date().toISOString().split('T')[0];

    if (lastCheck && lastCheck.startsWith(todayStr)) return;

    const { data: oldTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lt('created_at', todayStr);

    if (oldTasks && oldTasks.length > 0) {
      const bossDamageBase = myActiveRaid.boss_damage || 10;
      let totalDamage = oldTasks.length * bossDamageBase;

      await takeDamage(totalDamage);

      for (const task of oldTasks) {
        await supabase.from('raid_damage_logs' as any).insert({
          raid_id: myActiveRaid.id,
          user_id: user.id,
          damage_amount: bossDamageBase,
          type: 'boss_to_player',
          task_title: (task as any).title
        });
        await supabase.from('tasks').update({ status: 'failed' }).eq('id', task.id);
      }

      toast.error(`🌘 Boss Atacou! -${totalDamage} HP por tarefas pendentes.`);
    }

    await supabase
      .from('raid_members')
      .update({ last_damage_check: new Date().toISOString() } as any)
      .eq('raid_id', myActiveRaid.id)
      .eq('user_id', user.id);

    queryClient.invalidateQueries({ queryKey: ['raid_members'] });
  };

  // Mutex para evitar múltiplos disparos simultâneos
  const isCritProcessing = useRef(false);

  const triggerBossRandomCrit = async () => {
    // 1. Verificação de Segurança (Mutex)
    if (isCritProcessing.current) return;
    if (!user || !myActiveRaid) return;

    try {
      isCritProcessing.current = true;

      // 15% chance
      if (Math.random() > 0.15) return;

      const todayStr = new Date().toISOString().split('T')[0];

      // Refresh raid data to get latest crit count (Bloqueio Otimista)
      const { data: raid } = await supabase
        .from('raids')
        .select('daily_crit_count, last_crit_reset_date, boss_name')
        .eq('id', myActiveRaid.id)
        .single();

      if (!raid) return;
      const raidData = raid as any;

      // Reset diário lógico
      let critCount = raidData.daily_crit_count || 0;
      if (raidData.last_crit_reset_date !== todayStr) {
        critCount = 0;
      }

      // 2. Limitação: 3 vezes ao dia (Check Rígido)
      if (critCount >= 3) {
        return;
      }

      // Boss Skills Mapping
      const bossSkillNames: Record<string, string> = {
        'Dragão de Fogo': 'Sopro de Plasma',
        'Hydra de Código': 'Loop Infinito',
        'Golem de Pedra': 'Terremoto de Dados',
        'Fênix Sombria': 'Explosão Estelar',
        'Kraken Abissal': 'Tsunami Binária',
        'Ignis, o Devorador': 'Chamas do Esquecimento',
        'A Hydra dos Loops Literários': 'Recursão Fatal',
        'Sir Galen, o Cavaleiro da Inércia': 'Golpe da Preguiça',
        'Xylo, o Olho Plasmático': 'Raio Desfocante',
        'Glup, o Terror Geométrico': 'Prisão Poligonal',
        'Vaelith, a Soberana Esmeralda': 'Bafejada Tóxica'
      };

      // Tenta pegar o nome mapeado, ou usa o nome do boss como prefixo se não achar, ou fallback genérico
      const skillName = bossSkillNames[raidData.boss_name] || `Ataque de ${raidData.boss_name}`;

      // Ação: 5% HP dano em todos os usuários
      const { data: members } = await supabase
        .from('raid_members')
        .select('user_id')
        .eq('raid_id', myActiveRaid.id);

      if (members) {
        for (const m of members) {
          const { data: p } = await supabase
            .from('profiles')
            .select('current_hp, max_hp')
            .eq('user_id', m.user_id)
            .single();

          if (p) {
            const damage = Math.max(1, Math.floor(p.max_hp * 0.05));
            await supabase
              .from('profiles')
              .update({ current_hp: Math.max(0, p.current_hp - damage) })
              .eq('user_id', m.user_id);
          }
        }
      }

      // Atualizar contador e Log (Incremento Atômico seria ideal, mas update normal serve se o mutex segurar o local)
      const { error: updateError } = await supabase.from('raids').update({
        daily_crit_count: critCount + 1,
        last_crit_reset_date: todayStr
      } as any).eq('id', myActiveRaid.id);

      if (updateError) throw updateError;

      // Log Sincronizado
      await supabase.from('raid_damage_logs' as any).insert({
        raid_id: myActiveRaid.id,
        user_id: user.id, // O log fica atrelado ao usuário que "triggou", mas identificado como Boss Attack no tipo
        damage_amount: 5, // Valor simbólico de %
        type: 'boss_skill', // Novo tipo específico para diferenciar nos logs
        task_title: `🛑 BOSS USOU: ${skillName} (-5% HP em TODOS)`
      });

      await supabase.from('messages').insert({
        channel_type: 'raid',
        channel_id: myActiveRaid.id,
        sender_id: 'SYSTEM',
        content: `🔪 O Boss usou ${skillName}! Todo o grupo perdeu 5% de HP.`
      });

      toast.error(`⚔️ O BOSS CONTRA-ATACA! ${skillName} acerta o grupo!`, {
        duration: 5000,
        style: { background: '#330000', color: '#ff4444', border: '1px solid red' }
      });

      queryClient.invalidateQueries({ queryKey: ['raids'] });
      queryClient.invalidateQueries({ queryKey: ['raid_damage_logs'] });

    } catch (error) {
      console.error("Erro no critico do boss:", error);
    } finally {
      // Delay pequeno para evitar "cliques duplos"
      setTimeout(() => {
        isCritProcessing.current = false;
      }, 2000);
    }
  };

  useEffect(() => {
    if (myActiveRaid && profile) {
      checkDailyBossDamage();
    }
  }, [myActiveRaid?.id, profile?.id]);

  const leaveRaid = useMutation({
    mutationFn: async (raidId: string) => {
      if (!user || !profile) throw new Error('Not authenticated');

      const goldPenalty = Math.floor(profile.gold * 0.5);
      const hpPenalty = Math.floor(profile.current_hp * 0.4);

      // 1. Leave the raid
      const { error: leaveError } = await supabase
        .from('raid_members')
        .delete()
        .eq('raid_id', raidId)
        .eq('user_id', user.id);

      if (leaveError) throw leaveError;

      // 2. Apply penalties
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          gold: Math.max(0, profile.gold - goldPenalty),
          current_hp: Math.max(0, profile.current_hp - hpPenalty)
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      return { goldPenalty, hpPenalty };
    },
    onSuccess: ({ goldPenalty, hpPenalty }) => {
      queryClient.invalidateQueries({ queryKey: ['raid_members'] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.error(`💔 Desertor! Você perdeu ${hpPenalty} HP e ${goldPenalty} 🪙 por abandonar a raid.`);
    },
    onError: (error) => {
      toast.error('Erro ao sair da raid: ' + error.message);
    }
  });


  return {
    raids: raids.filter(r => r.status === 'active'),
    myActiveRaid,
    myRaidMemberships,
    raidsLoading,
    createRaid: createRaid.mutate,
    joinRaid: joinRaid.mutate,
    leaveRaid: leaveRaid.mutate,
    deleteRaid: useMutation({
      mutationFn: async (raidId: string) => {
        if (!user) throw new Error('Not authenticated');

        // 1. Delete all members first
        await supabase
          .from('raid_members')
          .delete()
          .eq('raid_id', raidId);

        // 2. Mark raid as failed/deleted (status change to hide it)
        const { error } = await supabase
          .from('raids')
          .update({ status: 'failed' })
          .eq('id', raidId)
          .eq('leader_id', user.id);

        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['raids'] });
        queryClient.invalidateQueries({ queryKey: ['raid_members'] });
        toast.success('⚔️ Raid encerrada pelo líder.');
      },
      onError: (error) => {
        toast.error('Erro ao encerrar raid: ' + error.message);
      }
    }).mutate,
    dealDamageToBoss,
    getRaidMembers: async (id: string) => {
      const { data } = await supabase.from('raid_members').select('*').eq('raid_id', id);
      return (data || []) as RaidMember[];
    },
    inviteByEmail,
    damageLogs,
    triggerBossRandomCrit,
    isCreating: createRaid.isPending,
  };
}
