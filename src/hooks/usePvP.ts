import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { useRaids } from './useRaids';
import { PvPDuel, PvPSelectedTask, PVP_DAMAGE, REQUIRED_TASKS, MAX_HP } from '@/types/pvp';
import { calculateManaGain, DIFFICULTY_MULTIPLIERS } from '@/lib/gameFormulas';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function usePvP() {
  const { user } = useAuth();
  const { profile, addXp, addGold, addMana, addTrophies } = useProfile();
  const { myActiveRaid, dealDamageToBoss } = useRaids();
  const queryClient = useQueryClient();

  // Fetch active duel
  const {
    data: activeDuel,
    isLoading: isLoadingDuel,
    isError: isErrorDuel,
    error: errorDuel
  } = useQuery({
    queryKey: ['pvp-duel', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('pvp_duels')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .in('status', ['pending', 'selecting', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as PvPDuel | null;
    },
    enabled: !!user,
  });

  // Fetch selected tasks for active duel
  const {
    data: selectedTasks = [],
    isLoading: isLoadingTasks,
    isError: isErrorTasks,
    error: errorTasks
  } = useQuery({
    queryKey: ['pvp-selected-tasks', activeDuel?.id],
    queryFn: async () => {
      if (!activeDuel) return [];

      const { data, error } = await supabase
        .from('pvp_selected_tasks')
        .select(`
          *,
          task:tasks(id, title, difficulty, xp_reward, gold_reward)
        `)
        .eq('duel_id', activeDuel.id);

      if (error) throw error;
      return data as PvPSelectedTask[];
    },
    enabled: !!activeDuel,
  });

  // Fetch opponent profile
  const { data: opponentProfile } = useQuery({
    queryKey: ['pvp-opponent', activeDuel?.id, user?.id],
    queryFn: async () => {
      if (!activeDuel || !user) return null;

      const opponentId = activeDuel.challenger_id === user.id
        ? activeDuel.challenged_id
        : activeDuel.challenger_id;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', opponentId)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!activeDuel && !!user,
  });

  // Fetch pending challenges (challenges I RECEIVED)
  const { data: pendingChallenges = [] } = useQuery({
    queryKey: ['pvp-pending-challenges', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('[PvP Debug] Fetching pending challenges for user:', user.id);

      // First get duels where I'm the challenged player
      const { data: duels, error: duelsError } = await supabase
        .from('pvp_duels')
        .select('*')
        .eq('challenged_id', user.id)
        .eq('status', 'pending');

      console.log('[PvP Debug] Duels query result:', { duels, error: duelsError });

      if (duelsError) {
        console.error('[PvP Debug] Error fetching duels:', duelsError);
        throw duelsError;
      }
      if (!duels || duels.length === 0) {
        console.log('[PvP Debug] No pending duels found');
        return [];
      }

      // Then fetch challenger profiles separately
      const challengerIds = duels.map(d => d.challenger_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, level, player_class')
        .in('user_id', challengerIds);

      console.log('[PvP Debug] Found', duels.length, 'pending challenges');

      // Combine duels with challenger profiles
      return duels.map(duel => ({
        ...duel,
        challenger: profiles?.find(p => p.user_id === duel.challenger_id) || null,
      }));
    },
    enabled: !!user,
    refetchInterval: 2000, // Poll every 2 seconds for new challenges
  });

  // Subscribe to realtime updates for pending challenges
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`pvp-challenges-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pvp_duels',
          filter: `challenged_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New PvP challenge received!', payload);
          queryClient.invalidateQueries({ queryKey: ['pvp-pending-challenges'] });
          queryClient.invalidateQueries({ queryKey: ['pvp-duel'] });
          toast.info('⚔️ Você recebeu um desafio PvP!');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pvp_duels',
          filter: `challenger_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('PvP duel updated!', payload);
          queryClient.invalidateQueries({ queryKey: ['pvp-pending-challenges'] });
          queryClient.invalidateQueries({ queryKey: ['pvp-duel'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Challenge a friend
  const challengeFriend = useMutation({
    mutationFn: async (friendId: string) => {
      if (!user) throw new Error('Não autenticado');

      console.log('[PvP Debug] Creating challenge:', {
        challenger_id: user.id,
        challenged_id: friendId
      });

      const { data, error } = await supabase
        .from('pvp_duels')
        .insert({
          challenger_id: user.id,
          challenged_id: friendId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('[PvP Debug] Error creating challenge:', error);
        throw error;
      }

      console.log('[PvP Debug] Challenge created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pvp-duel'] });
      toast.success('⚔️ Desafio enviado!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Accept challenge
  const acceptChallenge = useMutation({
    mutationFn: async (duelId: string) => {
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('pvp_duels')
        .update({ status: 'selecting' })
        .eq('id', duelId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pvp-duel'] });
      queryClient.invalidateQueries({ queryKey: ['pvp-pending-challenges'] });
      toast.success('⚔️ Desafio aceito! Selecione suas 5 tarefas.');
    },
  });

  // Decline challenge
  const declineChallenge = useMutation({
    mutationFn: async (duelId: string) => {
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('pvp_duels')
        .update({ status: 'cancelled' })
        .eq('id', duelId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pvp-duel'] });
      queryClient.invalidateQueries({ queryKey: ['pvp-pending-challenges'] });
      toast.info('Desafio recusado');
    },
  });

  // Cancel my own challenge (when I'm the challenger)
  const cancelChallenge = useMutation({
    mutationFn: async (duelId: string) => {
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('pvp_duels')
        .update({ status: 'cancelled' })
        .eq('id', duelId)
        .eq('challenger_id', user.id); // Only challenger can cancel

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pvp-duel'] });
      queryClient.invalidateQueries({ queryKey: ['pvp-pending-challenges'] });
      toast.info('Desafio cancelado');
    },
  });

  // Select task for duel
  const selectTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user || !activeDuel) throw new Error('Duelo não encontrado');

      const myTasks = selectedTasks.filter(t => t.user_id === user.id);
      if (myTasks.length >= REQUIRED_TASKS) {
        throw new Error(`Você já selecionou ${REQUIRED_TASKS} tarefas`);
      }

      const { error } = await supabase
        .from('pvp_selected_tasks')
        .insert({
          duel_id: activeDuel.id,
          user_id: user.id,
          task_id: taskId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pvp-selected-tasks'] });
      toast.success('📋 Tarefa selecionada!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Remove task from selection
  const removeTask = useMutation({
    mutationFn: async (selectionId: string) => {
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('pvp_selected_tasks')
        .delete()
        .eq('id', selectionId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pvp-selected-tasks'] });
      toast.info('Tarefa removida da seleção');
    },
  });

  // Lock tasks and start duel
  const lockTasks = useMutation({
    mutationFn: async () => {
      if (!user || !activeDuel) throw new Error('Duelo não encontrado');

      const myTasks = selectedTasks.filter(t => t.user_id === user.id);
      if (myTasks.length < REQUIRED_TASKS) {
        throw new Error(`Selecione ${REQUIRED_TASKS} tarefas primeiro`);
      }

      // Lock my tasks
      const { error: lockError } = await supabase
        .from('pvp_selected_tasks')
        .update({ locked: true })
        .eq('duel_id', activeDuel.id)
        .eq('user_id', user.id);

      if (lockError) throw lockError;

      // Check if both players locked
      const opponentId = activeDuel.challenger_id === user.id
        ? activeDuel.challenged_id
        : activeDuel.challenger_id;

      const { data: opponentTasks } = await supabase
        .from('pvp_selected_tasks')
        .select('locked')
        .eq('duel_id', activeDuel.id)
        .eq('user_id', opponentId)
        .eq('locked', true);

      if (opponentTasks && opponentTasks.length >= REQUIRED_TASKS) {
        // Both locked, start duel!
        await supabase
          .from('pvp_duels')
          .update({
            status: 'active',
            started_at: new Date().toISOString()
          })
          .eq('id', activeDuel.id);

        toast.success('🔥 O DUELO COMEÇOU!');
      } else {
        toast.success('🔒 Tarefas travadas! Aguardando oponente...');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pvp-duel'] });
      queryClient.invalidateQueries({ queryKey: ['pvp-selected-tasks'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Complete task with evidence
  const completeTaskWithEvidence = useMutation({
    mutationFn: async ({ selectionId, evidenceUrl, difficulty }: {
      selectionId: string;
      evidenceUrl: string;
      difficulty: 'medium' | 'hard';
    }) => {
      if (!user || !activeDuel || !profile) throw new Error('Duelo ou Perfil não encontrado');

      const damage = PVP_DAMAGE[difficulty];

      // Find the specific PvP task record to get the original task_id
      const pvpTask = selectedTasks.find(t => t.id === selectionId);
      if (!pvpTask) throw new Error('Vinculação de tarefa não encontrada');

      // 1. Update PvP task record
      const { error: pvpTaskError } = await supabase
        .from('pvp_selected_tasks')
        .update({
          completed: true,
          evidence_url: evidenceUrl,
          damage_dealt: damage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', selectionId);

      if (pvpTaskError) throw pvpTaskError;

      // 2. Update original task in global tasks table
      const { error: globalTaskError } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', pvpTask.task_id);

      if (globalTaskError) console.error("Erro ao atualizar tarefa global:", globalTaskError);

      // 3. Apply rewards (XP, Gold, Mana)
      const xpReward = pvpTask.task?.xp_reward || (difficulty === 'hard' ? 25 : 12);
      const goldReward = pvpTask.task?.gold_reward || (difficulty === 'hard' ? 12 : 5);
      const manaReward = calculateManaGain(difficulty, profile.player_class, profile.intelligence);

      await addXp(xpReward);
      await addGold(goldReward);
      await addMana(manaReward);

      // 4. Apply damage to opponent
      const isChallenger = activeDuel.challenger_id === user.id;
      const hpField = isChallenger ? 'challenged_hp' : 'challenger_hp';
      const currentHp = isChallenger ? activeDuel.challenged_hp : activeDuel.challenger_hp;
      const newHp = Math.max(0, currentHp - damage);

      const { error: duelError } = await supabase
        .from('pvp_duels')
        .update({ [hpField]: newHp })
        .eq('id', activeDuel.id);

      if (duelError) throw duelError;

      // 5. Deal damage to Raid Boss if in an active raid (Sync with global mechanics)
      if (myActiveRaid) {
        const raidDamage = profile.level * DIFFICULTY_MULTIPLIERS[difficulty];
        await dealDamageToBoss(myActiveRaid.id, raidDamage, pvpTask.task?.title);
      }

      // Ensure all queries are invalidated to sync UI
      queryClient.invalidateQueries({ queryKey: ['pvp-duel', user.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user.id] });
      queryClient.invalidateQueries({ queryKey: ['pvp-selected-tasks', activeDuel.id] });

      // 6. Check for victory
      if (newHp <= 0) {
        await supabase
          .from('pvp_duels')
          .update({
            status: 'completed',
            winner_id: user.id,
            ended_at: new Date().toISOString(),
          })
          .eq('id', activeDuel.id);

        // Final Victory Bonus
        await addXp(200);
        await addGold(150);
        await addTrophies(5);

        toast.success('🏆 VITÓRIA! Você derrotou seu oponente!');
      }

      return { damage, newHp };
    },
    onSuccess: ({ damage }) => {
      queryClient.invalidateQueries({ queryKey: ['pvp-duel'] });
      queryClient.invalidateQueries({ queryKey: ['pvp-selected-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast.success(`⚔️ Tarefa PvP concluída! +XP/Ouro e ${damage} de dano no oponente!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Contest a task
  const contestTask = useMutation({
    mutationFn: async ({ selectionId, reason }: { selectionId: string; reason: string }) => {
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase
        .from('pvp_selected_tasks')
        .update({
          contested: true,
          contest_reason: reason,
        })
        .eq('id', selectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pvp-selected-tasks'] });
      toast.warning('⚠️ Tarefa contestada! Aguardando revisão.');
    },
  });

  // Upload evidence to storage
  const uploadEvidence = async (file: File): Promise<string> => {
    if (!user) throw new Error('Não autenticado');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('task_evidences')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('task_evidences')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // Subscribe to realtime updates
  const subscribeToUpdates = () => {
    if (!activeDuel) return () => { };

    const channel = supabase
      .channel(`pvp-${activeDuel.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pvp_duels',
          filter: `id=eq.${activeDuel.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pvp-duel'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pvp_selected_tasks',
          filter: `duel_id=eq.${activeDuel.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pvp-selected-tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const myTasks = selectedTasks.filter(t => t.user_id === user?.id);
  const opponentTasks = selectedTasks.filter(t => t.user_id !== user?.id);
  const myLocked = myTasks.every(t => t.locked) && myTasks.length >= REQUIRED_TASKS;
  const opponentLocked = opponentTasks.every(t => t.locked) && opponentTasks.length >= REQUIRED_TASKS;

  const getMyHp = () => {
    if (!activeDuel || !user) return MAX_HP;
    return activeDuel.challenger_id === user.id
      ? activeDuel.challenger_hp
      : activeDuel.challenged_hp;
  };

  const getOpponentHp = () => {
    if (!activeDuel || !user) return MAX_HP;
    return activeDuel.challenger_id === user.id
      ? activeDuel.challenged_hp
      : activeDuel.challenger_hp;
  };

  return {
    activeDuel,
    selectedTasks,
    myTasks,
    opponentTasks,
    myLocked,
    opponentLocked,
    opponentProfile,
    pendingChallenges,
    isLoading: user ? (isLoadingDuel || isLoadingTasks) : false,
    isError: isErrorDuel || isErrorTasks,
    error: errorDuel || errorTasks,
    getMyHp,
    getOpponentHp,
    challengeFriend: challengeFriend.mutate,
    acceptChallenge: acceptChallenge.mutate,
    declineChallenge: declineChallenge.mutate,
    cancelChallenge: cancelChallenge.mutate,
    selectTask: selectTask.mutate,
    removeTask: removeTask.mutate,
    lockTasks: lockTasks.mutate,
    completeTaskWithEvidence: completeTaskWithEvidence.mutateAsync,
    contestTask: contestTask.mutate,
    uploadEvidence,
    subscribeToUpdates,
  };
}
