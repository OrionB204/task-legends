import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { toast } from 'sonner';

export interface GiftCode {
  id: string;
  code: string;
  diamond_amount: number;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

export function useGiftCodes() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const redeemCode = useMutation({
    mutationFn: async (code: string) => {
      if (!user || !profile) throw new Error('Faça login para resgatar códigos');

      const trimmedCode = code.trim().toUpperCase();
      
      if (!trimmedCode) {
        throw new Error('Digite um código válido');
      }

      // Check if code exists and is unused
      const { data: giftCode, error: fetchError } = await supabase
        .from('gift_codes')
        .select('*')
        .eq('code', trimmedCode)
        .single();

      if (fetchError || !giftCode) {
        throw new Error('Código inválido ou não encontrado');
      }

      if (giftCode.is_used) {
        throw new Error('Este código já foi utilizado');
      }

      // Mark code as used
      const { error: updateError } = await supabase
        .from('gift_codes')
        .update({
          is_used: true,
          used_by: user.id,
          used_at: new Date().toISOString(),
        })
        .eq('id', giftCode.id)
        .eq('is_used', false); // Extra safety check

      if (updateError) {
        throw new Error('Erro ao resgatar código. Tente novamente.');
      }

      // Credit diamonds to user
      const newDiamondBalance = profile.diamonds + giftCode.diamond_amount;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ diamonds: newDiamondBalance })
        .eq('user_id', user.id);

      if (profileError) {
        throw new Error('Erro ao creditar diamantes. Entre em contato com o suporte.');
      }

      // Record transaction in diamond history
      await supabase
        .from('diamond_transactions')
        .insert({
          user_id: user.id,
          amount: giftCode.diamond_amount,
          transaction_type: 'purchased',
          description: `Código de ${giftCode.diamond_amount} diamantes resgatado`,
          reference_id: giftCode.id,
          reference_type: 'gift_code',
          balance_after: newDiamondBalance,
        });

      return giftCode;
    },
    onSuccess: (giftCode) => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['diamond-transactions', user?.id] });
      toast.success(`💎 Código de ${giftCode.diamond_amount} diamantes resgatado com sucesso!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    redeemCode: redeemCode.mutate,
    isRedeeming: redeemCode.isPending,
  };
}
