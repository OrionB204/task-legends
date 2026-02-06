// Death Screen Overlay - Blocks all actions until player revives
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Skull, Diamond, HeartPulse, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function DeathScreen() {
    const { profile, revive } = useProfile();
    const [isReviving, setIsReviving] = useState(false);

    // Don't show if profile not loaded or HP > 0
    if (!profile || profile.current_hp > 0) return null;

    const handleRevive = async () => {
        setIsReviving(true);
        try {
            await revive();
        } finally {
            setIsReviving(false);
        }
    };

    const hasDiamonds = profile.diamonds >= 1;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-500">
            {/* Background skull pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="grid grid-cols-8 gap-4 p-4">
                    {Array.from({ length: 64 }).map((_, i) => (
                        <Skull key={i} className="w-full h-auto text-red-500" />
                    ))}
                </div>
            </div>

            {/* Death content */}
            <div className="relative z-10 text-center space-y-6 max-w-md">
                {/* Animated skull */}
                <div className="mx-auto w-32 h-32 relative">
                    <Skull className="w-full h-full text-red-500 animate-pulse drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
                </div>

                {/* Death message */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-red-500 tracking-wider uppercase animate-pulse">
                        Você Morreu!
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Seu HP chegou a zero. Complete tarefas para ganhar poções e evitar isso no futuro!
                    </p>
                </div>

                {/* Stats lost notice */}
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-bold">Todas as ações estão bloqueadas</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Você precisa reviver para continuar jogando
                    </p>
                </div>

                {/* Revive button */}
                <div className="pt-4 space-y-3">
                    <Button
                        onClick={handleRevive}
                        disabled={!hasDiamonds || isReviving}
                        size="lg"
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isReviving ? (
                            <span className="flex items-center gap-2">
                                <HeartPulse className="w-6 h-6 animate-pulse" />
                                Revivendo...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <HeartPulse className="w-6 h-6" />
                                Reviver
                                <span className="flex items-center gap-1 ml-2 px-2 py-0.5 bg-black/30 rounded-full">
                                    <Diamond className="w-4 h-4 text-cyan-400" />
                                    <span>1</span>
                                </span>
                            </span>
                        )}
                    </Button>

                    {!hasDiamonds && (
                        <p className="text-red-400 text-sm font-medium animate-pulse">
                            ⚠️ Você não tem diamantes suficientes!
                        </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                        Você irá reviver com 50% do HP máximo
                    </p>
                </div>

                {/* Diamond count */}
                <div className="pt-2 flex items-center justify-center gap-2 text-muted-foreground">
                    <Diamond className="w-4 h-4 text-cyan-400" />
                    <span>Seus diamantes: {profile.diamonds}</span>
                </div>
            </div>
        </div>
    );
}
