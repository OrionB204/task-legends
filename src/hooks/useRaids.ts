import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Raid, RaidMember, BOSS_TEMPLATES } from '@/types/social';
import { calculateRaidDamage } from '@/lib/gameFormulas';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
      const { data: raid, error } = await supabase
        .from('raids')
        .insert({
          name,
          boss_name: boss.name,
          boss_max_hp: boss.hp,
          boss_current_hp: boss.hp,
          boss_damage: boss.damage,
          leader_id: user.id,
          status: 'active',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          charge_meter: 0,
          charge_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        } as any)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('raid_members').insert({
        raid_id: raid.id,
        user_id: user.id,
        is_leader: true,
      });

      return raid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raids'] });
      queryClient.invalidateQueries({ queryKey: ['raid_members'] });
      toast.success('⚔️ Raid criada! Convide heróis para ajudar.');
    },
    onError: (error) => {
      toast.error('Erro ao criar raid: ' + error.message);
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
      .single();

    if (!raid || raid.status !== 'active') return;

    let finalDamage = calculateRaidDamage(damage, profile?.level || 1);

    // STUN MECHANIC: Double damage if boss is stunned
    if (raid.is_stunned && raid.stunned_until) {
      if (new Date(raid.stunned_until) > new Date()) {
        finalDamage *= 2;
      } else {
        // Stun expired
        await supabase.from('raids').update({ is_stunned: false } as any).eq('id', raidId);
      }
    }

    const newHp = Math.max(raid.boss_current_hp - finalDamage, 0);

    // Charge Reduction Mechanic
    let newCharge = (raid.charge_meter || 0);
    if (!raid.is_stunned) {
      // Reduce charge by a percentage of the boss max HP
      const chargeReduction = Math.max(1, Math.floor((finalDamage / raid.boss_max_hp) * 100));
      newCharge = Math.max(0, newCharge - chargeReduction);

      // If charge reaches 0, boss gets stunned!
      if (newCharge <= 0 && (raid.charge_meter || 0) > 0) {
        await supabase.from('raids').update({
          is_stunned: true,
          stunned_until: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours
          charge_meter: 0
        } as any).eq('id', raidId);

        await supabase.from('messages').insert({
          channel_type: 'raid',
          channel_id: raidId,
          sender_id: user.id,
          content: `🌟 ESTUPORADO! O Boss foi atordoado e receberá DANO EM DOBRO pelas próximas 6 horas!`
        });
      }
    }

    await supabase
      .from('raids')
      .update({
        boss_current_hp: newHp,
        status: newHp <= 0 ? 'victory' : 'active',
        charge_meter: newCharge
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
      .single();

    const newCounter = ((currentMember as any)?.task_counter || 0) + 1;

    // Check if skill triggers (every 3 tasks)
    if (newCounter >= 3) {
      await supabase.from('raid_members').update({ task_counter: 0 }).eq('raid_id', raidId).eq('user_id', user.id);

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
      await supabase.from('raid_members').update({ task_counter: newCounter }).eq('raid_id', raidId).eq('user_id', user.id);
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

      // WARRIOR PASSIVE: Baluarte (Reduces damage for Everyone in the team)
      const { data: raidMembers } = await supabase.from('raid_members').select('user_id').eq('raid_id', myActiveRaid.id);
      if (raidMembers) {
        const userIds = raidMembers.map(m => m.user_id);
        const { data: memberProfiles } = await supabase.from('profiles').select('player_class').in('user_id', userIds);
        const hasWarrior = memberProfiles?.some(p => p.player_class === 'warrior');
        if (hasWarrior) {
          totalDamage = Math.floor(totalDamage * 0.7); // 30% reduction
          toast.info('🛡️ O Guerreiro do grupo reduziu o dano do Boss em 30%!');
        }
      }

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

  const checkSupernovaStatus = async () => {
    if (!user || !myActiveRaid || !profile) return;

    // Only check if active and NOT stunned
    if (myActiveRaid.status !== 'active' || myActiveRaid.is_stunned) return;

    const lastCheck = myRaidMemberships.find(m => m.raid_id === myActiveRaid.id)?.last_damage_check;
    const now = new Date();
    const chargeDeadline = myActiveRaid.charge_deadline ? new Date(myActiveRaid.charge_deadline) : null;

    // Logic: Increase charge based on time passed
    // If deadline passed, blast Supernova
    if (chargeDeadline && now > chargeDeadline) {
      const damage = Math.floor(profile.max_hp * 0.4); // 40% of max HP
      await takeDamage(damage);

      // Reset charge meter and set new deadline (3 days from now)
      await supabase.from('raids').update({
        charge_meter: 0,
        charge_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      } as any).eq('id', myActiveRaid.id);

      await supabase.from('messages').insert({
        channel_type: 'raid',
        channel_id: myActiveRaid.id,
        sender_id: 'SYSTEM',
        content: `💥 SUPERNOVA! O Boss liberou sua carga devastadora causando ${damage} de dano a todos!`
      });

      toast.error(`💥 SUPERNOVA! Você recebeu ${damage} de dano massivo!`);
    } else {
      // Increment charge meter slowly if it hasn't been updated for a while
      // For simplicity in this demo, we'll increment when tasks are failed too, 
      // but here we mark the tick
      const chargeIncrease = 5; // 5% increase per tick (daily check)
      const currentMeter = myActiveRaid.charge_meter || 0;
      if (currentMeter < 100) {
        await supabase.from('raids').update({
          charge_meter: Math.min(100, currentMeter + chargeIncrease)
        } as any).eq('id', myActiveRaid.id);
      }
    }
  };

  useEffect(() => {
    if (myActiveRaid && profile) {
      checkDailyBossDamage();
      checkSupernovaStatus();
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
    isCreating: createRaid.isPending,
  };
}
