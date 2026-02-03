import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlayerClass, CLASS_INFO, CLASS_UNLOCK_LEVEL } from '@/lib/gameFormulas';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { Lock, Sparkles } from 'lucide-react';

const SELECTABLE_CLASSES: PlayerClass[] = ['warrior', 'mage', 'rogue', 'cleric', 'paladin'];

interface ClassSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassSelection({ open, onOpenChange }: ClassSelectionProps) {
  const { profile, changeClass } = useProfile();
  const [selectedClass, setSelectedClass] = useState<PlayerClass | null>(null);

  if (!profile) return null;

  const canSelectClass = profile.level >= CLASS_UNLOCK_LEVEL && profile.player_class === 'apprentice';
  const levelsRemaining = CLASS_UNLOCK_LEVEL - profile.level;

  const handleConfirm = async () => {
    if (!selectedClass) return;
    await changeClass(selectedClass);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-border bg-card max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[14px] text-primary glow-gold text-center flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Escolha sua Classe
            <Sparkles className="w-5 h-5" />
          </DialogTitle>
          <DialogDescription className="text-[10px] text-center">
            {canSelectClass ? (
              <span className="text-accent">
                ✨ Você alcançou o nível {CLASS_UNLOCK_LEVEL}! Escolha seu destino...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                Alcance o nível {CLASS_UNLOCK_LEVEL} para desbloquear as classes!
                <span className="text-primary font-bold">
                  (Faltam {levelsRemaining} níveis)
                </span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 mt-4">
          {SELECTABLE_CLASSES.map((cls) => {
            const info = CLASS_INFO[cls];
            const isSelected = selectedClass === cls;
            const isLocked = !canSelectClass;

            return (
              <button
                key={cls}
                onClick={() => canSelectClass && setSelectedClass(cls)}
                disabled={isLocked}
                className={cn(
                  'p-4 pixel-border text-left transition-all relative overflow-hidden',
                  isSelected
                    ? 'bg-primary/20 pixel-border-gold'
                    : 'bg-card hover:bg-muted/50',
                  isLocked && 'opacity-40 cursor-not-allowed grayscale'
                )}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 pixel-border bg-muted p-1">
                    <img
                      src={`/assets/images/class_${cls}.png`}
                      alt={info.name}
                      className="w-full h-full object-contain pixelated"
                      onError={(e) => {
                        e.currentTarget.src = 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' + cls;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn(
                      "text-[12px] font-bold",
                      isSelected && "text-primary"
                    )}>
                      {info.name}
                    </h3>
                    <p className="text-[8px] text-muted-foreground mt-1">
                      {info.description}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute inset-0 border-2 border-primary animate-pulse pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {canSelectClass ? (
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 pixel-button text-[10px]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedClass}
              className="flex-1 pixel-button bg-primary hover:bg-primary/80 text-[10px]"
            >
              ⚔️ Confirmar Classe
            </Button>
          </div>
        ) : (
          <div className="mt-4 p-3 pixel-border bg-muted/50 text-center">
            <p className="text-[9px] text-muted-foreground">
              Complete tarefas para ganhar XP e subir de nível!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
