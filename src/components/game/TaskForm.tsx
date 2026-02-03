import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TaskDifficulty } from '@/lib/gameFormulas';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  onSubmit: (task: {
    title: string;
    description?: string;
    difficulty: TaskDifficulty;
    due_date?: string;
  }) => void;
  canCreate: boolean;
  isCreating: boolean;
  onUpgrade: () => void;
}

const DIFFICULTIES: { value: TaskDifficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Fácil', color: 'bg-accent text-accent-foreground' },
  { value: 'medium', label: 'Médio', color: 'bg-gold text-primary-foreground' },
  { value: 'hard', label: 'Difícil', color: 'bg-destructive text-destructive-foreground' },
];

export function TaskForm({ onSubmit, canCreate, isCreating, onUpgrade }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('easy');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      difficulty,
      due_date: dueDate?.toISOString(),
    });

    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setDueDate(undefined);
  };

  if (!canCreate) {
    return (
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
          💎 DESBLOQUEAR TAREFAS ILIMITADAS
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 pixel-border bg-card">
      <Input
        placeholder="Nova tarefa..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="pixel-border text-[10px] bg-input"
      />

      <Textarea
        placeholder="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="pixel-border text-[10px] bg-input min-h-[60px]"
      />

      <div className="flex gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setDifficulty(d.value)}
            className={cn(
              'flex-1 py-2 text-[8px] pixel-button transition-all',
              difficulty === d.value
                ? d.color
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'flex-1 justify-start text-[10px] pixel-border',
                !dueDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, 'PPP', { locale: ptBR }) : 'Data limite'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pixel-border" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={(date) => {
                setDueDate(date);
                setIsOpen(false);
              }}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        <Button
          type="submit"
          disabled={!title.trim() || isCreating}
          className="pixel-button bg-primary hover:bg-primary/80 text-[10px]"
        >
          <Plus className="w-4 h-4 mr-1" />
          Criar
        </Button>
      </div>
    </form>
  );
}
