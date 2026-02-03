import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Friend, OnlineStatus } from '@/types/social';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function useFriends() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch friends
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (error) throw error;
      return data as Friend[];
    },
    enabled: !!user,
  });

  // Fetch online statuses
  const { data: onlineStatuses = [] } = useQuery({
    queryKey: ['online_status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('online_status')
        .select('*');

      if (error) throw error;
      return data as OnlineStatus[];
    },
    enabled: !!user,
  });

  // Update own online status
  useEffect(() => {
    if (!user) return;

    const updateStatus = async (online: boolean) => {
      await supabase
        .from('online_status')
        .upsert({
          user_id: user.id,
          is_online: online,
          last_seen: new Date().toISOString(),
        });
    };

    // Set online
    updateStatus(true);

    // Update periodically
    const interval = setInterval(() => updateStatus(true), 60000);

    // Set offline on unmount
    return () => {
      clearInterval(interval);
      updateStatus(false);
    };
  }, [user]);

  // Realtime subscription for online status
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('online-status-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'online_status' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['online_status'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Search user by email or username
  const searchUserByEmail = async (query: string) => {
    // Try to call RPC first for email + username search
    // @ts-ignore
    const { data, error } = await supabase
      .rpc('search_profiles', { search_query: query });

    if (error) {
      console.warn("RPC unavailable, falling back to username search:", error);
      // Fallback for if they haven't run the SQL yet
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .ilike('username', `%${query}%`)
        .limit(10);

      if (fallbackError) throw fallbackError;
      return fallbackData;
    }

    return data;
  };

  // Send friend request
  const sendFriendRequest = useMutation({
    mutationFn: async (friendId: string) => {
      if (!user) throw new Error('Not authenticated');

      if (friendId === user.id) {
        throw new Error('Você não pode adicionar a si mesmo');
      }

      // Check if already friends
      const existing = friends.find(
        f => (f.user_id === user.id && f.friend_id === friendId) ||
          (f.friend_id === user.id && f.user_id === friendId)
      );

      if (existing) {
        throw new Error('Já existe uma solicitação de amizade');
      }

      const { error } = await supabase.from('friends').insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('📨 Solicitação enviada!');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  // Accept friend request
  const acceptFriendRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('🤝 Amizade aceita!');
    },
  });

  // Reject friend request
  const rejectFriendRequest = useMutation({
    mutationFn: async (friendshipId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Solicitação rejeitada');
    },
  });

  // Remove friend
  const removeFriend = useMutation({
    mutationFn: async (friendshipId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Amigo removido');
    },
  });

  // Filter friends
  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(
    f => f.status === 'pending' && f.friend_id === user?.id
  );
  const sentRequests = friends.filter(
    f => f.status === 'pending' && f.user_id === user?.id
  );

  // Check if user is online
  const isUserOnline = (userId: string) => {
    const status = onlineStatuses.find(s => s.user_id === userId);
    if (!status) return false;

    // Consider online if last seen within 2 minutes
    const lastSeen = new Date(status.last_seen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeen.getTime()) / 60000;
    return status.is_online && diffMinutes < 2;
  };

  return {
    friends: acceptedFriends,
    pendingRequests,
    sentRequests,
    friendsLoading,
    searchUsers: searchUserByEmail,
    sendFriendRequest: sendFriendRequest.mutateAsync,
    acceptFriendRequest: acceptFriendRequest.mutateAsync,
    rejectFriendRequest: rejectFriendRequest.mutateAsync,
    removeFriend: removeFriend.mutateAsync,
    isUserOnline,
  };
}
