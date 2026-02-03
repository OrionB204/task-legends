import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { usePvP } from '@/hooks/usePvP';
import { Check, X, Swords } from 'lucide-react';
import { REQUIRED_TASKS } from '@/types/pvp';
import { cn } from '@/lib/utils';

interface TaskSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskSelectionModal({ open, onOpenChange }: TaskSelectionModalProps) {
  const { pendingTasks } = useTasks();
  const { myTasks, selectTask, removeTask } = usePvP();

  // Filter only medium and hard tasks
  const eligibleTasks = pendingTasks.filter(
    t => t.difficulty === 'medium' || t.difficulty === 'hard'
  );

  const selectedTaskIds = myTasks.map(t => t.task_id);
  const remainingSlots = REQUIRED_TASKS - myTasks.length;

  const handleToggleTask = (taskId: string) => {
    const existingSelection = myTasks.find(t => t.task_id === taskId);
    
    if (existingSelection) {
      removeTask(existingSelection.id);
    } else if (remainingSlots > 0) {
      selectTask(taskId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md pixel-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[12px]">
            <Swords className="w-4 h-4 text-primary" />
            Selecionar Tarefas para o Duelo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-muted-foreground">
              Apenas tarefas MÉDIAS ou DIFÍCEIS
            </span>
            <Badge variant="outline" className="text-[8px]">
              {myTasks.length}/{REQUIRED_TASKS}
            </Badge>
          </div>

          {eligibleTasks.length === 0 ? (
            <div className="text-center p-6 pixel-border bg-muted/50">
              <p className="text-[10px] text-muted-foreground">
                Você não tem tarefas elegíveis!
              </p>
              <p className="text-[8px] text-muted-foreground mt-1">
                Crie tarefas de nível Médio ou Difícil primeiro.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {eligibleTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const isDisabled = !isSelected && remainingSlots === 0;

                return (
                  <button
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    disabled={isDisabled}
                    className={cn(
                      "w-full p-3 pixel-border transition-all text-left",
                      isSelected 
                        ? "bg-accent/20 border-accent" 
                        : "bg-card hover:bg-muted/50",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 pixel-border flex items-center justify-center flex-shrink-0",
                        isSelected ? "bg-accent" : "bg-muted"
                      )}>
                        {isSelected && <Check className="w-3 h-3 text-background" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold truncate">
                            {task.title}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[7px] flex-shrink-0",
                              task.difficulty === 'hard' 
                                ? "bg-destructive/20 text-destructive border-destructive" 
                                : "bg-gold/20 text-gold border-gold"
                            )}
                          >
                            {task.difficulty === 'hard' ? 'DIFÍCIL' : 'MÉDIO'}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-[8px] text-muted-foreground truncate mt-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-1 text-[8px]">
                          <span className="text-xp">+{task.xp_reward} XP</span>
                          <span className="text-gold">+{task.gold_reward} 🪙</span>
                          <span className="text-destructive">
                            ⚔️ {task.difficulty === 'hard' ? '25' : '15'} dano
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="pixel-button text-[9px]"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
