import { useState } from 'react';
import { useRedemptions, REDEMPTION_PACKAGES } from '@/hooks/useRedemptions';
import { useGiftCodes } from '@/hooks/useGiftCodes';
import { useDiamondRequests } from '@/hooks/useDiamondRequests';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertCircle, CheckCircle, Clock, XCircle, Gem, Gift, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RedemptionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', icon: Clock, color: 'bg-gold/20 text-gold' },
  processing: { label: 'Processando', icon: Clock, color: 'bg-blue-500/20 text-blue-400' },
  completed: { label: 'Concluído', icon: CheckCircle, color: 'bg-accent/20 text-accent' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-destructive/20 text-destructive' },
};

const PIX_KEY = 'fitquestplay@gmail.com';

export function RedemptionHistory({ open, onOpenChange }: RedemptionHistoryProps) {
  const { redemptions, createRedemption, hasPendingRedemption, isCreating, MIN_DIAMOND_REDEMPTION } = useRedemptions();
  const { requests } = useDiamondRequests();
  const { redeemCode, isRedeeming } = useGiftCodes();
  const { profile } = useProfile();

  const [isNewRedemption, setIsNewRedemption] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof REDEMPTION_PACKAGES[0] | null>(null);
  const [pixKey, setPixKey] = useState('');
  const [giftCode, setGiftCode] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  const canRedeem = profile && selectedPackage && profile.diamonds >= selectedPackage.diamonds && !hasPendingRedemption && pixKey.trim();

  const handleSubmit = () => {
    if (!canRedeem || !selectedPackage) return;
    createRedemption({ diamondAmount: selectedPackage.diamonds, pixKey: pixKey.trim() });
    setIsNewRedemption(false);
    setSelectedPackage(null);
    setPixKey('');
  };

  const handleRedeemCode = () => {
    if (!giftCode.trim()) {
      toast.error('Digite um código válido');
      return;
    }
    redeemCode(giftCode, {
      onSuccess: () => {
        setGiftCode('');
      },
    });
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
    toast.success('Chave PIX copiada!');
  };

  const combinedHistory = [
    ...redemptions.map(r => ({ ...r, type: 'outgoing' as const })),
    ...requests.map(r => ({ ...r, type: 'incoming' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-dialog max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle className="text-[14px] flex items-center gap-2 text-diamond">
            <Wallet className="w-5 h-5" />
            Central de Resgates e Diamantes
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Diamonds */}
          <div className="flex items-center justify-between p-4 pixel-border bg-gradient-to-br from-diamond/20 via-diamond/5 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-diamond/10 blur-2xl group-hover:bg-diamond/20 transition-all" />
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Saldo Atual</span>
              <div className="text-[20px] font-bold text-diamond flex items-center gap-2 glow-diamond">
                <Gem className="w-6 h-6 animate-pulse" />
                {profile?.diamonds || 0}
              </div>
            </div>
            <Button
              onClick={() => setIsNewRedemption(true)}
              disabled={hasPendingRedemption || (profile?.diamonds || 0) < MIN_DIAMOND_REDEMPTION}
              size="sm"
              className="pixel-button bg-diamond hover:bg-diamond/80 text-[10px] px-4"
            >
              Resgatar R$
            </Button>
          </div>

          {/* New Redemption Form Section (Hidden/Shown) */}
          {isNewRedemption && (
            <div className="p-4 pixel-border-gold bg-card space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center">
                <h4 className="text-[11px] font-bold text-primary">Solicitar novo Resgate PIX</h4>
                <button onClick={() => setIsNewRedemption(false)} className="text-muted-foreground hover:text-foreground">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {REDEMPTION_PACKAGES.map((pkg) => {
                  const canAfford = profile && profile.diamonds >= pkg.diamonds;
                  return (
                    <button
                      key={pkg.diamonds}
                      onClick={() => canAfford && setSelectedPackage(pkg)}
                      disabled={!canAfford}
                      className={cn(
                        'p-3 pixel-border text-center transition-all',
                        selectedPackage?.diamonds === pkg.diamonds
                          ? 'bg-diamond/20 border-diamond glow-diamond'
                          : canAfford
                            ? 'bg-muted/30 hover:bg-muted/50'
                            : 'opacity-50 cursor-not-allowed bg-muted/10'
                      )}
                    >
                      <p className="text-[12px] font-bold text-diamond">{pkg.diamonds} 💎</p>
                      <p className="text-[9px] text-accent font-bold">{pkg.label}</p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Chave PIX (E-mail, CPF, Celular)"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="pixel-border text-[11px] h-10"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canRedeem || isCreating}
                className="w-full pixel-button bg-diamond hover:bg-diamond/80 text-[11px] h-11"
              >
                {isCreating ? 'PROCESSANDO...' : 'CONFIRMAR RESGATE'}
              </Button>
            </div>
          )}

          {/* Incoming Codes (Gift Codes) */}
          <div className="p-4 pixel-border bg-card/40 space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-accent" />
              <h4 className="text-[10px] font-bold uppercase">Resgatar Código</h4>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="EX: TASK-XXXX-XXXX"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                className="pixel-border text-[10px] font-mono h-9"
              />
              <Button
                onClick={handleRedeemCode}
                disabled={isRedeeming || !giftCode.trim()}
                className="pixel-button bg-accent hover:bg-accent/80 text-[10px] h-9"
              >
                {isRedeeming ? '...' : 'ATIVAR'}
              </Button>
            </div>
          </div>

          {/* Unified History List */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Histórico de Atividade
            </h4>

            {combinedHistory.length === 0 ? (
              <div className="p-8 pixel-border bg-muted/10 text-center border-dashed">
                <Gem className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-[10px] text-muted-foreground">Nenhuma atividade registrada ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {combinedHistory.map((item) => {
                  const isIncoming = item.type === 'incoming';
                  const status = isIncoming
                    ? (item.status === 'completed' ? STATUS_CONFIG.completed : item.status === 'cancelled' ? STATUS_CONFIG.cancelled : STATUS_CONFIG.pending)
                    : STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];

                  const StatusIcon = status.icon;
                  const date = new Date(item.created_at);

                  return (
                    <div key={item.id} className={cn(
                      "p-3 pixel-border flex items-center gap-3 transition-colors",
                      isIncoming ? "bg-accent/5" : "bg-diamond/5"
                    )}>
                      <div className={cn(
                        "w-8 h-8 flex items-center justify-center pixel-border text-xs shrink-0",
                        isIncoming ? "bg-accent/20 text-accent" : "bg-diamond/20 text-diamond"
                      )}>
                        {isIncoming ? '📥' : '📤'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold">
                            {isIncoming ? 'Compra de Diamantes' : 'Resgate PIX'}
                          </span>
                          <Badge className={cn('text-[7px] h-4 px-1 pixel-border border-none', status.color)}>
                            <StatusIcon className="w-2 h-2 mr-1" />
                            {status.label.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className={cn("font-bold", isIncoming ? "text-accent" : "text-destructive")}>
                              {isIncoming ? '+' : '-'}{'diamonds_amount' in item ? item.diamonds_amount : item.diamonds_spent} 💎
                            </span>
                            {!isIncoming && 'real_value' in item && `→ R$ ${Number(item.real_value).toFixed(2)}`}
                          </span>
                          <span>{format(date, "dd MMM, HH:mm", { locale: ptBR })}</span>
                        </div>

                        {item.type === 'outgoing' && 'admin_code' in item && item.admin_code && item.status === 'completed' && (
                          <div className="mt-2 p-1.5 pixel-border bg-accent/10 flex justify-between items-center group/code">
                            <code className="text-[9px] font-bold text-accent">{item.admin_code}</code>
                            <Copy className="w-3 h-3 text-accent opacity-0 group-hover/code:opacity-100 cursor-pointer transition-opacity" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 pixel-border bg-muted/20 space-y-1">
            <p className="text-[8px] text-muted-foreground">
              💎 Diamantes são a moeda para resgates em dinheiro real.
            </p>
            <p className="text-[8px] text-muted-foreground">
              💡 Use o código do resgate caso precise falar com o suporte.
            </p>
            <p className="text-[8px] text-muted-foreground">
              ⏱️ O código será enviado por e-mail após análise (até 48h úteis).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
