import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skull, HeartPulse, ShoppingBag } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useState } from "react";
import { toast } from "sonner";

interface DeathScreenProps {
    open: boolean;
    onOpenShop: () => void;
}

export function DeathScreen({ open, onOpenShop }: DeathScreenProps) {
    const { profile, revive } = useProfile();
    const [isReviving, setIsReviving] = useState(false);

    const handleRevive = async () => {
        setIsReviving(true);
        try {
            const success = await revive();
            if (!success) {
                // Se falhou (falta diamante), sugerimos abrir a loja
                setTimeout(() => {
                    toast.info("Abrindo loja para adquirir diamantes...");
                    onOpenShop();
                }, 1000);
            }
        } finally {
            setIsReviving(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent
                className="pixel-border bg-card max-w-md text-center [&>button]:hidden pointer-events-auto"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <div className="mx-auto w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <Skull className="w-12 h-12 text-destructive" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-destructive uppercase tracking-widest glow-text-red">
                        VOCÊ MORREU
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-bold">
                        Seus pontos de vida chegaram a zero. Você está incapacitado de realizar tarefas.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="bg-black/30 p-4 rounded pixel-border border-destructive/30">
                        <p className="text-sm text-destructive font-mono">
                            "A morte não é o fim, mas custa caro..."
                        </p>
                    </div>

                    <div className="grid gap-3">
                        <Button
                            onClick={handleRevive}
                            disabled={isReviving}
                            className="w-full h-12 pixel-button bg-primary text-primary-foreground font-black text-lg gap-2"
                        >
                            {isReviving ? <HeartPulse className="animate-spin" /> : <HeartPulse />}
                            REVIVER (5 💎)
                        </Button>

                        <Button
                            variant="outline"
                            onClick={onOpenShop}
                            className="w-full border-dashed"
                        >
                            <ShoppingBag className="mr-2 w-4 h-4" />
                            Comprar Diamantes
                        </Button>
                    </div>

                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4">
                        Saldo Atual: <span className="text-diamond font-bold">{profile?.diamonds || 0} 💎</span>
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
