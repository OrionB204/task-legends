import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Gem, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RedeemCodeCard() {
    const { redeemCode } = useProfile();
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRedeem = async () => {
        if (!code.trim()) return;
        setIsLoading(true);
        // @ts-ignore
        const success = await redeemCode(code);
        if (success) {
            setCode('');
        }
        setIsLoading(false);
    };

    return (
        <div className="relative overflow-hidden p-6 pixel-border bg-gradient-to-br from-[#1a103c] to-[#2d1b69] flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
            {/* Background decorations */}
            <div className="absolute -top-6 -right-6 opacity-10 pointer-events-none rotate-12">
                <Gem className="w-32 h-32 text-cyan-400" />
            </div>
            <div className="absolute -bottom-6 -left-6 opacity-5 pointer-events-none -rotate-12">
                <Sparkles className="w-32 h-32 text-gold" />
            </div>

            <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <div className="bg-cyan-900/30 p-2 rounded-lg pixel-border">
                        <Gem className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest text-white">
                        Resgatar Diamantes
                    </h2>
                </div>
                <p className="text-xs text-cyan-100/70 font-medium max-w-xs mx-auto">
                    Insira seu código para resgatar <span className="text-cyan-300 font-bold">Diamantes</span> e comprar itens exclusivos!
                </p>
            </div>

            <div className="relative z-10 w-full max-w-sm flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="CÓDIGO..."
                        className="w-full pl-9 pr-3 h-10 bg-black/60 border-2 border-indigo-500/30 rounded-md focus:border-cyan-400 focus:bg-black/80 focus:ring-0 text-white font-mono text-sm tracking-wider placeholder:text-white/20 uppercase"
                    />
                </div>
                <Button
                    onClick={handleRedeem}
                    disabled={isLoading || !code}
                    className="h-10 px-6 font-black bg-cyan-600 hover:bg-cyan-500 text-white pixel-border text-xs sm:text-sm whitespace-nowrap"
                >
                    {isLoading ? '...' : 'RESGATAR'}
                </Button>
            </div>
        </div>
    );
}
