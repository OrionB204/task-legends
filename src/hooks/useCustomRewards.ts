import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export interface CustomReward {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  gold_cost: number;
  times_purchased: number;
  created_at: string;
}

export function useCustomRewards() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const queryClient = useQueryClient();

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['custom_rewards', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('custom_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomReward[];
    },
    enabled: !!user,
  });

  const createReward = useMutation({
    mutationFn: async (reward: { name: string; description?: string; gold_cost: number }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('custom_rewards')
        .insert({
          user_id: user.id,
          name: reward.name,
          description: reward.description || null,
          gold_cost: reward.gold_cost,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_rewards', user?.id] });
      toast.success('🎁 Benefício criado!');
    },
    onError: () => {
      toast.error('Erro ao criar benefício');
    },
  });

  const purchaseReward = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user || !profile) throw new Error('Not authenticated');

      const reward = rewards.find((r) => r.id === rewardId);
      if (!reward) throw new Error('Benefício não encontrado');

      if (profile.gold < reward.gold_cost) {
        throw new Error('Ouro insuficiente!');
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('reward_purchases')
        .insert({
          user_id: user.id,
          reward_id: rewardId,
          gold_spent: reward.gold_cost,
        });

      if (purchaseError) throw purchaseError;

      // Update reward times_purchased
      const { error: rewardError } = await supabase
        .from('custom_rewards')
        .update({ times_purchased: reward.times_purchased + 1 })
        .eq('id', rewardId);

      if (rewardError) throw rewardError;

      // Deduct gold from profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ gold: profile.gold - reward.gold_cost })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      return reward;
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: ['custom_rewards', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success(`🎉 Você resgatou "${reward.name}"!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteReward = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('custom_rewards')
        .delete()
        .eq('id', rewardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_rewards', user?.id] });
      toast.success('🗑️ Benefício removido');
    },
  });

  return {
    rewards,
    isLoading,
    createReward: createReward.mutate,
    purchaseReward: purchaseReward.mutate,
    deleteReward: deleteReward.mutate,
    isCreating: createReward.isPending,
    isPurchasing: purchaseReward.isPending,
  };
}
