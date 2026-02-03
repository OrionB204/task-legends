import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export interface Redemption {
  id: string;
  user_id: string;
  code: string;
  diamonds_spent: number | null;
  legacy_gold_spent: number | null;
  real_value: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  pix_key: string | null;
  admin_code: string | null;
  email_sent: boolean;
  created_at: string;
  processed_at: string | null;
}

// Conversion rate: 10 diamonds = R$ 1,00
const DIAMONDS_TO_REAL = 10;
const MIN_DIAMOND_REDEMPTION = 50; // R$ 5,00 minimum

// Diamond packages for redemption
export const REDEMPTION_PACKAGES = [
  { diamonds: 50, value: 5, label: 'R$ 5,00' },
  { diamonds: 100, value: 10, label: 'R$ 10,00' },
  { diamonds: 200, value: 20, label: 'R$ 20,00' },
  { diamonds: 500, value: 50, label: 'R$ 50,00' },
];

export function useRedemptions() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: redemptions = [], isLoading } = useQuery({
    queryKey: ['redemptions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('redemption_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Redemption[];
    },
    enabled: !!user,
  });

  const hasPendingRedemption = redemptions.some((r) => r.status === 'pending' || r.status === 'processing');

  const createRedemption = useMutation({
    mutationFn: async ({ diamondAmount, pixKey }: { diamondAmount: number; pixKey: string }) => {
      if (!user || !profile) throw new Error('Não autenticado');

      if (diamondAmount < MIN_DIAMOND_REDEMPTION) {
        throw new Error(`Mínimo de ${MIN_DIAMOND_REDEMPTION} diamantes para resgate (R$ ${MIN_DIAMOND_REDEMPTION / DIAMONDS_TO_REAL},00)`);
      }

      if (profile.diamonds < diamondAmount) {
        throw new Error('Diamantes insuficientes!');
      }

      if (hasPendingRedemption) {
        throw new Error('Você já tem um resgate pendente. Aguarde o processamento.');
      }

      // Generate unique code using database function
      const { data: codeResult, error: codeError } = await supabase
        .rpc('generate_redemption_code');

      if (codeError) throw codeError;

      const realValue = diamondAmount / DIAMONDS_TO_REAL;

      // Create redemption record
      const { data: redemption, error: redemptionError } = await supabase
        .from('redemption_codes')
        .insert({
          user_id: user.id,
          code: codeResult,
          diamonds_spent: diamondAmount,
          legacy_gold_spent: 0,
          real_value: realValue,
          pix_key: pixKey,
        })
        .select()
        .single();

      if (redemptionError) throw redemptionError;

      // Deduct diamonds from profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ diamonds: profile.diamonds - diamondAmount })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Record transaction in diamond history
      await supabase
        .from('diamond_transactions')
        .insert({
          user_id: user.id,
          amount: -diamondAmount,
          transaction_type: 'spent',
          description: `Resgate de R$ ${realValue.toFixed(2)} via PIX`,
          reference_id: redemption.id,
          reference_type: 'redemption',
          balance_after: profile.diamonds - diamondAmount,
        });

      return redemption;
    },
    onSuccess: (redemption) => {
      queryClient.invalidateQueries({ queryKey: ['redemptions', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['diamond-transactions', user?.id] });
      toast.success(`💎 Resgate solicitado! Código: ${redemption.code}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    redemptions,
    isLoading,
    hasPendingRedemption,
    createRedemption: createRedemption.mutate,
    isCreating: createRedemption.isPending,
    DIAMONDS_TO_REAL,
    MIN_DIAMOND_REDEMPTION,
    REDEMPTION_PACKAGES,
  };
}
