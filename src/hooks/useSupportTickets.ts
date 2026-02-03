import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type TicketType = 'complaint' | 'bug' | 'user_report' | 'redemption_issue';

export interface SupportTicket {
  id: string;
  user_id: string;
  ticket_type: TicketType;
  transaction_id: string | null;
  reported_user_id: string | null;
  duel_id: string | null;
  subject: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  created_at: string;
  resolved_at: string | null;
}

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  complaint: 'Reclamação',
  bug: 'Denúncia de Bug',
  user_report: 'Denúncia de Usuário',
  redemption_issue: 'Problema com Resgate',
};

export function useSupportTickets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['support_tickets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('[Support Debug] Fetched tickets from DB:', data);
      return data as SupportTicket[];
    },
    enabled: !!user,
    refetchInterval: 5000, // Sync every 5 seconds
  });

  const createTicket = useMutation({
    mutationFn: async (ticket: {
      ticket_type: TicketType;
      subject: string;
      description: string;
      transaction_id?: string;
      reported_user_id?: string;
      duel_id?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const supabaseUrl = (supabase as any).supabaseUrl;
      console.log('[Support Debug] App is sending to:', decodeURIComponent(supabaseUrl));
      console.log('[Support Debug] Sending ticket:', ticket);

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          ticket_type: ticket.ticket_type,
          subject: ticket.subject,
          description: ticket.description,
          transaction_id: ticket.transaction_id || null,
          reported_user_id: ticket.reported_user_id || null,
          duel_id: ticket.duel_id || null,
          status: 'open'
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets', user?.id] });
      toast.success('📨 Ticket enviado! Nossa equipe irá analisar em breve.');
    },
    onError: () => {
      toast.error('Erro ao enviar ticket');
    },
  });

  const reportPlayer = async (reportedUserId: string, duelId: string, reason: string) => {
    return createTicket.mutateAsync({
      ticket_type: 'user_report',
      subject: 'Denúncia de Jogador no PvP',
      description: reason,
      reported_user_id: reportedUserId,
      duel_id: duelId,
    });
  };

  return {
    tickets,
    isLoading,
    createTicket: createTicket.mutate,
    reportPlayer,
    isCreating: createTicket.isPending,
  };
}
