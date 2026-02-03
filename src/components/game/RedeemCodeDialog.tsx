import { useState } from 'react';
import { useGiftCodes } from '@/hooks/useGiftCodes';
import { useDiamondCodes } from '@/hooks/useDiamondCodes';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Gem, Gift, Copy, Check, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface RedeemCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PIX_KEY = 'fitquestplay@gmail.com';

export function RedeemCodeDialog({ open, onOpenChange }: RedeemCodeDialogProps) {
  const { redeemCode: redeemGiftCode, isRedeeming: isRedeemingGift } = useGiftCodes();
  const { redeemCode: redeemDiamondCode, isRedeeming: isRedeemingDiamond } = useDiamondCodes();
  const { profile } = useProfile();
  const [code, setCode] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);

  const isRedeeming = isRedeemingGift || isRedeemingDiamond;

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error('Digite um código válido');
      return;
    }
    
    // Try the new diamond_codes table first via RPC
    redeemDiamondCode(code, {
      onSuccess: () => {
        setCode('');
      },
      onError: () => {
        // Fallback to gift_codes table
        redeemGiftCode(code, {
          onSuccess: () => {
            setCode('');
          },
        });
      },
    });
  };

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
    toast.success('Chave PIX copiada!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-dialog max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px] flex items-center gap-2 text-diamond">
            <Gift className="w-5 h-5" />
            Resgatar Código
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Balance */}
          <div className="flex items-center justify-between p-3 pixel-border bg-gradient-to-r from-diamond/10 to-diamond/5">
            <span className="text-[10px] text-muted-foreground">Seus Diamantes:</span>
            <span className="text-[14px] font-bold text-diamond flex items-center gap-1">
              <Gem className="w-5 h-5" />
              {profile?.diamonds || 0} 💎
            </span>
          </div>

          {/* Redeem Code Input */}
          <div className="p-4 pixel-border bg-card space-y-3">
            <h4 className="text-[10px] font-bold text-center">Digite seu código de resgate</h4>
            
            <div className="space-y-2">
              <Input
                placeholder="Ex: ABC123XYZ"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="pixel-border text-[12px] text-center font-mono tracking-widest"
                maxLength={20}
              />
            </div>

            <Button
              onClick={handleRedeem}
              disabled={isRedeeming || !code.trim()}
              className="w-full pixel-button bg-diamond hover:bg-diamond/80 text-[10px]"
            >
              {isRedeeming ? (
                'Validando...'
              ) : (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Resgatar Código
                </>
              )}
            </Button>

            {/* Info message about email */}
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded text-center">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-[8px] text-muted-foreground">
                Seu código de resgate será encaminhado ao e-mail em até 24h
              </p>
            </div>
          </div>

          {/* How to get codes */}
          <div className="p-4 pixel-border bg-muted/20 space-y-3">
            <h4 className="text-[10px] font-bold text-center">Como obter códigos?</h4>
            
            <p className="text-[9px] text-muted-foreground text-center">
              Faça um PIX para a chave abaixo e envie o comprovante para receber seu código de diamantes!
            </p>

            <div className="flex gap-2">
              <Input
                value={PIX_KEY}
                readOnly
                className="pixel-border text-[10px] bg-input font-mono"
              />
              <Button
                onClick={copyPix}
                className="pixel-button"
                variant="outline"
                size="icon"
              >
                {copiedPix ? (
                  <Check className="w-4 h-4 text-accent" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 pixel-border bg-card">
                <p className="text-[10px] text-diamond font-bold">10 💎</p>
                <p className="text-[8px] text-muted-foreground">R$ 5,00</p>
              </div>
              <div className="p-2 pixel-border bg-card">
                <p className="text-[10px] text-diamond font-bold">20 💎</p>
                <p className="text-[8px] text-muted-foreground">R$ 9,00</p>
              </div>
              <div className="p-2 pixel-border bg-card">
                <p className="text-[10px] text-diamond font-bold">30 💎</p>
                <p className="text-[8px] text-muted-foreground">R$ 12,00</p>
              </div>
              <div className="p-2 pixel-border bg-card">
                <p className="text-[10px] text-diamond font-bold">50 💎</p>
                <p className="text-[8px] text-muted-foreground">R$ 20,00</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 pixel-border bg-muted/20 space-y-1">
            <p className="text-[8px] text-muted-foreground">
              💎 Diamantes são usados para upgrades e resgates em dinheiro.
            </p>
            <p className="text-[8px] text-muted-foreground">
              📧 Envie o comprovante para o mesmo e-mail do PIX.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
