import { useDiamondTransactions } from '@/hooks/useDiamondTransactions';
import { useProfile } from '@/hooks/useProfile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Gem, TrendingUp, TrendingDown, Gift, RefreshCcw, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DiamondHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRANSACTION_CONFIG = {
  earned: { label: 'Ganho', icon: TrendingUp, color: 'bg-accent/20 text-accent' },
  spent: { label: 'Gasto', icon: TrendingDown, color: 'bg-destructive/20 text-destructive' },
  purchased: { label: 'Comprado', icon: ShoppingCart, color: 'bg-diamond/20 text-diamond' },
  refunded: { label: 'Reembolso', icon: RefreshCcw, color: 'bg-gold/20 text-gold' },
  bonus: { label: 'Bônus', icon: Gift, color: 'bg-primary/20 text-primary' },
};

export function DiamondHistory({ open, onOpenChange }: DiamondHistoryProps) {
  const { transactions, isLoading } = useDiamondTransactions();
  const { profile } = useProfile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-dialog max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px] flex items-center gap-2 text-diamond">
            <Gem className="w-5 h-5" />
            Histórico de Diamantes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Balance */}
          <div className="flex items-center justify-between p-4 pixel-border bg-gradient-to-r from-diamond/10 to-diamond/5">
            <span className="text-[10px] text-muted-foreground">Saldo Atual:</span>
            <span className="text-[16px] font-bold text-diamond flex items-center gap-2">
              <Gem className="w-5 h-5" />
              {profile?.diamonds || 0} 💎
            </span>
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-muted-foreground">Transações Recentes</h4>
            
            {isLoading ? (
              <div className="p-6 pixel-border bg-card/50 text-center">
                <p className="text-[10px] text-muted-foreground animate-pulse">
                  Carregando...
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-6 pixel-border bg-card/50 text-center">
                <Gem className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-[10px] text-muted-foreground">
                  Nenhuma transação ainda
                </p>
                <p className="text-[8px] text-muted-foreground mt-1">
                  Compre diamantes na loja para começar!
                </p>
              </div>
            ) : (
              transactions.map((tx) => {
                const config = TRANSACTION_CONFIG[tx.transaction_type];
                const Icon = config.icon;
                const isPositive = tx.amount > 0;
                
                return (
                  <div
                    key={tx.id}
                    className="p-3 pixel-border bg-card space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={cn('text-[8px] pixel-border', config.color)}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <span className={cn(
                        'text-[12px] font-bold',
                        isPositive ? 'text-accent' : 'text-destructive'
                      )}>
                        {isPositive ? '+' : ''}{tx.amount} 💎
                      </span>
                    </div>
                    
                    <p className="text-[9px] text-foreground">{tx.description}</p>
                    
                    <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                      <span>Saldo: {tx.balance_after} 💎</span>
                      <span>{format(new Date(tx.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Info */}
          <div className="p-3 pixel-border bg-muted/20 space-y-1">
            <p className="text-[8px] text-muted-foreground">
              💎 Diamantes são usados para resgates em dinheiro real.
            </p>
            <p className="text-[8px] text-muted-foreground">
              🪙 Use Ouro para comprar benefícios personalizados.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
