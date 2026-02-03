import { useState, useEffect } from 'react';
import { useFriends } from '@/hooks/useFriends';
import { useRaids } from '@/hooks/useRaids';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PixelAvatar } from '@/components/game/PixelAvatar';
import { PrivateChatDialog } from './PrivateChatDialog';
import { ChallengeFriendButton } from '@/components/pvp/ChallengeFriendButton';
import { supabase } from '@/integrations/supabase/client';
import { FriendHoverCard } from './FriendHoverCard';
import { Search, UserPlus, Check, X, UserMinus, Circle, MessageCircle, Swords } from 'lucide-react';
import { toast } from 'sonner';

export function FriendsPanel() {
  const { user } = useAuth();
  const {
    friends,
    pendingRequests,
    sentRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    isUserOnline,
    friendsLoading
  } = useFriends();
  const { myActiveRaid, inviteByEmail } = useRaids();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ user_id: string; username: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendProfiles, setFriendProfiles] = useState<Record<string, Profile>>({});

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Profile | null>(null);

  // Get all user IDs we need profiles for
  const allUserIds = [
    ...friends.map(f => f.user_id === user?.id ? f.friend_id : f.user_id),
    ...pendingRequests.map(f => f.user_id),
    ...sentRequests.map(f => f.friend_id),
  ];

  // Fetch profiles for friends
  useEffect(() => {
    const fetchProfiles = async () => {
      if (allUserIds.length === 0) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', allUserIds);

      if (data) {
        const profileMap: Record<string, Profile> = {};
        data.forEach(p => {
          profileMap[p.user_id] = p as Profile;
        });
        setFriendProfiles(profileMap);
      }
    };

    fetchProfiles();
  }, [friends, pendingRequests, sentRequests]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      // Filter out self and existing friends
      const resultsArray = (results as any) || [];
      const filtered = resultsArray.filter(
        (r: any) => r.user_id !== user?.id &&
          !friends.some(f => f.user_id === r.user_id || f.friend_id === r.user_id)
      ) as { user_id: string; username: string }[];
      setSearchResults(filtered);

      if (filtered.length === 0) {
        toast.info('Nenhum usuário encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar usuários');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (friendId: string) => {
    try {
      await sendFriendRequest(friendId);
      setSearchResults(prev => prev.filter(r => r.user_id !== friendId));
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRaidInvite = async (friendUsername: string) => {
    if (!myActiveRaid) return;
    try {
      await inviteByEmail(myActiveRaid.id, friendUsername);
      toast.success(`Convite de Raid enviado para ${friendUsername}!`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao convidar para raid');
    }
  };

  const openChat = (profile: Profile) => {
    setSelectedFriend(profile);
    setChatOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Private Chat Dialog */}
      <PrivateChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        friend={selectedFriend}
        isOnline={selectedFriend ? isUserOnline(selectedFriend.user_id) : false}
      />

      {/* Search and Share */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Nome de Usuário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 text-[10px] pixel-border"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="pixel-button text-[10px]"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Share Button Section */}
        <div className="pixel-border bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-white glow-gold">Recrutar Aliados</span>
              <span className="text-[7px] text-zinc-400 uppercase tracking-tighter">Convide amigos para o TasKLegends</span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                const shareData = {
                  title: 'TasKLegends',
                  text: 'Venha transformar suas tarefas em uma aventura épica comigo no TasKLegends! ⚔️🛡️',
                  url: window.location.origin,
                };

                if (navigator.share) {
                  navigator.share(shareData).catch(() => {
                    navigator.clipboard.writeText(shareData.url);
                    toast.success('Link copiado para convidar amigos!');
                  });
                } else {
                  navigator.clipboard.writeText(shareData.url);
                  toast.success('Link de convite copiado!');
                }
              }}
              className="pixel-button bg-accent hover:bg-accent/80 text-black text-[9px] font-black h-8 px-4 animate-pulse-glow"
            >
              <span className="mr-1">🔗</span> COMPARTILHAR
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-muted-foreground">Resultados</h3>
          {searchResults.map((result) => (
            <Card key={result.user_id} className="pixel-border">
              <CardContent className="p-2 flex items-center justify-between">
                <span className="text-[10px]">{result.username}</span>
                <Button
                  size="sm"
                  onClick={() => handleSendRequest(result.user_id)}
                  className="pixel-button text-[8px] h-6"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Adicionar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
            📨 Solicitações Pendentes
            <Badge variant="secondary" className="text-[8px]">
              {pendingRequests.length}
            </Badge>
          </h3>
          {pendingRequests.map((request) => {
            const profile = friendProfiles[request.user_id];
            return (
              <Card key={request.id} className="pixel-border">
                <CardContent className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 pixel-border bg-muted p-0.5">
                      {profile && (
                        <PixelAvatar
                          playerClass={profile.player_class}
                          equippedHat={profile.equipped_hat}
                          equippedArmor={profile.equipped_armor}
                          equippedWeapon={profile.equipped_weapon}
                          equippedShield={profile.equipped_shield}
                          equippedLegs={profile.equipped_legs}
                          equippedAccessory={profile.equipped_accessory}
                          equippedBackground={profile.equipped_background}
                          size={28}
                        />
                      )}
                    </div>
                    <span className="text-[10px]">{profile?.username || '...'}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => acceptFriendRequest(request.id)}
                      className="h-6 w-6 text-accent"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => rejectFriendRequest(request.id)}
                      className="h-6 w-6 text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-muted-foreground">
            ⏳ Aguardando Resposta
          </h3>
          {sentRequests.map((request) => {
            const profile = friendProfiles[request.friend_id];
            return (
              <Card key={request.id} className="pixel-border opacity-70">
                <CardContent className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 pixel-border bg-muted p-0.5">
                      {profile && (
                        <PixelAvatar
                          playerClass={profile.player_class}
                          equippedHat={profile.equipped_hat}
                          equippedArmor={profile.equipped_armor}
                          equippedWeapon={profile.equipped_weapon}
                          equippedShield={profile.equipped_shield}
                          equippedLegs={profile.equipped_legs}
                          equippedAccessory={profile.equipped_accessory}
                          equippedBackground={profile.equipped_background}
                          size={28}
                        />
                      )}
                    </div>
                    <span className="text-[10px]">{profile?.username || '...'}</span>
                  </div>
                  <Badge variant="outline" className="text-[8px]">
                    Pendente
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-muted-foreground">
          👥 Amigos ({friends.length})
        </h3>

        {friends.length === 0 ? (
          <Card className="pixel-border p-4 text-center">
            <p className="text-[10px] text-muted-foreground">
              Você ainda não tem amigos
            </p>
            <p className="text-[8px] text-muted-foreground mt-1">
              Busque usuários pelo nome para adicionar!
            </p>
          </Card>
        ) : (
          friends.map((friendship) => {
            const friendId = friendship.user_id === user?.id
              ? friendship.friend_id
              : friendship.user_id;
            const profile = friendProfiles[friendId];
            const online = isUserOnline(friendId);

            return (
              <Card key={friendship.id} className="pixel-border hover:pixel-border-gold transition-all cursor-pointer">
                <CardContent className="p-2 flex items-center justify-between">
                  {/* Hover Card Wrapper */}
                  <FriendHoverCard profile={profile || null} online={online}>
                    <div
                      className="flex items-center gap-2 flex-1"
                      onClick={() => profile && openChat(profile)}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 pixel-border bg-muted p-0.5">
                          {profile && (
                            <PixelAvatar
                              playerClass={profile.player_class}
                              equippedHat={profile.equipped_hat}
                              equippedArmor={profile.equipped_armor}
                              equippedWeapon={profile.equipped_weapon}
                              equippedShield={profile.equipped_shield}
                              equippedLegs={profile.equipped_legs}
                              equippedAccessory={profile.equipped_accessory}
                              equippedBackground={profile.equipped_background}
                              equippedSkin={profile.equipped_skin}
                              equippedMount={profile.equipped_mount}
                              size={36}
                            />
                          )}
                        </div>
                        {/* Online indicator */}
                        <Circle
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-current ${online ? 'text-accent fill-accent' : 'text-muted-foreground fill-muted-foreground'
                            }`}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold">{profile?.username || '...'}</p>
                        <p className="text-[8px] text-muted-foreground capitalize flex items-center gap-1">
                          Nv. {profile?.level || 1} • {profile?.player_class ? <span className="text-primary font-bold">{profile.player_class}</span> : '...'}
                        </p>
                      </div>
                    </div>
                  </FriendHoverCard>
                  <div className="flex gap-1">
                    <ChallengeFriendButton friendId={friendId} />
                    {myActiveRaid && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => profile && handleRaidInvite(profile.username)}
                        className="h-7 w-7 text-gold hover:bg-gold/20"
                        title="Convidar para Raid"
                      >
                        <Swords className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => profile && openChat(profile)}
                      className="h-7 w-7 text-primary hover:bg-primary/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFriend(friendship.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
