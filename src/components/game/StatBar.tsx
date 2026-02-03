import { cn } from '@/lib/utils';

interface StatBarProps {
  current: number;
  max: number;
  type: 'hp' | 'xp' | 'mana';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const BAR_STYLES = {
  hp: {
    bg: 'bg-hp/20',
    fill: 'bg-hp',
    glow: 'glow-hp',
    icon: '❤️',
    label: 'HP',
  },
  xp: {
    bg: 'bg-xp/20',
    fill: 'bg-xp',
    glow: 'glow-xp',
    icon: '⭐',
    label: 'XP',
  },
  mana: {
    bg: 'bg-mana/20',
    fill: 'bg-mana',
    glow: 'glow-mana',
    icon: '💧',
    label: 'MP',
  },
};

const SIZE_STYLES = {
  sm: 'h-3',
  md: 'h-5',
  lg: 'h-7',
};

export function StatBar({
  current,
  max,
  type,
  showLabel = true,
  size = 'md',
}: StatBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const style = BAR_STYLES[type];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[8px] text-foreground/80 flex items-center gap-1">
            <span>{style.icon}</span>
            <span>{style.label}</span>
          </span>
          <span className="text-[8px] text-foreground/60">
            {current}/{max}
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full pixel-border relative overflow-hidden',
          style.bg,
          SIZE_STYLES[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            style.fill,
            style.glow,
            percentage < 25 && type === 'hp' && 'animate-pulse-glow'
          )}
          style={{ width: `${percentage}%` }}
        />
        {/* Pixel segments */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-background/20 last:border-r-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
