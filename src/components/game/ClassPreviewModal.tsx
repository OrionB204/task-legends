import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sword, Wand2, Zap, HeartPulse, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassPreviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const FUTURE_CLASSES = [
    {
        id: 'warrior',
        name: 'Guerreiro',
        type: 'Tanque / Dano Físico',
        description: 'Mestres do combate corporal com alta resistência e força bruta.',
        icon: <Sword className="w-5 h-5 text-red-500" />,
        stats: { força: 5, vitalidade: 4, agilidade: 2, inteligência: 1 },
        image: '/assets/images/class_warrior.png',
        color: 'from-red-500/20 to-orange-500/20',
        borderColor: 'border-red-500/30'
    },
    {
        id: 'mage',
        name: 'Mago',
        type: 'Dano Mágico / Controle',
        description: 'Poderosos usuários de magia que conjuram feitiços devastadores.',
        icon: <Wand2 className="w-5 h-5 text-blue-500" />,
        stats: { força: 1, vitalidade: 2, agilidade: 2, inteligência: 5 },
        image: '/assets/images/class_mage.png',
        color: 'from-blue-500/20 to-purple-500/20',
        borderColor: 'border-blue-500/30'
    },
    {
        id: 'rogue',
        name: 'Ladino',
        type: 'Dano Crítico / Agilidade',
        description: 'Especialistas em ataques rápidos, furtividade e precisão mortal.',
        icon: <Zap className="w-5 h-5 text-yellow-500" />,
        stats: { força: 3, vitalidade: 2, agilidade: 5, inteligência: 2 },
        image: '/assets/images/class_rogue.png',
        color: 'from-yellow-500/20 to-green-500/20',
        borderColor: 'border-yellow-500/30'
    },
    {
        id: 'cleric',
        name: 'Clérigo',
        type: 'Suporte / Regeneração',
        description: 'Guardiões divinos que curam feridas e protegem seus aliados.',
        icon: <HeartPulse className="w-5 h-5 text-pink-500" />,
        stats: { força: 2, vitalidade: 4, agilidade: 2, inteligência: 4 },
        image: '/assets/images/class_cleric.png',
        color: 'from-pink-500/20 to-rose-500/20',
        borderColor: 'border-pink-500/30'
    }
];

export function ClassPreviewModal({ open, onOpenChange }: ClassPreviewModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="pixel-border bg-card max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-[#3d2b7a]">
                <DialogHeader className="p-6 bg-[#1a1035] border-b border-[#3d2b7a]/50">
                    <DialogTitle className="text-[20px] text-[#ffb700] glow-gold text-center font-black tracking-widest uppercase flex items-center justify-center gap-3">
                        <Star className="w-6 h-6 animate-pulse" />
                        Classes Lendárias do TasKLegends
                        <Star className="w-6 h-6 animate-pulse" />
                    </DialogTitle>
                    <p className="text-[10px] text-zinc-400 text-center uppercase tracking-widest font-bold mt-2">
                        Alcance o nível 10 para desbloquear seu verdadeiro destino
                    </p>
                </DialogHeader>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FUTURE_CLASSES.map((cls) => (
                        <div
                            key={cls.id}
                            className={cn(
                                "pixel-border relative overflow-hidden group hover:scale-[1.02] transition-all duration-300",
                                "bg-gradient-to-br p-4 flex flex-col gap-3",
                                cls.color,
                                cls.borderColor
                            )}
                        >
                            {/* Background Icon Watermark */}
                            <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:scale-150 transition-transform duration-700">
                                {cls.icon}
                            </div>

                            <div className="flex gap-4 items-start relative z-10">
                                <div className="w-24 h-24 pixel-border bg-black/40 p-1 shrink-0 overflow-hidden group-hover:border-primary/50 transition-colors">
                                    <img
                                        src={cls.image}
                                        alt={cls.name}
                                        className="w-full h-full object-cover pixelated scale-110 group-hover:scale-125 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.src = "/assets/images/class_apprentice.png";
                                        }}
                                    />
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[16px] font-black text-white glow-gold uppercase tracking-tighter">
                                            {cls.name}
                                        </h3>
                                        <div className="p-1.5 bg-black/40 pixel-border border-white/10">
                                            {cls.icon}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] border-none bg-black/40 text-primary uppercase font-black px-2 h-5">
                                        {cls.type}
                                    </Badge>
                                    <p className="text-[10px] text-zinc-300 leading-tight italic">
                                        "{cls.description}"
                                    </p>
                                </div>
                            </div>

                            {/* Stats Bar Container */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 border-t border-white/5 relative z-10">
                                {Object.entries(cls.stats).map(([stat, value]) => (
                                    <div key={stat} className="space-y-1">
                                        <div className="flex justify-between items-center text-[8px] uppercase font-bold text-zinc-400">
                                            <span>{stat}</span>
                                            <span className="text-white">{value}/5</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-black/40 pixel-border border-white/5 overflow-hidden">
                                            <div
                                                className="h-full bg-primary animate-pulse-glow"
                                                style={{ width: `${(value / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action/Requirement Badge */}
                            <div className="mt-2 flex items-center justify-between pt-2">
                                <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold uppercase">
                                    <Sparkles className="w-3 h-3 text-primary" />
                                    Nível 10 Necessário
                                </div>
                                <div className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 pixel-border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Vem aí...
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-muted/20 border-t border-[#3d2b7a]/30">
                    <div className="flex items-center gap-3 pixel-border p-3 bg-black/40">
                        <div className="w-10 h-10 pixel-border bg-primary/20 flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6 text-primary animate-float" />
                        </div>
                        <div>
                            <p className="text-[10px] text-white font-black uppercase">Dica do Mestre</p>
                            <p className="text-[9px] text-zinc-400">Complete suas tarefas diárias para ganhar XP e desbloquear estas poderosas classes mais rápido!</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
