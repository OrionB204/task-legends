import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { usePvP } from '@/hooks/usePvP';
import { PvPSelectedTask } from '@/types/pvp';
import { Camera, Eye, AlertTriangle, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoGalleryProps {
  tasks: PvPSelectedTask[];
  isOwn: boolean;
  onImageClick: (url: string) => void;
  onCompleteTask?: (taskId: string) => void;
  username?: string;
}

export function PhotoGallery({
  tasks,
  isOwn,
  onImageClick,
  onCompleteTask,
  username
}: PhotoGalleryProps) {
  const { contestTask } = usePvP();
  const [contestOpen, setContestOpen] = useState(false);
  const [contestingTask, setContestingTask] = useState<string | null>(null);
  const [contestReason, setContestReason] = useState('');

  const completedTasks = tasks.filter(t => t.completed);

  const handleContest = () => {
    if (contestingTask && contestReason.trim()) {
      contestTask({ selectionId: contestingTask, reason: contestReason });
      setContestOpen(false);
      setContestingTask(null);
      setContestReason('');
    }
  };

  const openContestDialog = (taskId: string) => {
    setContestingTask(taskId);
    setContestOpen(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
        <Camera className="w-5 h-5" />
        {isOwn ? 'Suas Evidências' : 'Evidências do Oponente'}
        <span className="ml-auto bg-background px-2 py-0.5 rounded pixel-border text-xs">
          {completedTasks.length}/{tasks.length}
        </span>
      </p>

      {/* Photo Grid */}
      <div className="grid grid-cols-5 gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "aspect-square pixel-border overflow-hidden relative group transition-all hover:scale-105 shadow-md",
              task.completed ? "bg-accent/20" : "bg-muted/30",
              task.contested && "ring-4 ring-destructive"
            )}
          >
            {task.completed && task.evidence_url ? (
              <>
                <img
                  src={task.evidence_url}
                  alt={task.task?.title}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-110 transition-all"
                  onClick={() => onImageClick(task.evidence_url!)}
                  style={{ imageRendering: 'pixelated' }}
                />

                {/* User Nickname Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1 py-1 border-t border-white/20">
                  <p className="text-[8px] sm:text-[10px] text-white font-pixel truncate uppercase text-center">
                    {username || (isOwn ? 'VOCÊ' : 'OPONENTE')}
                  </p>
                </div>

                {/* Damage Badge */}
                <div className="absolute top-0 left-0 bg-destructive px-2 py-0.5 border-r border-b border-white/20 z-10 shadow-lg">
                  <span className="text-[10px] text-white font-black drop-shadow-md">
                    -{task.damage_dealt}
                  </span>
                </div>

                {/* Hover overlay */}
                {!isOwn && !task.contested && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onImageClick(task.evidence_url!)}
                      className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/30 text-white border-2 border-white/50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openContestDialog(task.id)}
                      className="h-8 w-8 rounded-full bg-destructive/50 hover:bg-destructive text-white border-2 border-destructive/50"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Contested indicator */}
                {task.contested && (
                  <div className="absolute top-0 right-0 bg-destructive p-1 z-20 shadow-lg">
                    <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-1">
                {isOwn && onCompleteTask ? (
                  <button
                    onClick={() => onCompleteTask(task.id)}
                    className="w-full h-full flex flex-col items-center justify-center hover:bg-white/5 transition-colors gap-2 group/btn"
                  >
                    <div className="p-2 bg-background/50 rounded-full group-hover/btn:scale-110 transition-transform pixel-border">
                      <Camera className="w-5 h-5 text-muted-foreground group-hover/btn:text-primary transition-colors" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground group-hover/btn:text-primary transition-colors">
                      Enviar
                    </span>
                  </button>
                ) : (
                  <Clock className="w-6 h-6 text-muted-foreground/30" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-[10px] text-muted-foreground font-medium pt-2 uppercase tracking-wide">
        <span className="flex items-center gap-2">
          <Check className="w-3 h-3 text-accent" /> Concluída
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-3 h-3" /> Pendente
        </span>
        {!isOwn && (
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-destructive" /> Contestar
          </span>
        )}
      </div>

      {/* Contest Dialog */}
      <Dialog open={contestOpen} onOpenChange={setContestOpen}>
        <DialogContent className="max-w-sm pixel-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[12px] text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Contestar Evidência
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-[9px] text-muted-foreground">
              Descreva o motivo da contestação. A tarefa será marcada para revisão.
            </p>

            <Textarea
              placeholder="Ex: A foto não mostra a conclusão da tarefa..."
              value={contestReason}
              onChange={(e) => setContestReason(e.target.value)}
              className="text-[10px] pixel-border min-h-20"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setContestOpen(false)}
              className="pixel-button text-[9px]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleContest}
              disabled={!contestReason.trim()}
              className="pixel-button text-[9px] bg-destructive hover:bg-destructive/80"
            >
              Contestar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
