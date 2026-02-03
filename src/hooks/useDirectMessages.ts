import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { toast } from 'sonner';

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export function useDirectMessages(friendId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages between current user and friend
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['direct_messages', user?.id, friendId],
    queryFn: async () => {
      if (!user || !friendId) return [];
      
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DirectMessage[];
    },
    enabled: !!user && !!friendId,
  });

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !friendId) throw new Error('Not authenticated');

      const { error } = await supabase.from('direct_messages').insert({
        sender_id: user.id,
        receiver_id: friendId,
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direct_messages', user?.id, friendId] });
    },
    onError: (error) => {
      toast.error('Erro ao enviar mensagem: ' + error.message);
    },
  });

  // Mark messages as read
  const markAsRead = async () => {
    if (!user || !friendId) return;

    await supabase
      .from('direct_messages')
      .update({ read: true })
      .eq('sender_id', friendId)
      .eq('receiver_id', user.id)
      .eq('read', false);
  };

  // Realtime subscription
  useEffect(() => {
    if (!user || !friendId) return;

    const channel = supabase
      .channel(`dm-${user.id}-${friendId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${friendId}),and(sender_id=eq.${friendId},receiver_id=eq.${user.id}))`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['direct_messages', user.id, friendId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, friendId, queryClient]);

  // Get unread count for a specific friend
  const getUnreadCount = async (fromUserId: string): Promise<number> => {
    if (!user) return 0;

    const { count } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', fromUserId)
      .eq('receiver_id', user.id)
      .eq('read', false);

    return count || 0;
  };

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    markAsRead,
    getUnreadCount,
  };
}
