import { Task } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Calendar, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskItemProps {
  task: Task;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  disabled?: boolean;
}

const DIFFICULTY_STYLES = {
  easy: {
    border: 'border-l-accent',
    badge: 'bg-accent/20 text-accent',
    label: 'Fácil',
  },
  medium: {
    border: 'border-l-gold',
    badge: 'bg-gold/20 text-gold',
    label: 'Médio',
  },
  hard: {
    border: 'border-l-destructive',
    badge: 'bg-destructive/20 text-destructive',
    label: 'Difícil',
  },
};

export function TaskItem({ task, onComplete, onDelete, disabled }: TaskItemProps) {
  const diffStyle = DIFFICULTY_STYLES[task.difficulty];
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={cn(
        'p-3 bg-card pixel-border border-l-4 transition-all',
        diffStyle.border,
        isCompleted && 'opacity-60',
        isOverdue && !isCompleted && 'animate-pulse-glow'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                'text-[10px] font-bold truncate',
                isCompleted && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </h3>
            {task.is_pvp && (
              <span className="flex items-center gap-1 text-[8px] px-2 py-0.5 pixel-border bg-primary/20 text-primary glow-gold">
                <Swords className="w-2.5 h-2.5" />
                Duelo PvP
              </span>
            )}
            <span className={cn('text-[8px] px-2 py-0.5 pixel-border', diffStyle.badge)}>
              {diffStyle.label}
            </span>
          </div>

          {task.description && (
            <p className="text-[8px] text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-[8px] text-muted-foreground">
            {task.due_date && (
              <span
                className={cn(
                  'flex items-center gap-1',
                  isOverdue && !isCompleted && 'text-destructive'
                )}
              >
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), "dd MMM", { locale: ptBR })}
              </span>
            )}
            <span className="flex items-center gap-1 text-xp">
              <Swords className="w-3 h-3" />
              +{task.xp_reward} XP
            </span>
            <span className="text-gold">+{task.gold_reward} 🪙</span>
          </div>
        </div>

        <div className="flex gap-1">
          {!isCompleted && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 pixel-button bg-accent/20 hover:bg-accent/40"
              onClick={() => onComplete?.(task.id)}
              disabled={disabled}
            >
              <Check className="w-4 h-4 text-accent" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 pixel-button bg-destructive/20 hover:bg-destructive/40"
            onClick={() => onDelete?.(task.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
