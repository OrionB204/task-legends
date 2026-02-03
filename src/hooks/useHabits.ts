import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { useRaids } from './useRaids';
import { HABIT_XP_REWARD, HABIT_HP_HEAL, HABIT_HP_DAMAGE, FREE_HABIT_LIMIT, DIFFICULTY_MULTIPLIERS } from '@/lib/gameFormulas';
import { toast } from 'sonner';
import { useEffect } from 'react';

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  is_positive: boolean;
  frequency: HabitFrequency;
  streak: number;
  times_completed: number;
  times_failed: number;
  last_completed: string | null;
  created_at: string;
}

export function useHabits() {
  const { user } = useAuth();
  const { profile, healHp, addXp, takeDamage } = useProfile();
  const { myActiveRaid, dealDamageToBoss } = useRaids();
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Habit[];
    },
    enabled: !!user,
  });

  // Automatic Periodic Check (Daily Reset)
  useEffect(() => {
    if (!user || habits.length === 0 || !profile || isLoading) return;

    const checkMissedHabits = async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Use localStorage to track the last time we checked for penalties to avoid double-dipping in the same day
      const lastCheckKey = `last_habit_check_${user.id}`;
      const lastCheckStr = localStorage.getItem(lastCheckKey);

      if (lastCheckStr === todayStr) return;

      let totalDamage = 0;
      const missedHabits: string[] = [];

      habits.forEach(habit => {
        if (!habit.last_completed) return; // Skip if never completed (no baseline)

        const lastCompleted = new Date(habit.last_completed);
        const diffMs = today.getTime() - lastCompleted.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let isMissed = false;
        if (habit.frequency === 'daily' && diffDays >= 2) {
          isMissed = true;
        } else if (habit.frequency === 'weekly' && diffDays >= 8) {
          isMissed = true;
        } else if (habit.frequency === 'monthly' && diffDays >= 31) {
          isMissed = true;
        }

        if (isMissed) {
          totalDamage += HABIT_HP_DAMAGE;
          missedHabits.push(habit.title);
        }
      });

      if (totalDamage > 0) {
        await takeDamage(totalDamage);
        toast.error(`🌘 Ciclo de Hábitos: Você recebeu ${totalDamage} de dano por não registrar: ${missedHabits.join(', ')}`);

        // Update stats in DB for the missed habits
        for (const habitTitle of missedHabits) {
          const habit = habits.find(h => h.title === habitTitle);
          if (habit) {
            await supabase
              .from('habits')
              .update({
                streak: 0,
                times_failed: habit.times_failed + 1
              })
              .eq('id', habit.id);
          }
        }
      }

      localStorage.setItem(lastCheckKey, todayStr);
    };

    checkMissedHabits();
  }, [habits, user?.id, profile?.id, isLoading]);


  const canCreateHabit = () => {
    if (!profile) return false;
    if (profile.is_pro) return true;
    return habits.length < FREE_HABIT_LIMIT;
  };

  const createHabit = useMutation({
    mutationFn: async (habit: { title: string; frequency?: HabitFrequency }) => {
      if (!user) throw new Error('Not authenticated');
      if (!canCreateHabit()) {
        throw new Error('Limite de hábitos gratuitos atingido. Faça upgrade para PRO!');
      }

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title: habit.title,
          frequency: habit.frequency ?? 'daily',
          is_positive: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
      toast.success('🔄 Hábito criado!');
    },
  });

  // Positive action (+) - Completed the habit
  const completePositive = useMutation({
    mutationFn: async (habitId: string) => {
      if (!user) throw new Error('Not authenticated');

      const habit = habits.find((h) => h.id === habitId);
      if (!habit) throw new Error('Hábito não encontrado');

      const today = new Date().toISOString().split('T')[0];
      const lastCompleted = habit.last_completed;

      // Check if already completed today
      if (lastCompleted === today) {
        throw new Error('Hábito já registrado hoje!');
      }

      // Calculate new streak
      let newStreak = 1;
      if (lastCompleted) {
        const lastDate = new Date(lastCompleted);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          newStreak = habit.streak + 1;
        }
      }

      const { error } = await supabase
        .from('habits')
        .update({
          last_completed: today,
          streak: newStreak,
          times_completed: habit.times_completed + 1,
        })
        .eq('id', habitId);

      if (error) throw error;

      return { habit, newStreak };
    },
    onSuccess: async ({ newStreak }) => {
      // Heal HP and add XP for positive habit
      const healAmount = HABIT_HP_HEAL + Math.min(newStreak, 5); // Streak bonus up to 5
      await healHp(healAmount, true);
      await addXp(HABIT_XP_REWARD);

      // Deal damage to raid boss if in an active raid
      if (myActiveRaid && profile) {
        const damage = profile.level * 2; // Base habit damage = level * 2
        await dealDamageToBoss(myActiveRaid.id, damage);
        toast.success(`💚 +${HABIT_XP_REWARD} XP, +${healAmount} HP, ⚔️ ${damage} dmg (Streak: ${newStreak} 🔥)`);
      } else {
        toast.success(`💚 +${HABIT_XP_REWARD} XP, +${healAmount} HP (Streak: ${newStreak} 🔥)`);
      }

      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Negative action (-) - Failed to do the habit
  const completeNegative = useMutation({
    mutationFn: async (habitId: string) => {
      if (!user) throw new Error('Not authenticated');

      const habit = habits.find((h) => h.id === habitId);
      if (!habit) throw new Error('Hábito não encontrado');

      const today = new Date().toISOString().split('T')[0];

      // Check if already registered today
      if (habit.last_completed === today) {
        throw new Error('Hábito já registrado hoje!');
      }

      const { error } = await supabase
        .from('habits')
        .update({
          last_completed: today,
          streak: 0, // Reset streak on failure
          times_failed: habit.times_failed + 1,
        })
        .eq('id', habitId);

      if (error) throw error;

      return habit;
    },
    onSuccess: async () => {
      // Take damage for failing the habit
      await takeDamage(HABIT_HP_DAMAGE);

      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
      toast.error(`💔 -${HABIT_HP_DAMAGE} HP (Streak perdido!)`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (habitId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('habits').delete().eq('id', habitId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.id] });
      toast.success('🗑️ Hábito removido');
    },
  });

  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.last_completed === today;
  };

  return {
    habits,
    isLoading,
    canCreateHabit: canCreateHabit(),
    createHabit: createHabit.mutate,
    completePositive: completePositive.mutate,
    completeNegative: completeNegative.mutate,
    deleteHabit: deleteHabit.mutate,
    isCompletedToday,
  };
}
