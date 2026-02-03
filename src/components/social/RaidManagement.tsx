import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/hooks/useProfile';
import { Raid, RaidMember } from '@/types/social';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PixelAvatar } from '@/components/game/PixelAvatar';
import { Settings, UserPlus, X, Crown, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useRaids } from '@/hooks/useRaids';

interface RaidManagementProps {
  raid: Raid;
  members: RaidMember[];
  memberProfiles: Record<string, Profile>;
  onMemberRemoved: () => void;
  onMemberAdded: () => void;
}

export function RaidManagement({
  raid,
  members,
  memberProfiles,
  onMemberRemoved,
  onMemberAdded
}: RaidManagementProps) {
  const { user } = useAuth();
  const { inviteByEmail } = useRaids();
  const [open, setOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const isLeader = raid.leader_id === user?.id;

  if (!isLeader) return null;

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteByEmail(raid.id, inviteEmail);
      toast.success(`Convite enviado com sucesso!`);
      setInviteEmail('');
      onMemberAdded();
    } catch (error: any) {
      toast.error('Erro ao convidar: ' + error.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleKickMember = async (memberId: string, userId: string) => {
    if (userId === user?.id) {
      toast.error('Você não pode se remover');
      return;
    }

    try {
      const { error } = await supabase
        .from('raid_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Membro removido');
      onMemberRemoved();
    } catch (error: any) {
      toast.error('Erro ao remover: ' + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="pixel-button text-[8px]">
          <Settings className="w-3 h-3 mr-1" />
          Gerenciar Raid
        </Button>
      </DialogTrigger>
      <DialogContent className="pixel-border bg-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px] flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Gerenciar Raid: {raid.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Invite by email */}
          <div className="space-y-2">
            <label className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Convidar por nome de usuário
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o email do herói..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleInviteByEmail()}
                className="flex-1 text-[10px] pixel-border"
              />
              <Button
                onClick={handleInviteByEmail}
                disabled={isInviting || !inviteEmail.trim() || members.length >= 5}
                className="pixel-button text-[10px]"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[8px] text-muted-foreground">
              {members.length}/5 membros
            </p>
          </div>

          {/* Member list with kick buttons */}
          <div className="space-y-2">
            <label className="text-[10px] text-muted-foreground">
              Membros da Raid
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.map((member) => {
                const profile = memberProfiles[member.user_id];
                const isSelf = member.user_id === user?.id;
                const isLeaderMember = member.user_id === raid.leader_id;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 pixel-border bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 pixel-border bg-muted p-0.5">
                        {profile && (
                          <PixelAvatar
                            playerClass={profile.player_class}
                            size={28}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] flex items-center gap-1">
                          {profile?.username || '...'}
                          {isLeaderMember && (
                            <Crown className="w-3 h-3 text-primary" />
                          )}
                        </p>
                        <p className="text-[8px] text-muted-foreground">
                          Nv. {profile?.level || 1} • {member.damage_dealt} dmg
                        </p>
                      </div>
                    </div>

                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleKickMember(member.id, member.user_id)}
                        className="h-6 w-6 text-destructive hover:bg-destructive/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
