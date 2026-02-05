import { useState, useEffect } from 'react';
import { Raid } from '@/types/social';
import { Progress } from '@/components/ui/progress';
import { Skull, Flame, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BOSS_TEMPLATES } from '@/types/social';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BossDisplayProps {
    raid: Raid;
    averageLevel?: number;
}

// Boss visual upgrades based on difficulty
const getBossVisual = (bossName: string, avgLevel: number) => {
    const isEvolved = avgLevel >= 15;
    const isEnraged = avgLevel >= 25;

    const baseEmojis: Record<string, string> = {
        'Dragão de Fogo': isEnraged ? '🐲' : isEvolved ? '🐉' : '🦎',
        'Hydra de Código': isEnraged ? '🐍🐍🐍' : isEvolved ? '🐍🐍' : '🐍',
        'Golem de Pedra': isEnraged ? '🗿💀' : isEvolved ? '🗿' : '🪨',
        'Fênix Sombria': isEnraged ? '🔥🦅🔥' : isEvolved ? '🔥🦅' : '🐦‍🔥',
        'Kraken Abissal': isEnraged ? '🦑🌊' : isEvolved ? '🦑' : '🐙',
    };

    return {
        emoji: baseEmojis[bossName] || '👹',
        isEvolved,
        isEnraged,
        title: isEnraged ? `${bossName} ENFURECIDO` : isEvolved ? `${bossName} Evoluído` : bossName,
    };
};

export function BossDisplay({ raid, averageLevel = 1 }: BossDisplayProps) {
    const hpPercentage = (raid.boss_current_hp / raid.boss_max_hp) * 100;
    const bossVisual = getBossVisual(raid.boss_name, averageLevel);

    // Scale boss stats display
    const scaledDamage = Math.floor(raid.boss_damage * (1 + averageLevel * 0.05));

    const getBossData = (name: string) => {
        return BOSS_TEMPLATES.find(b => b.name === name) || BOSS_TEMPLATES[0];
    };

    const bossData = getBossData(raid.boss_name);

    return (
        <div className={cn(
            "relative p-4 pixel-border bg-gradient-to-b from-destructive/30 to-card overflow-hidden",
            bossVisual.isEnraged && "animate-pulse border-destructive",
            bossVisual.isEvolved && "pixel-border-gold"
        )}>
            {/* Background effects */}
            {bossVisual.isEnraged && (
                <div className="absolute inset-0 bg-gradient-to-t from-destructive/20 to-transparent pointer-events-none" />
            )}

            {/* Boss visual */}
            <div className="text-center mb-4">
                <div className={cn(
                    "w-48 h-48 mx-auto mb-2 flex items-center justify-center relative z-10",
                    bossVisual.isEnraged && "animate-bounce-pixel"
                )}>
                    <img
                        src={`/assets/images/${bossData.image}`}
                        alt={raid.boss_name}
                        className="max-w-full max-h-full object-contain pixelated drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                        onError={(e) => {
                            // Fallback para emoji se a imagem não existir
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                const span = document.createElement('span');
                                span.className = 'text-8xl';
                                span.innerText = bossVisual.emoji;
                                parent.appendChild(span);
                            }
                        }}
                    />
                </div>

                <h2 className={cn(
                    "text-[16px] font-black uppercase tracking-widest",
                    bossVisual.isEnraged && "text-destructive animate-pulse",
                    !bossVisual.isEnraged && "text-primary glow-gold"
                )}>
                    {bossVisual.title}
                </h2>

                <p className="text-[9px] text-muted-foreground italic max-w-sm mx-auto mt-1 leading-tight">
                    "{bossData.lore}"
                </p>

                {/* Evolution badges */}
                <div className="flex justify-center gap-2 mt-1">
                    {bossVisual.isEvolved && (
                        <span className="text-[8px] bg-secondary/50 px-2 py-0.5 pixel-border text-secondary-foreground flex items-center gap-1">
                            <Zap className="w-3 h-3" /> EVOLUÍDO
                        </span>
                    )}
                    {bossVisual.isEnraged && (
                        <span className="text-[8px] bg-destructive/50 px-2 py-0.5 pixel-border text-destructive-foreground flex items-center gap-1">
                            <Flame className="w-3 h-3" /> ENFURECIDO
                        </span>
                    )}
                </div>
            </div>

            {/* Boss HP Bar - Large and prominent */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Skull className="w-4 h-4 text-destructive" />
                        <span className="text-[10px] text-destructive font-bold">HP do Boss</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                        {raid.boss_current_hp.toLocaleString()} / {raid.boss_max_hp.toLocaleString()}
                    </span>
                </div>

                {/* Custom thick HP bar */}
                <div className="relative h-8 pixel-border bg-muted overflow-hidden">
                    <div
                        className={cn(
                            "absolute inset-y-0 left-0 transition-all duration-500",
                            hpPercentage > 50 ? "bg-gradient-to-r from-purple-600 to-indigo-600" :
                                hpPercentage > 25 ? "bg-primary" :
                                    "bg-destructive animate-pulse"
                        )}
                        style={{ width: `${hpPercentage}%` }}
                    />
                    {/* HP segments overlay */}
                    <div className="absolute inset-0 flex">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex-1 border-r border-background/30" />
                        ))}
                    </div>
                    {/* Glowing effect when low HP */}
                    {hpPercentage < 25 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                    )}
                </div>

                {/* Boss stats */}
                <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>⚔️ Dano: {scaledDamage}</span>
                    <span>📊 Nível médio do grupo: {averageLevel.toFixed(1)}</span>
                </div>
            </div>
        </div>
    );
}
