import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { useRaids } from './useRaids';
import {
  calculateXpGain,
  calculateGoldGain,
  calculateManaGain,
  calculateDamage,
  TaskDifficulty,
  FREE_TASK_LIMIT,
  DIFFICULTY_MULTIPLIERS
} from '@/lib/gameFormulas';
import { toast } from 'sonner';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  difficulty: TaskDifficulty;
  due_date: string | null;
  status: 'pending' | 'completed' | 'failed';
  xp_reward: number;
  gold_reward: number;
  created_at: string;
  completed_at: string | null;
  pvp_selection_id?: string;
  is_pvp?: boolean;
}

export function useTasks() {
  const { user } = useAuth();
  const { profile, addXp, addGold, addMana, takeDamage } = useProfile();
  const { myActiveRaid, dealDamageToBoss } = useRaids();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check for active PvP duel and its tasks
      const { data: duel } = await supabase
        .from('pvp_duels')
        .select('id')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .in('status', ['selecting', 'active'])
        .maybeSingle();

      if (duel) {
        const { data: pvpTasks } = await supabase
          .from('pvp_selected_tasks')
          .select('id, task_id')
          .eq('duel_id', duel.id)
          .eq('user_id', user.id);

        if (pvpTasks && pvpTasks.length > 0) {
          const pvpTaskIdMap = new Map(pvpTasks.map(pt => [pt.task_id, pt.id]));
          return (tasks as Task[]).map(t => ({
            ...t,
            pvp_selection_id: pvpTaskIdMap.get(t.id),
            is_pvp: pvpTaskIdMap.has(t.id)
          }));
        }
      }

      return tasks as Task[];
    },
    enabled: !!user,
  });

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // Check for passed deadlines periodically or on task update
  useEffect(() => {
    if (!user || tasks.length === 0 || !profile) return;

    const checkOverdueTasks = async () => {
      const now = new Date();
      const overdueTasks = pendingTasks.filter(task => {
        if (!task.due_date) return false;

        // Definition: Due date represents the day it must be completed.
        // It fails if 'now' is past the end of that day (23:59:59).
        const deadline = new Date(task.due_date);
        deadline.setHours(23, 59, 59, 999);

        return now > deadline;
      });

      for (const task of overdueTasks) {
        // Only process tasks that aren't already being failed (to avoid race conditions)
        await failTask(task);
      }
    };

    checkOverdueTasks();
  }, [tasks, user, profile?.id]);

  const canCreateTask = () => {
    if (!profile) return false;
    if (profile.is_pro) return true;
    return pendingTasks.length < FREE_TASK_LIMIT;
  };

  const createTask = useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      difficulty: TaskDifficulty;
      due_date?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      if (!canCreateTask()) {
        throw new Error('Limite de tarefas gratuitas atingido. Faça upgrade para PRO!');
      }

      const xpReward = calculateXpGain(task.difficulty);
      const goldReward = calculateGoldGain(task.difficulty);

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: task.title,
          description: task.description,
          difficulty: task.difficulty,
          due_date: task.due_date,
          xp_reward: xpReward,
          gold_reward: goldReward,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast.success('📋 Tarefa criada com sucesso!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('Not authenticated');

      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error('Tarefa não encontrada');
      if (task.status === 'completed') throw new Error('Tarefa já completada');

      // Sync Check: If this is a PvP task, it MUST be completed via PvP Arena with a photo
      if (task.is_pvp) {
        throw new Error('Esta tarefa está vinculada a um Duelo PvP! Use a Arena PvP para completá-la com evidência (foto) e causar dano no oponente.');
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      return task;
    },
    onSuccess: async (task) => {
      if (profile && task) {
        await addXp(task.xp_reward);
        await addGold(task.gold_reward);
        await addMana(calculateManaGain(task.difficulty, profile.player_class));

        // Deal damage to raid boss if in an active raid
        if (myActiveRaid) {
          const damage = profile.level * DIFFICULTY_MULTIPLIERS[task.difficulty];
          await dealDamageToBoss(myActiveRaid.id, damage, task.title);
          toast.success(
            `✅ Tarefa completada! +${task.xp_reward} XP, +${task.gold_reward} Ouro, ⚔️ ${damage} dmg ao Boss!`
          );
        } else {
          toast.success(
            `✅ Tarefa completada! +${task.xp_reward} XP, +${task.gold_reward} Ouro`
          );
        }
      }
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('Not authenticated');

      // 1. Check if the task is linked to an ACTIVE or SELECTING duel
      const { data: activePvP } = await supabase
        .from('pvp_selected_tasks')
        .select('duel_id, pvp_duels(status)')
        .eq('task_id', taskId)
        .maybeSingle();

      // @ts-ignore - pvp_duels relationship
      if (activePvP && ['active', 'selecting'].includes(activePvP.pvp_duels?.status)) {
        throw new Error('Esta tarefa está travada em um duelo PvP ativo e não pode ser excluída até o duelo terminar.');
      }

      // 2. Remove references in pvp_selected_tasks (only for finished/cancelled duels)
      await supabase
        .from('pvp_selected_tasks')
        .delete()
        .eq('task_id', taskId);

      // 2. Delete the actual task
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast.success('🗑️ Tarefa removida');
    },
    onError: (error: any) => {
      console.error("Erro ao deletar tarefa:", error);
      if (error.code === '23503') {
        toast.error('❌ Esta tarefa ainda possui vínculos ativos no sistema e não pode ser excluída.');
      } else {
        toast.error('❌ Erro ao excluir tarefa: ' + (error.message || 'Erro desconhecido'));
      }
    },
  });

  const failTask = async (task: Task) => {
    if (!profile) return;

    const damage = calculateDamage(profile.level, task.difficulty, profile.player_class);

    await supabase
      .from('tasks')
      .update({ status: 'failed' })
      .eq('id', task.id);

    await takeDamage(damage);

    toast.error(`💔 Tarefa falhou! Você recebeu ${damage} de dano.`);
    queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
  };

  return {
    tasks,
    pendingTasks,
    completedTasks,
    isLoading,
    canCreateTask,
    createTask: createTask.mutate,
    completeTask: completeTask.mutate,
    deleteTask: deleteTask.mutate,
    failTask,
    isCreating: createTask.isPending,
    isCompleting: completeTask.isPending,
    isDeleting: deleteTask.isPending,
  };
}
