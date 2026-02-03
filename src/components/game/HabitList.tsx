import { useState } from 'react';
import { useHabits, Habit, HabitFrequency } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Minus, Trash2, Flame, Calendar, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitListProps {
  onUpgrade: () => void;
}

const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

const FREQUENCY_ICONS: Record<HabitFrequency, string> = {
  daily: '📅',
  weekly: '📆',
  monthly: '🗓️',
};

export function HabitList({ onUpgrade }: HabitListProps) {
  const { habits, createHabit, completePositive, completeNegative, deleteHabit, isCompletedToday, canCreateHabit } = useHabits();
  const [newHabit, setNewHabit] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    if (!newHabit.trim()) return;
    createHabit({ title: newHabit.trim(), frequency });
    setNewHabit('');
    setFrequency('daily');
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Create Habit Area */}
      {!canCreateHabit ? (
        <div className="p-6 pixel-border bg-card/50 text-center space-y-4 animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 bg-diamond/10 mx-auto flex items-center justify-center pixel-border">
            <Lock className="w-6 h-6 text-diamond" />
          </div>
          <p className="text-[11px] text-muted-foreground font-bold leading-relaxed px-4">
            Limite atingido! Gaste 5 diamantes para desbloquear todas tarefas ilimitadas
          </p>
          <Button
            onClick={onUpgrade}
            className="w-full pixel-button bg-diamond hover:bg-diamond/80 text-[10px] h-10 shadow-lg glow-diamond"
          >
            💎 DESBLOQUEAR HÁBITOS ILIMITADOS
          </Button>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          <p className="text-[11px] text-muted-foreground font-bold text-center uppercase tracking-wide px-4">
            Exemplo: ler 5 páginas do livro, estudar matemática, estudar inglês
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full pixel-button bg-primary hover:bg-primary/80 text-[10px]">
                <Plus className="w-4 h-4 mr-2" />
                Novo Hábito
              </Button>
            </DialogTrigger>
            <DialogContent className="pixel-dialog">
              <DialogHeader>
                <DialogTitle className="text-[12px]">Criar Hábito</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-[11px] text-primary/70 font-bold mb-2 uppercase leading-snug">
                  Exemplo: ler 5 páginas do livro, estudar matemática, estudar inglês
                </p>
                <Input
                  placeholder="Nome do hábito..."
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  className="pixel-border text-[10px] bg-input"
                />
                <div className="space-y-2">
                  <label className="text-[8px] text-muted-foreground">Frequência</label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as HabitFrequency)}>
                    <SelectTrigger className="pixel-border text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="pixel-border">
                      {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value} className="text-[10px]">
                          {FREQUENCY_ICONS[value as HabitFrequency]} {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!newHabit.trim()}
                  className="w-full pixel-button bg-primary hover:bg-primary/80 text-[10px]"
                >
                  Criar Hábito
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-2">
        {habits.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center py-4">
            Nenhum hábito ainda. Crie seu primeiro! 🌟
          </p>
        ) : (
          habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              isCompleted={isCompletedToday(habit)}
              onPositive={completePositive}
              onNegative={completeNegative}
              onDelete={deleteHabit}
            />
          ))
        )}
      </div>

      {/* Legend */}
      <div className="p-3 pixel-border bg-muted/20 space-y-1">
        <p className="text-[8px] text-muted-foreground">
          <span className="text-accent">+</span> Fiz o hábito! → Ganha XP e cura HP
        </p>
        <p className="text-[8px] text-muted-foreground">
          <span className="text-destructive">-</span> Não fiz o hábito → Perde HP
        </p>
      </div>
    </div>
  );
}

interface HabitItemProps {
  habit: Habit;
  isCompleted: boolean;
  onPositive: (id: string) => void;
  onNegative: (id: string) => void;
  onDelete: (id: string) => void;
}

function HabitItem({ habit, isCompleted, onPositive, onNegative, onDelete }: HabitItemProps) {
  const [isShaking, setIsShaking] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  const handlePositive = () => {
    if (isCompleted) return;
    setIsGlowing(true);
    onPositive(habit.id);
    setTimeout(() => setIsGlowing(false), 500);
  };

  const handleNegative = () => {
    if (isCompleted) return;
    setIsShaking(true);
    onNegative(habit.id);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div
      className={cn(
        'p-3 bg-card pixel-border flex items-center gap-3 transition-all',
        isCompleted && 'opacity-60 bg-accent/10',
        isShaking && 'animate-shake',
        isGlowing && 'animate-glow-pulse'
      )}
    >
      {/* Positive Button (+) */}
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          'h-10 w-10 p-0 pixel-button text-lg font-bold',
          isCompleted
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-accent/20 hover:bg-accent/40 text-accent hover:text-accent'
        )}
        onClick={handlePositive}
        disabled={isCompleted}
      >
        +
      </Button>

      {/* Habit Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'text-[10px] font-bold truncate',
              isCompleted && 'line-through text-muted-foreground'
            )}
          >
            {habit.title}
          </h3>
          <span className="text-[8px] text-muted-foreground">
            {FREQUENCY_ICONS[habit.frequency]}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1">
          {habit.streak > 0 && (
            <div className="flex items-center gap-1 text-[8px] text-gold">
              <Flame className="w-3 h-3" />
              <span>{habit.streak} dias!</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
            <span className="text-accent">✓ {habit.times_completed}</span>
            <span>/</span>
            <span className="text-destructive">✗ {habit.times_failed}</span>
          </div>
        </div>
      </div>

      {/* Negative Button (-) */}
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          'h-10 w-10 p-0 pixel-button text-lg font-bold',
          isCompleted
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-destructive/20 hover:bg-destructive/40 text-destructive hover:text-destructive'
        )}
        onClick={handleNegative}
        disabled={isCompleted}
      >
        −
      </Button>

      {/* Delete Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 pixel-button bg-muted/50 hover:bg-destructive/20"
        onClick={() => onDelete(habit.id)}
      >
        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
