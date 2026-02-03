import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RedeemResult {
  success: boolean;
  error?: string;
  diamonds_added?: number;
  new_balance?: number;
}

export function useDiamondCodes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const redeemCode = useMutation({
    mutationFn: async (code: string): Promise<RedeemResult> => {
      if (!user) throw new Error('Faça login para resgatar códigos');

      const trimmedCode = code.trim().toUpperCase();
      
      if (!trimmedCode) {
        throw new Error('Digite um código válido');
      }

      // Call the secure RPC function
      const { data, error } = await supabase.rpc('redeem_diamond_code', {
        code_input: trimmedCode,
      });

      if (error) {
        throw new Error('Erro ao resgatar código. Tente novamente.');
      }

      const result = data as unknown as RedeemResult;
      
      if (!result.success) {
        throw new Error(result.error || 'Código inválido');
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['diamond-transactions', user?.id] });
      toast.success(`💎 ${result.diamonds_added} diamantes adicionados! Novo saldo: ${result.new_balance}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    redeemCode: redeemCode.mutate,
    redeemCodeAsync: redeemCode.mutateAsync,
    isRedeeming: redeemCode.isPending,
  };
}
