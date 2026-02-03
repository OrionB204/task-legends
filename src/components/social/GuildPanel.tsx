import { useState, useEffect } from 'react';
import { useGuilds } from '@/hooks/useGuilds';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChatBox } from './ChatBox';
import { GuildMember } from '@/types/social';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Users, Plus, LogOut, Megaphone, Shield, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const EMBLEM_COLORS = [
  '#FFD700', '#FF4444', '#44FF44', '#4444FF',
  '#FF44FF', '#44FFFF', '#FF8800', '#8800FF'
];

export function GuildPanel() {
  const { user } = useAuth();
  const {
    guilds,
    myGuild,
    myGuildMembership,
    announcements,
    createGuild,
    joinGuild,
    leaveGuild,
    postAnnouncement,
    getGuildMembers,
    guildRanking,
    isCreating
  } = useGuilds();

  const [createOpen, setCreateOpen] = useState(false);
  const [newGuildName, setNewGuildName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(EMBLEM_COLORS[0]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, Profile>>({});

  // Fetch guild members
  useEffect(() => {
    if (myGuild) {
      getGuildMembers(myGuild.id).then(setGuildMembers);
    } else {
      setGuildMembers([]);
    }
  }, [myGuild]);

  // Fetch member profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      if (guildMembers.length === 0) return;

      const userIds = guildMembers.map(m => m.user_id);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      if (data) {
        const profileMap: Record<string, Profile> = {};
        data.forEach(p => {
          profileMap[p.user_id] = p as Profile;
        });
        setMemberProfiles(profileMap);
      }
    };

    fetchProfiles();
  }, [guildMembers]);

  const handleCreate = () => {
    if (!newGuildName.trim()) return;
    createGuild({
      name: newGuildName,
      description: newDescription,
      emblemColor: selectedColor
    });
    setNewGuildName('');
    setNewDescription('');
    setCreateOpen(false);
  };

  const handlePostAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    postAnnouncement(newAnnouncement);
    setNewAnnouncement('');
  };

  const usernamesMap = Object.fromEntries(
    Object.entries(memberProfiles).map(([id, p]) => [id, p.username])
  );

  // Main Render
  return (
    <div className="space-y-6">
      {myGuild ? (
        <div className="space-y-4">
          {/* Guild Header */}
          <Card className="pixel-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Pixel Emblem */}
                  <div
                    className="w-12 h-12 pixel-border flex items-center justify-center"
                    style={{ backgroundColor: myGuild.emblem_color }}
                  >
                    <Shield className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                  <div>
                    <CardTitle className="text-[12px] flex items-center gap-1">
                      {myGuild.name}
                      {myGuild.leader_id === user?.id && <Crown className="w-3 h-3 text-primary" />}
                    </CardTitle>
                    <p className="text-[8px] text-muted-foreground">
                      {myGuild.description || 'Sem descrição'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => leaveGuild()}
                  className="text-[8px] text-destructive"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Sair
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[8px] text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                {guildMembers.length} membros
              </p>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="pixel-border">
            <CardHeader className="py-2">
              <CardTitle className="text-[10px] flex items-center gap-1">
                <Megaphone className="w-4 h-4" />
                Mural de Avisos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Escrever aviso..."
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  className="flex-1 text-[10px] pixel-border h-8"
                />
                <Button
                  size="sm"
                  onClick={handlePostAnnouncement}
                  disabled={!newAnnouncement.trim()}
                  className="pixel-button text-[8px] h-8"
                >
                  Publicar
                </Button>
              </div>

              <div className="space-y-2 max-h-32 overflow-y-auto">
                {announcements.length === 0 ? (
                  <p className="text-[8px] text-muted-foreground text-center py-2">
                    Nenhum aviso ainda
                  </p>
                ) : (
                  announcements.map((ann) => {
                    const author = memberProfiles[ann.author_id];
                    return (
                      <div key={ann.id} className="bg-muted/50 p-2 rounded text-[8px]">
                        <div className="flex justify-between text-muted-foreground mb-1">
                          <span className="font-bold">{author?.username || 'Membro'}</span>
                          <span>
                            {format(new Date(ann.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p>{ann.content}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="pixel-border h-64">
            <CardHeader className="py-2">
              <CardTitle className="text-[10px]">💬 Chat da Guilda</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-48">
              <ChatBox
                channelType="guild"
                channelId={myGuild.id}
                usernames={usernamesMap}
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Create Guild Button */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full pixel-button text-[10px]">
                <Plus className="w-4 h-4 mr-2" />
                Criar Nova Guilda
              </Button>
            </DialogTrigger>
            <DialogContent className="pixel-border">
              <DialogHeader>
                <DialogTitle className="text-[12px]">🏰 Criar Guilda</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome da Guilda"
                  value={newGuildName}
                  onChange={(e) => setNewGuildName(e.target.value)}
                  className="pixel-border text-[10px]"
                />
                <Textarea
                  placeholder="Descrição (opcional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="pixel-border text-[10px]"
                  rows={2}
                />
                <div className="space-y-2">
                  <p className="text-[10px]">Cor do Brasão:</p>
                  <div className="flex gap-2 flex-wrap">
                    {EMBLEM_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 pixel-border ${selectedColor === color ? 'ring-2 ring-primary' : ''
                          }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !newGuildName.trim()}
                  className="w-full pixel-button text-[10px]"
                >
                  Criar Guilda
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Available Guilds */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-muted-foreground">Guildas Disponíveis</h3>
              <Badge variant="outline" className="text-[8px]">
                {guilds.length} Total
              </Badge>
            </div>

            {guilds.length === 0 ? (
              <Card className="pixel-border p-4 text-center">
                <p className="text-[10px] text-muted-foreground">
                  Nenhuma guilda disponível
                </p>
                <p className="text-[8px] text-muted-foreground mt-1">
                  Seja o primeiro a criar uma guilda!
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {guilds.slice(0, 3).map((guild) => (
                  <Card key={guild.id} className="pixel-border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 pixel-border flex items-center justify-center"
                            style={{ backgroundColor: guild.emblem_color }}
                          >
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold">{guild.name}</p>
                            <p className="text-[8px] text-muted-foreground flex items-center gap-1">
                              <Users className="w-2 h-2" />
                              {guildRanking.find(r => r.id === guild.id)?.member_count || 0}/20 membros
                            </p>
                          </div>
                        </div>
                        {(() => {
                          const memberCount = guildRanking.find(r => r.id === guild.id)?.member_count || 0;
                          const isFull = memberCount >= 20;

                          return (
                            <Button
                              size="sm"
                              onClick={() => joinGuild(guild.id)}
                              disabled={isFull}
                              className={cn(
                                "pixel-button text-[8px]",
                                isFull && "opacity-50 cursor-not-allowed bg-muted"
                              )}
                            >
                              {isFull ? 'Lotada' : 'Entrar'}
                            </Button>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guild Ranking (Always visible at the bottom) */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gold" />
          <h3 className="text-[10px] font-bold text-primary grow-gold uppercase tracking-tighter">Ranking: Elite de XP Acumulada</h3>
        </div>

        <div className="pixel-border bg-card/50 overflow-hidden">
          <table className="w-full text-left text-[8px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-2 font-bold">Pos</th>
                <th className="p-2 font-bold">Guilda</th>
                <th className="p-2 font-bold text-center">XP Total</th>
                <th className="p-2 font-bold text-right">Membros</th>
              </tr>
            </thead>
            <tbody>
              {(guildRanking || []).slice(0, 10).map((guild: any, index: number) => (
                <tr key={guild.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-2 font-bold text-muted-foreground flex items-center gap-1">
                    {index === 0 && <Crown className="w-3 h-3 text-gold" />}
                    #{index + 1}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 pixel-border" style={{ backgroundColor: guild.emblem_color }} />
                      <span className="font-bold">{guild.name}</span>
                    </div>
                  </td>
                  <td className="p-2 text-center font-black text-primary glow-gold">
                    {guild.total_xp.toLocaleString()}
                  </td>
                  <td className="p-2 text-right font-mono text-muted-foreground">
                    {guild.member_count}/20
                  </td>
                </tr>
              ))}
              {(!guildRanking || guildRanking.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground italic">
                    Nenhuma guilda no ranking ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
