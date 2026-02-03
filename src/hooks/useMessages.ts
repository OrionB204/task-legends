import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/social';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useMessages(channelType: 'raid' | 'guild', channelId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', channelType, channelId],
    queryFn: async () => {
      if (!channelId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_type', channelType)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user && !!channelId,
  });

  // Realtime subscription for messages
  useEffect(() => {
    if (!user || !channelId) return;

    const channel = supabase
      .channel(`messages-${channelType}-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            ['messages', channelType, channelId],
            (oldMessages: Message[] = []) => {
              const newMessage = payload.new as Message;
              // Avoid duplicates
              if (oldMessages.some(m => m.id === newMessage.id)) {
                return oldMessages;
              }
              return [...oldMessages, newMessage];
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, channelType, channelId, queryClient]);

  // Send message
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !channelId) throw new Error('Not ready');

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        content,
        channel_type: channelType,
        channel_id: channelId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelType, channelId] });
    },
    onError: (error: any) => {
      toast.error('Erro ao enviar mensagem: ' + error.message);
    }
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
  };
}
