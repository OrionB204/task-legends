import { useState, useEffect } from 'react';
import { useRaids } from '@/hooks/useRaids';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, Profile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatBox } from './ChatBox';
import { RaidManagement } from './RaidManagement';
import { BossDisplay } from '@/components/game/BossDisplay';
import { PixelAvatar } from '@/components/game/PixelAvatar';
import { Raid, RaidMember, BOSS_TEMPLATES } from '@/types/social';
import { supabase } from '@/integrations/supabase/client';
import { Swords, Users, Clock, Plus, LogOut, Crown, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RaidPanel() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const {
    raids,
    myActiveRaid,
    myRaidMemberships,
    createRaid,
    joinRaid,
    leaveRaid,
    deleteRaid,
    getRaidMembers,
    damageLogs,
    isCreating
  } = useRaids();

  const [createOpen, setCreateOpen] = useState(false);
  const [newRaidName, setNewRaidName] = useState('');
  const [selectedBoss, setSelectedBoss] = useState('0');
  const [raidMembers, setRaidMembers] = useState<RaidMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Record<string, Profile>>({});

  // Fetch raid members when active raid changes
  const refreshMembers = async () => {
    if (myActiveRaid) {
      const members = await getRaidMembers(myActiveRaid.id);
      setRaidMembers(members);
    } else {
      setRaidMembers([]);
    }
  };

  useEffect(() => {
    refreshMembers();
  }, [myActiveRaid]);

  // Fetch member profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      if (raidMembers.length === 0) return;

      const userIds = raidMembers.map(m => m.user_id);
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
  }, [raidMembers]);

  const handleCreate = () => {
    if (!newRaidName.trim()) return;
    createRaid({ name: newRaidName, bossIndex: parseInt(selectedBoss) });
    setNewRaidName('');
    setCreateOpen(false);
  };

  const getBossEmoji = (bossName: string) => {
    const boss = BOSS_TEMPLATES.find(b => b.name === bossName);
    return boss?.emoji || '👹';
  };

  const usernamesMap = Object.fromEntries(
    Object.entries(memberProfiles).map(([id, p]) => [id, p.username])
  );

  // Calculate average level for boss scaling
  const averageLevel = raidMembers.length > 0
    ? Object.values(memberProfiles).reduce((sum, p) => sum + (p?.level || 1), 0) / raidMembers.length
    : 1;

  const isLeader = myActiveRaid?.leader_id === user?.id;

  // If user is in an active raid, show raid details
  if (myActiveRaid) {
    const deadline = new Date(myActiveRaid.deadline);
    const isExpired = deadline < new Date();

    return (
      <div className="space-y-4">
        {/* Boss Display - Large and prominent */}
        <BossDisplay raid={myActiveRaid} averageLevel={averageLevel} />

        {/* Raid Info & Management */}
        <Card className="pixel-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[12px] flex items-center gap-2">
                <Swords className="w-4 h-4 text-primary" />
                {myActiveRaid.name}
                {isLeader && <Crown className="w-3 h-3 text-primary" />}
              </CardTitle>
              <div className="flex gap-2">
                {isLeader && (
                  <RaidManagement
                    raid={myActiveRaid}
                    members={raidMembers}
                    memberProfiles={memberProfiles}
                    onMemberRemoved={refreshMembers}
                    onMemberAdded={refreshMembers}
                  />
                )}
                {isLeader && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (window.confirm("⚠️ EXCLUIR RAID? Todos os membros serão removidos e a missão será encerrada. Tem certeza?")) {
                        deleteRaid(myActiveRaid.id);
                      }
                    }}
                    className="text-[8px] text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Excluir
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("⚠️ VOCÊ PERDERÁ 40% DE HP E 50% DE OURO se abandonar a raid agora! Tem certeza que deseja ser um desertor?")) {
                      leaveRaid(myActiveRaid.id);
                    }
                  }}
                  className="text-[8px] text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  Sair
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Deadline */}
            <div className="flex items-center gap-2 text-[8px]">
              <Clock className="w-3 h-3" />
              <span className={isExpired ? 'text-destructive' : 'text-muted-foreground'}>
                {isExpired
                  ? 'Prazo expirado!'
                  : `Termina ${formatDistanceToNow(deadline, { locale: ptBR, addSuffix: true })}`
                }
              </span>
            </div>

            {/* Members - Large avatars side by side */}
            <div className="space-y-2">
              <p className="text-[8px] text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                Membros ({raidMembers.length}/5)
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {raidMembers.map((member) => {
                  const memberProfile = memberProfiles[member.user_id];
                  const isMemberLeader = member.user_id === myActiveRaid.leader_id;

                  return (
                    <div key={member.id} className="flex flex-col items-center">
                      <div className="relative">
                        <div className="w-14 h-14 pixel-border bg-muted p-1">
                          {memberProfile && (
                            <PixelAvatar
                              playerClass={memberProfile.player_class}
                              equippedHat={memberProfile.equipped_hat}
                              equippedSkin={memberProfile.equipped_skin}
                              equippedMount={memberProfile.equipped_mount}
                              size={48}
                            />
                          )}
                        </div>
                        {isMemberLeader && (
                          <Crown className="absolute -top-1 -right-1 w-4 h-4 text-primary bg-background rounded-full p-0.5" />
                        )}
                      </div>
                      <span className="text-[7px] text-center mt-1 max-w-14 truncate">
                        {memberProfile?.username || '...'}
                      </span>
                      <span className="text-[6px] text-muted-foreground">
                        Nv. {memberProfile?.level || 1}
                      </span>
                      <span className="text-[7px] text-accent font-bold">
                        {member.damage_dealt} dmg
                      </span>
                    </div>
                  );
                })}
                {/* Empty slots */}
                {Array.from({ length: 5 - raidMembers.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-14 h-14 pixel-border bg-muted/30 flex items-center justify-center"
                  >
                    <span className="text-[10px] text-muted-foreground">?</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chat & Combat Log */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="pixel-border h-64">
            <CardHeader className="py-2">
              <CardTitle className="text-[10px]">💬 Chat da Raid</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-48">
              <ChatBox
                channelType="raid"
                channelId={myActiveRaid.id}
                usernames={usernamesMap}
              />
            </CardContent>
          </Card>

          <Card className="pixel-border h-64">
            <CardHeader className="py-2">
              <CardTitle className="text-[10px] flex items-center gap-2">
                <Swords className="w-3 h-3 text-destructive" />
                Log de Combate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 h-48 overflow-y-auto space-y-1">
              {damageLogs.length === 0 ? (
                <p className="text-[8px] text-muted-foreground text-center mt-4">Nenhum combate registrado.</p>
              ) : (
                damageLogs.map((log: any) => (
                  <div key={log.id} className="text-[8px] border-b border-muted/30 pb-1">
                    {log.type === 'player_to_boss' ? (
                      <p>
                        <span className="text-accent font-bold">{usernamesMap[log.user_id] || 'Herói'}</span> causou <span className="text-destructive font-bold">{log.damage_amount} dmg</span> ao boss completando "<span className="italic">{log.task_title}</span>"
                      </p>
                    ) : (
                      <p className="text-destructive">
                        🔥 <span className="font-bold">Boss</span> atacou <span className="font-bold">{usernamesMap[log.user_id] || 'Herói'}</span> por <span className="font-bold">{log.damage_amount} hp</span> (Falhou: {log.task_title})
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show available raids to join or create
  return (
    <div className="space-y-4">
      {/* Create Raid Button */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="w-full pixel-button text-[10px]">
            <Plus className="w-4 h-4 mr-2" />
            Criar Nova Raid
          </Button>
        </DialogTrigger>
        <DialogContent className="pixel-border">
          <DialogHeader>
            <DialogTitle className="text-[12px]">⚔️ Criar Raid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome da Raid"
              value={newRaidName}
              onChange={(e) => setNewRaidName(e.target.value)}
              className="pixel-border text-[10px]"
            />
            <Select value={selectedBoss} onValueChange={setSelectedBoss}>
              <SelectTrigger className="pixel-border text-[10px]">
                <SelectValue placeholder="Escolha o Boss" />
              </SelectTrigger>
              <SelectContent>
                {BOSS_TEMPLATES.map((boss, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-[10px]">
                    {boss.emoji} {boss.name} (HP: {boss.hp})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !newRaidName.trim()}
              className="w-full pixel-button text-[10px]"
            >
              Criar Raid
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Available Raids */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold text-muted-foreground">Raids Disponíveis</h3>

        {raids.length === 0 ? (
          <Card className="pixel-border p-4 text-center">
            <p className="text-[10px] text-muted-foreground">
              Nenhuma raid ativa no momento
            </p>
            <p className="text-[8px] text-muted-foreground mt-1">
              Crie uma raid e convide seus amigos!
            </p>
          </Card>
        ) : (
          raids.map((raid) => {
            const isJoined = myRaidMemberships.some(m => m.raid_id === raid.id);
            const hpPercentage = (raid.boss_current_hp / raid.boss_max_hp) * 100;

            return (
              <Card key={raid.id} className="pixel-border">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl" style={{ imageRendering: 'pixelated' }}>
                        {getBossEmoji(raid.boss_name)}
                      </span>
                      <div>
                        <p className="text-[10px] font-bold">{raid.name}</p>
                        <p className="text-[8px] text-muted-foreground">{raid.boss_name}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => joinRaid(raid.id)}
                      disabled={isJoined}
                      className="pixel-button text-[8px]"
                    >
                      {isJoined ? 'Já está' : 'Entrar'}
                    </Button>
                  </div>
                  {/* Boss HP mini bar */}
                  <div className="h-3 pixel-border bg-muted overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-destructive"
                      style={{ width: `${hpPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-[6px] text-muted-foreground">
                    <span>HP: {raid.boss_current_hp}/{raid.boss_max_hp}</span>
                    <span>
                      Termina {format(new Date(raid.deadline), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </span>
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
