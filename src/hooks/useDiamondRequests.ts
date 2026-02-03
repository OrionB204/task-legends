import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DiamondRequest {
    id: string;
    user_id: string;
    email: string;
    diamonds_amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
}

export function useDiamondRequests() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['diamond-requests', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('diamond_requests')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as DiamondRequest[];
        },
        enabled: !!user,
    });

    const createRequest = useMutation({
        mutationFn: async (amount: number) => {
            if (!user) throw new Error('Não autenticado');

            const { data, error } = await supabase
                .from('diamond_requests')
                .insert({
                    user_id: user.id,
                    email: user.email!,
                    diamonds_amount: amount,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diamond-requests', user?.id] });
            toast.success('Solicitação de diamantes enviada!');
        },
    });

    return {
        requests,
        isLoading,
        createRequest: createRequest.mutate,
        isCreating: createRequest.isPending,
    };
}
