import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Guild, GuildMember, GuildAnnouncement } from '@/types/social';
import { toast } from 'sonner';

export function useGuilds() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all guilds
  const { data: guilds = [], isLoading: guildsLoading } = useQuery({
    queryKey: ['guilds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guilds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Guild[];
    },
    enabled: !!user,
  });

  // Fetch user's guild membership
  const { data: myGuildMembership } = useQuery({
    queryKey: ['guild_members', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('guild_members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as GuildMember | null;
    },
    enabled: !!user,
  });

  // Get the user's guild
  const myGuild = guilds.find(g => g.id === myGuildMembership?.guild_id);

  // Fetch guild announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['guild_announcements', myGuild?.id],
    queryFn: async () => {
      if (!myGuild) return [];
      const { data, error } = await supabase
        .from('guild_announcements')
        .select('*')
        .eq('guild_id', myGuild.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as GuildAnnouncement[];
    },
    enabled: !!myGuild,
  });

  // Get members of a guild
  const getGuildMembers = async (guildId: string): Promise<GuildMember[]> => {
    const { data, error } = await supabase
      .from('guild_members')
      .select('*')
      .eq('guild_id', guildId);

    if (error) throw error;
    return data as GuildMember[];
  };

  // Create a new guild
  const createGuild = useMutation({
    mutationFn: async ({ name, description, emblemColor }: { name: string; description: string; emblemColor: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data: guild, error } = await supabase
        .from('guilds')
        .insert({
          name,
          description,
          emblem_color: emblemColor,
          leader_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as leader
      await supabase.from('guild_members').insert({
        guild_id: guild.id,
        user_id: user.id,
        role: 'leader',
      });

      return guild;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guilds'] });
      queryClient.invalidateQueries({ queryKey: ['guild_members'] });
      toast.success('🏰 Guilda criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar guilda: ' + error.message);
    },
  });

  // Join a guild
  const joinGuild = useMutation({
    mutationFn: async (guildId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if already in a guild
      if (myGuildMembership) {
        throw new Error('Você já faz parte de uma guilda');
      }

      // 1. Check guild member count before joining
      const { count, error: countError } = await supabase
        .from('guild_members')
        .select('*', { count: 'exact', head: true })
        .eq('guild_id', guildId);

      if (countError) throw countError;

      if (count !== null && count >= 20) {
        throw new Error('Esta guilda já atingiu o limite máximo de 20 membros');
      }

      const { error } = await supabase.from('guild_members').insert({
        guild_id: guildId,
        user_id: user.id,
        role: 'member',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild_members'] });
      queryClient.invalidateQueries({ queryKey: ['guild_ranking'] });
      toast.success('🎉 Você entrou na guilda!');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  // Leave guild
  const leaveGuild = useMutation({
    mutationFn: async () => {
      if (!user || !myGuildMembership) throw new Error('Not in a guild');

      const { error } = await supabase
        .from('guild_members')
        .delete()
        .eq('guild_id', myGuildMembership.guild_id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild_members'] });
      toast.success('Você saiu da guilda');
    },
  });

  // Post announcement
  const postAnnouncement = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !myGuild) throw new Error('Not in a guild');

      const { error } = await supabase.from('guild_announcements').insert({
        guild_id: myGuild.id,
        author_id: user.id,
        content,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild_announcements'] });
      toast.success('Anúncio publicado!');
    },
  });

  const { data: guildRanking = [], isLoading: rankingLoading } = useQuery({
    queryKey: ['guild_ranking'],
    queryFn: async () => {
      // 1. Fetch all guilds
      const { data: guildsData, error: guildsError } = await supabase
        .from('guilds')
        .select('*');

      if (guildsError) throw guildsError;

      // 2. Fetch all guild members
      const { data: membersData, error: membersError } = await supabase
        .from('guild_members')
        .select('guild_id, user_id');

      if (membersError) throw membersError;

      // 3. Fetch current_xp and level for all members to calculate total accumulated XP
      const userIds = membersData.map(m => m.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, current_xp, level')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Helper to calculate total XP based on level and current progress
      const calculateTotalXp = (level: number, currentXp: number) => {
        let total = 0;
        for (let i = 1; i < level; i++) {
          // Accurate xpForLevel lookup: (n² + 24n + 475) / 2
          const lvl = i + 1;
          total += Math.floor((lvl * lvl + 24 * lvl + 475) / 2);
        }
        return total + currentXp;
      };

      // 4. Aggregate XP and member counts
      const userTotalXp: Record<string, number> = {};
      profilesData.forEach(p => {
        userTotalXp[p.user_id] = calculateTotalXp(p.level, p.current_xp);
      });

      const guildTotalXp: Record<string, number> = {};
      const guildMemberCount: Record<string, number> = {};

      membersData.forEach(m => {
        const xp = userTotalXp[m.user_id] || 0;
        guildTotalXp[m.guild_id] = (guildTotalXp[m.guild_id] || 0) + xp;
        guildMemberCount[m.guild_id] = (guildMemberCount[m.guild_id] || 0) + 1;
      });

      // 5. Combine and sort
      return (guildsData || [])
        .map(guild => ({
          ...guild,
          total_xp: guildTotalXp[guild.id] || 0,
          member_count: guildMemberCount[guild.id] || 0
        }))
        .sort((a, b) => b.total_xp - a.total_xp);
    },
    enabled: !!user,
  });

  return {
    guilds,
    myGuild,
    myGuildMembership,
    announcements,
    guildRanking,
    guildsLoading: guildsLoading || rankingLoading,
    createGuild: createGuild.mutate,
    joinGuild: joinGuild.mutate,
    leaveGuild: leaveGuild.mutate,
    postAnnouncement: postAnnouncement.mutate,
    getGuildMembers,
    isCreating: createGuild.isPending,
  };
}
