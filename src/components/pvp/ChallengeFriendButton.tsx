import { Button } from '@/components/ui/button';
import { usePvP } from '@/hooks/usePvP';
import { Swords } from 'lucide-react';

interface ChallengeFriendButtonProps {
  friendId: string;
  disabled?: boolean;
}

export function ChallengeFriendButton({ friendId, disabled }: ChallengeFriendButtonProps) {
  const { challengeFriend, activeDuel } = usePvP();

  const handleChallenge = () => {
    challengeFriend(friendId);
  };

  // Disable if already in a duel
  const isDisabled = disabled || !!activeDuel;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleChallenge}
      disabled={isDisabled}
      className="h-7 px-2 pixel-button text-[8px] bg-destructive/20 hover:bg-destructive/40 text-destructive"
      title={isDisabled ? 'Você já está em um duelo' : 'Desafiar para PvP'}
    >
      <Swords className="w-3 h-3" />
    </Button>
  );
}
