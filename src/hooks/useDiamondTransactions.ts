import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export interface DiamondTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'spent' | 'purchased' | 'refunded' | 'bonus';
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  balance_after: number;
  created_at: string;
}

export function useDiamondTransactions() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['diamond-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('diamond_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as DiamondTransaction[];
    },
    enabled: !!user,
  });

  const recordTransaction = useMutation({
    mutationFn: async ({
      amount,
      type,
      description,
      referenceId,
      referenceType,
    }: {
      amount: number;
      type: DiamondTransaction['transaction_type'];
      description: string;
      referenceId?: string;
      referenceType?: string;
    }) => {
      if (!user || !profile) throw new Error('Não autenticado');

      const balanceAfter = type === 'spent' 
        ? profile.diamonds - Math.abs(amount)
        : profile.diamonds + Math.abs(amount);

      const { data, error } = await supabase
        .from('diamond_transactions')
        .insert({
          user_id: user.id,
          amount: type === 'spent' ? -Math.abs(amount) : Math.abs(amount),
          transaction_type: type,
          description,
          reference_id: referenceId || null,
          reference_type: referenceType || null,
          balance_after: balanceAfter,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diamond-transactions', user?.id] });
    },
  });

  return {
    transactions,
    isLoading,
    recordTransaction: recordTransaction.mutateAsync,
  };
}
