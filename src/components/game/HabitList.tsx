import { useState } from 'react';
import { useHabits, Habit, HabitFrequency, HabitDifficulty } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  // Form State
  const [newHabit, setNewHabit] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('easy');
  const [isPositive, setIsPositive] = useState(true);
  const [isNegative, setIsNegative] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    if (!newHabit.trim()) return;
    createHabit({
      title: newHabit.trim(),
      description: description.trim(),
      frequency,
      difficulty,
      is_positive: isPositive,
      is_negative: isNegative
    });

    // Reset form
    setNewHabit('');
    setDescription('');
    setFrequency('daily');
    setDifficulty('easy');
    setIsPositive(true);
    setIsNegative(true);
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
            <DialogContent className="pixel-dialog sm:max-w-[425px] border-4 border-[#3d2b7a] bg-[#1a103c] text-slate-100 p-0 overflow-hidden">
              <DialogHeader className="bg-[#4d3b8a] p-4 text-white">
                <DialogTitle className="text-base font-black tracking-wider uppercase flex items-center gap-2">
                  <span className="text-xl">✨</span> Criar Hábito
                </DialogTitle>
              </DialogHeader>

              <div className="p-6 space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Título*</label>
                  <Input
                    placeholder="Adicionar um título"
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    className="pixel-border bg-[#2a1b52] border-slate-700 text-xs h-10 placeholder:text-slate-500 focus-visible:ring-primary"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex justify-between">
                    Observações
                  </label>
                  <Textarea
                    placeholder="Adicionar notas"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="pixel-border bg-[#2a1b52] border-slate-700 text-xs min-h-[80px] placeholder:text-slate-500 resize-none focus-visible:ring-primary"
                  />
                </div>

                {/* +/- Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setIsPositive(!isPositive)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                      isPositive
                        ? "bg-[#2a1b52] border-primary text-primary shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        : "bg-[#150d30] border-slate-700 text-slate-500 opacity-50 hover:opacity-75"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-black text-xl mb-1",
                      isPositive ? "bg-primary text-white" : "bg-slate-700 text-slate-400"
                    )}>+</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Positivo</span>
                  </button>

                  <button
                    onClick={() => setIsNegative(!isNegative)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                      isNegative
                        ? "bg-[#2a1b52] border-destructive text-destructive shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        : "bg-[#150d30] border-slate-700 text-slate-500 opacity-50 hover:opacity-75"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-black text-xl mb-1",
                      isNegative ? "bg-destructive text-white" : "bg-slate-700 text-slate-400"
                    )}>-</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Negativo</span>
                  </button>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dificuldade</label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as HabitDifficulty)}>
                    <SelectTrigger className="pixel-border bg-[#2a1b52] border-slate-700 text-xs h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a103c] border-slate-700 text-slate-200">
                      <SelectItem value="easy">Fácil ⭐️</SelectItem>
                      <SelectItem value="medium">Médio ⭐️⭐️</SelectItem>
                      <SelectItem value="hard">Difícil ⭐️⭐️⭐️</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequency/Reset */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resetar Contador</label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as HabitFrequency)}>
                    <SelectTrigger className="pixel-border bg-[#2a1b52] border-slate-700 text-xs h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a103c] border-slate-700 text-slate-200">
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="monthly">Mensalmente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 h-10 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!newHabit.trim() || (!isPositive && !isNegative)}
                    className="flex-[2] h-10 pixel-button bg-primary hover:bg-primary/90 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    Criar Hábito
                  </Button>
                </div>
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
        'p-3 bg-card pixel-border flex items-center gap-3 transition-all relative overflow-hidden group',
        isCompleted && 'opacity-60 bg-accent/10',
        isShaking && 'animate-shake',
        isGlowing && 'animate-glow-pulse'
      )}
    >
      {/* Description Tooltip or indicator could be added here */}

      {/* Positive Button (+) - Only if is_positive */}
      {habit.is_positive && (
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            'h-10 w-10 p-0 pixel-button text-lg font-bold shrink-0',
            isCompleted
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-accent/20 hover:bg-accent/40 text-accent hover:text-accent'
          )}
          onClick={handlePositive}
          disabled={isCompleted}
        >
          +
        </Button>
      )}

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
          <span className="text-[8px] text-muted-foreground" title={FREQUENCY_LABELS[habit.frequency] || habit.frequency}>
            {FREQUENCY_ICONS[habit.frequency] || '📅'}
          </span>
          {habit.difficulty && habit.difficulty !== 'easy' && (
            <span className="text-[8px] text-amber-500 font-bold" title="Dificuldade">
              {habit.difficulty === 'hard' ? '⭐️⭐️⭐️' : '⭐️⭐️'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1">
          {habit.streak > 0 && (
            <div className="flex items-center gap-1 text-[8px] text-gold">
              <Flame className="w-3 h-3" />
              <span>{habit.streak} dias!</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
            {habit.is_positive && <span className="text-accent">✓ {habit.times_completed}</span>}
            {habit.is_positive && habit.is_negative && <span>/</span>}
            {habit.is_negative && <span className="text-destructive">✗ {habit.times_failed}</span>}
          </div>
        </div>

        {/* Description Preview (if exists) */}
        {habit.description && (
          <p className="text-[8px] text-muted-foreground/70 truncate mt-0.5 max-w-[200px]">
            {habit.description}
          </p>
        )}
      </div>

      {/* Negative Button (-) - Only if is_negative */}
      {habit.is_negative && (
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            'h-10 w-10 p-0 pixel-button text-lg font-bold shrink-0',
            isCompleted
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-destructive/20 hover:bg-destructive/40 text-destructive hover:text-destructive'
          )}
          onClick={handleNegative}
          disabled={isCompleted}
        >
          −
        </Button>
      )}

      {/* Delete Button */}
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 pixel-button bg-muted/50 hover:bg-destructive/20 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(habit.id)}
      >
        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}
