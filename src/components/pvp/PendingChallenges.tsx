import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePvP } from '@/hooks/usePvP';
import { Swords, Check, X } from 'lucide-react';

interface PendingChallengesProps {
  challenges: any[];
}

export function PendingChallenges({ challenges }: PendingChallengesProps) {
  const { acceptChallenge, declineChallenge } = usePvP();

  return (
    <div className="space-y-4">
      <div className="pixel-border bg-gradient-to-b from-primary/20 to-background p-4 text-center">
        <Swords className="w-8 h-8 mx-auto text-primary animate-bounce mb-2" />
        <h3 className="text-[12px] font-bold text-primary glow-gold">
          DESAFIOS PENDENTES!
        </h3>
        <p className="text-[9px] text-muted-foreground mt-1">
          Você foi desafiado para um duelo PvP!
        </p>
      </div>

      <div className="space-y-2">
        {challenges.map((challenge) => (
          <div 
            key={challenge.id}
            className="pixel-border bg-card p-4 animate-pulse-glow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 pixel-border bg-primary/20 flex items-center justify-center">
                  <Swords className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold">
                    {challenge.challenger?.username || 'Desafiante Desconhecido'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[7px]">
                      Nv. {challenge.challenger?.level ?? '?'}
                    </Badge>
                    <Badge variant="secondary" className="text-[7px] capitalize">
                      {challenge.challenger?.player_class || 'apprentice'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => declineChallenge(challenge.id)}
                className="flex-1 pixel-button text-[9px]"
              >
                <X className="w-3 h-3 mr-1" />
                Recusar
              </Button>
              <Button
                size="sm"
                onClick={() => acceptChallenge(challenge.id)}
                className="flex-1 pixel-button text-[9px] bg-accent hover:bg-accent/80"
              >
                <Check className="w-3 h-3 mr-1" />
                Aceitar Duelo!
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
