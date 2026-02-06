import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sendTicketEmail } from '@/lib/emailService';

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
      return data as SupportTicket[];
    },
    enabled: !!user,
    refetchInterval: 5000,
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

      console.log('[Support] Creating ticket:', ticket);

      // 1. Insert ticket into database
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
        .select()
        .single();

      if (error) {
        console.error('[Support] Error creating ticket:', error);
        throw error;
      }

      console.log('[Support] Ticket created:', data);

      // 2. Get user profile for email notification
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      // 3. Send email notification (simple EmailJS - no backend needed)
      try {
        await sendTicketEmail({
          ticketId: data.id,
          ticketType: ticket.ticket_type,
          subject: ticket.subject,
          description: ticket.description,
          userEmail: user.email || 'unknown',
          username: profile?.username || 'Usuário',
          transactionId: ticket.transaction_id,
          reportedUserId: ticket.reported_user_id,
          duelId: ticket.duel_id,
        });
        console.log('[Support] Email notification processed');
      } catch (emailErr) {
        console.error('[Support] Email notification error:', emailErr);
        // Don't throw - ticket was created, email is secondary
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets', user?.id] });
      toast.success('📨 Ticket enviado! Nossa equipe irá analisar em breve.');
    },
    onError: (error: any) => {
      console.error('[Support] Mutation error:', error);
      toast.error('Erro ao enviar ticket: ' + (error.message || 'Tente novamente'));
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

  // Close/archive a ticket
  const closeTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'closed' })
        .eq('id', ticketId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets', user?.id] });
      toast.success('✅ Ticket fechado!');
    },
    onError: () => {
      toast.error('Erro ao fechar ticket');
    },
  });

  return {
    tickets,
    isLoading,
    createTicket: createTicket.mutate,
    closeTicket: closeTicket.mutate,
    reportPlayer,
    isCreating: createTicket.isPending,
    isClosing: closeTicket.isPending,
  };
}
