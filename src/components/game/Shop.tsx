import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Gem, Copy, Check, ShoppingCart, Info, Lock, Clock, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
// import GooglePayButton from '@google-pay/button-react'; // Removido
import { SHOP_ITEMS, RARITY_COLORS, RARITY_LABELS } from '@/data/shopItems';
// import { RedeemCodeCard } from './RedeemCodeCard';
import { Item } from '@/types/game';
import { PixelAvatar } from './PixelAvatar';
import { getPaymentLink } from '@/config/stripeLinks';


interface ShopProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
}

const DIAMOND_PACKAGES = [
  { amount: 5, price: '5.00', label: 'R$ 5,00' },
  { amount: 10, price: '10.00', label: 'R$ 10,00' },
  { amount: 20, price: '20.00', label: 'R$ 20,00' },
  { amount: 30, price: '30.00', label: 'R$ 30,00' },
];

export function Shop({ open, onOpenChange, defaultTab = "weapons" }: ShopProps) {
  const { user } = useAuth();
  const { profile, isLoading: isProfileLoading } = useProfile();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedPackage, setSelectedPackage] = useState<typeof DIAMOND_PACKAGES[0] | null>(null);

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, open]);



  // Helper to convert string IDs to UUID format if they aren't already
  const toSafeUUID = (id: string) => {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
    // Deterministic "UUID" from string hash
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}-0000-0000-0000-000000000000`.substring(0, 36);
  };

  const purchaseItem = useMutation({
    mutationFn: async (item: Item) => {
      if (!profile || !user) throw new Error('Não autenticado');

      const isGold = item.priceType === 'gold';
      const price = Number(item.price);
      const currentGold = Number(profile.gold || 0);
      const currentDiamonds = Number(profile.diamonds || 0);
      const safeItemId = toSafeUUID(item.id);

      if (isGold && currentGold < price) throw new Error('Ouro insuficiente!');
      if (!isGold && currentDiamonds < price) throw new Error('Diamantes insuficientes!');

      // --- SYNC STEP SKIPPED: Assuming Admin/Seed handles shop_items population ---
      // Inserting from client-side often fails due to RLS policies.
      // If FK constraint fails, run the seed script.
      console.log('Processando compra do item:', item.name, safeItemId);

      /* 
       * REMOVED CLIENT-SIDE SYNC TO PREVENT PERMISSION ERRORS
       * The shop_items table should be populated via SQL Seed.
       */

      // 1. Update user currency first (Deduct money)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          gold: isGold ? currentGold - price : currentGold,
          diamonds: !isGold ? currentDiamonds - price : currentDiamonds
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // 2. Add to inventory
      const { data: existingItem } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .eq('item_id', safeItemId)
        .maybeSingle();

      if (existingItem) {
        const { error: invError } = await supabase
          .from('inventory')
          .update({ quantity: (existingItem.quantity || 1) + 1 })
          .eq('id', existingItem.id);
        if (invError) throw invError;
      } else {
        const { error: invError } = await supabase
          .from('inventory')
          .insert({
            user_id: user.id,
            item_id: safeItemId,
            quantity: 1
          });
        if (invError) throw invError;
      }

      return item;
    },

    onSuccess: async (item) => {
      // Force immediate and precise re-fetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }),
        queryClient.invalidateQueries({ queryKey: ['inventory', user?.id] }),
        queryClient.refetchQueries({ queryKey: ['profile', user?.id] }),
        queryClient.refetchQueries({ queryKey: ['inventory', user?.id] })
      ]);

      toast.success(`🛒 Comprou ${item.name}! Verifique sua mochila.`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getItemsByType = (types: string[]) => SHOP_ITEMS.filter(i => types.includes(i.type));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-border bg-card max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b border-border bg-muted/20">
          <DialogTitle className="text-[18px] text-[#ffb700] glow-gold text-center font-black tracking-widest uppercase flex items-center justify-center gap-2">
            🏪 Loja do Aventureiro 🏪
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-2 border-b border-border bg-muted/10">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap items-center justify-center w-full h-auto p-1.5 gap-1.5 bg-black/40 pixel-border border-[#3d2b7a]/50">
              <TabsTrigger
                value="weapons"
                className="text-[11px] font-black uppercase px-3 py-2.5 flex-1 min-w-[85px] data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                ⚔️ Armas
              </TabsTrigger>
              <TabsTrigger
                value="armor"
                className="text-[11px] font-black uppercase px-3 py-2.5 flex-1 min-w-[85px] data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
              >
                🛡️ Armaduras
              </TabsTrigger>
              <TabsTrigger
                value="legs"
                className="text-[11px] font-black uppercase px-3 py-2.5 flex-1 min-w-[85px] data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400"
              >
                👖 Pernas
              </TabsTrigger>
              <TabsTrigger
                value="mounts"
                className="text-[11px] font-black uppercase px-3 py-2.5 flex-1 min-w-[85px] data-[state=active]:bg-amber-700/20 data-[state=active]:text-amber-500"
              >
                🐴 Montarias
              </TabsTrigger>
              <TabsTrigger
                value="special"
                className="text-[11px] font-black uppercase px-3 py-2.5 flex-1 min-w-[85px] data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
              >
                🧪 Itens
              </TabsTrigger>
              <TabsTrigger
                value="accessories"
                className="text-[11px] font-black uppercase px-3 py-2.5 flex-1 min-w-[85px] data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                💍 Acessórios
              </TabsTrigger>
              <TabsTrigger
                value="backgrounds"
                className="text-[11px] font-black uppercase px-3 py-2.5 flex-1 min-w-[85px] data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400"
              >
                🖼️ Cenários
              </TabsTrigger>
              <TabsTrigger
                value="diamonds"
                className="text-[11px] font-black uppercase px-3 py-2.5 flex-1 min-w-[110px] italic text-diamond bg-diamond/5 shadow-inner border-diamond/20 transition-all data-[state=active]:bg-diamond/30 data-[state=active]:text-white animate-pulse"
              >
                💎 Diamantes
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <p className="text-[10px] text-center text-muted-foreground mb-4 font-bold flex items-center justify-center gap-2">
              ✨ Personalize o fundo do seu perfil com cenários únicos!
            </p>

            {isProfileLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-[10px] uppercase font-bold">Sincronizando Inventário...</span>
              </div>
            ) : (
              <>
                <TabsContent value="weapons" className="m-0 space-y-3">
                  {getItemsByType(['weapon']).map((item) => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      profile={profile}
                      onPurchase={() => {
                        toast.info(`🚀 Processando pedido: ${item.name}...`);
                        purchaseItem.mutate(item);
                      }}
                      isPurchasing={purchaseItem.isPending}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="armor" className="m-0 space-y-3">
                  {getItemsByType(['armor', 'helmet', 'shield', 'hat']).map((item) => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      profile={profile}
                      onPurchase={() => {
                        toast.info(`🚀 Processando pedido: ${item.name}...`);
                        purchaseItem.mutate(item);
                      }}
                      isPurchasing={purchaseItem.isPending}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="legs" className="m-0 space-y-3">
                  {getItemsByType(['legs']).map((item) => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      profile={profile}
                      onPurchase={() => {
                        toast.info(`🚀 Processando pedido: ${item.name}...`);
                        purchaseItem.mutate(item);
                      }}
                      isPurchasing={purchaseItem.isPending}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="mounts" className="m-0 space-y-3">
                  {getItemsByType(['mount', 'skin']).map((item) => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      profile={profile}
                      onPurchase={() => {
                        toast.info(`🚀 Processando pedido: ${item.name}...`);
                        purchaseItem.mutate(item);
                      }}
                      isPurchasing={purchaseItem.isPending}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="special" className="m-0 space-y-3">
                  {getItemsByType(['special', 'consumable']).map((item) => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      profile={profile}
                      onPurchase={() => {
                        toast.info(`🚀 Processando pedido: ${item.name}...`);
                        purchaseItem.mutate(item);
                      }}
                      isPurchasing={purchaseItem.isPending}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="accessories" className="m-0 space-y-3">
                  {getItemsByType(['accessory']).map((item) => (
                    <ShopItemCard
                      key={item.id}
                      item={item}
                      profile={profile}
                      onPurchase={() => {
                        toast.info(`🚀 Processando pedido: ${item.name}...`);
                        purchaseItem.mutate(item);
                      }}
                      isPurchasing={purchaseItem.isPending}
                    />
                  ))}
                </TabsContent>
                <TabsContent value="backgrounds" className="m-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {getItemsByType(['background']).map((item) => (
                      <div key={item.id} className="p-2 pixel-border bg-card group relative overflow-hidden flex flex-col gap-2">
                        {/* Banner do Cenário */}
                        <div className="relative w-full h-24 overflow-hidden rounded pixel-border bg-[#1a1035]">
                          <img
                            src={`/assets/sprites/background/${item.id}.png`}
                            alt={item.name}
                            className="w-full h-full object-cover pixelated group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[12px] font-black text-white glow-gold tracking-tight">{item.name}</h3>
                              <Badge variant="outline" className={cn("text-[7px] h-3 px-1 border-none bg-black/40", RARITY_COLORS[item.rarity])}>
                                {RARITY_LABELS[item.rarity].toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Botão e Info */}
                        <div className="flex items-center justify-between px-1 pb-1">
                          <p className="text-[9px] text-muted-foreground italic truncate flex-1 mr-2">{item.description}</p>
                          <button
                            onClick={() => {
                              toast.info(`🚀 Adquirindo cenário: ${item.name}...`);
                              purchaseItem.mutate(item);
                            }}
                            disabled={purchaseItem.isPending}
                            className={cn(
                              "pixel-button text-[10px] h-8 px-4 flex items-center gap-1",
                              item.priceType === 'gold' ? "bg-gold text-black" : "bg-diamond text-white"
                            )}
                          >
                            {purchaseItem.isPending ? '...' : (
                              <>
                                {item.price} {item.priceType === 'gold' ? '💰' : '💎'}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="diamonds" className="m-0 space-y-4">


                  <div className="p-4 pixel-border bg-muted/30 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 pixel-border bg-diamond/20 flex items-center justify-center">
                        <Gem className="w-7 h-7 text-diamond animate-pulse" />
                      </div>
                      <h3 className="text-[14px] font-black uppercase tracking-tighter text-diamond">Carteira Google Pay</h3>
                    </div>

                    <div className="bg-card pixel-border p-4">
                      {!selectedPackage ? (
                        <>
                          <p className="text-[12px] text-muted-foreground mb-4 font-bold text-center">Selecione o pacote de diamantes:</p>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {DIAMOND_PACKAGES.map((pkg) => (
                              <button
                                key={pkg.amount}
                                onClick={() => setSelectedPackage(pkg)}
                                className="p-5 pixel-border text-center transition-all group relative bg-card hover:bg-muted/50 hover:scale-105 active:scale-95"
                              >
                                <Gem className="w-10 h-10 mx-auto text-diamond mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-[18px] font-black text-diamond leading-none">{pkg.amount}</p>
                                <p className="text-[10px] text-muted-foreground font-mono mt-1 font-bold">{pkg.label}</p>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in">
                          <div className="text-center space-y-2">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Pacote Selecionado</p>
                            <div className="flex items-center justify-center gap-2">
                              <Gem className="w-6 h-6 text-diamond" />
                              <span className="text-[20px] font-black text-diamond">{selectedPackage.amount} Diamantes</span>
                            </div>
                            <p className="text-[14px] font-mono font-bold text-white">{selectedPackage.label}</p>
                          </div>

                          <div className="my-4 w-full flex justify-center">
                            {/* GOOGLE PAY BUTTON */}
                            <div className="w-full space-y-3">
                              {/* Botão de Pagamento via Link Stripe */}
                              <Button
                                className="w-full bg-[#635BFF] hover:bg-[#5851E2] text-white font-bold h-12 text-md shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                                onClick={() => {
                                  if (!getPaymentLink(selectedPackage.amount, user.id)) {
                                    toast.error("Link de pagamento indisponível no momento.");
                                    return;
                                  }

                                  const link = getPaymentLink(selectedPackage.amount, user.id);
                                  if (link) {
                                    window.open(link, '_blank');
                                    toast.success("Aba de pagamento aberta!", {
                                      duration: 5000,
                                      description: "Aguarde! Seus diamantes serão entregues automaticamente assim que o pagamento confirmar."
                                    });
                                  }
                                }}
                              >
                                <span>Pagar com Cartão / Google Pay</span>
                                <ExternalLink className="w-4 h-4" />
                              </Button>

                              <p className="text-[10px] text-muted-foreground text-center px-4">
                                Você será redirecionado para a página segura do Stripe.
                                <br /><span className="text-green-400 font-bold">Automático:</span> Seus diamantes chegarão em instantes após a confirmação!
                              </p>
                            </div>


                          </div>

                          <Button
                            variant="ghost"
                            className="text-[10px] text-muted-foreground hover:text-red-400"
                            onClick={() => setSelectedPackage(null)}
                          >
                            Cancelar / Voltar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ShopItemCardProps {
  item: Item;
  profile: any;
  onPurchase: () => void;
  isPurchasing: boolean;
}

function ShopItemCard({ item, profile, onPurchase, isPurchasing }: ShopItemCardProps) {
  const isGold = item.priceType === 'gold';
  const isLegendary = item.rarity === 'legendary';
  const userBalance = isGold ? Number(profile?.gold || 0) : Number(profile?.diamonds || 0);
  const canAfford = userBalance >= Number(item.price);

  const attributeMap: Record<string, string> = {
    strength: 'Força',
    intelligence: 'Inteligência',
    agility: 'Agilidade',
    vitality: 'Vida',
    endurance: 'Resistência',
    hp: 'HP Máx',
    mana: 'Mana Máx',
    damage: 'Dano',
    xpBonus: 'Bônus XP',
    goldBonus: 'Bônus Ouro',
  };

  return (
    <div className={cn(
      "p-3 pixel-border bg-card flex items-center gap-3 transition-all group relative overflow-hidden",
      isLegendary && "pixel-border-gold bg-gradient-to-r from-gold/10 to-transparent",
      !canAfford && "opacity-90"
    )}>
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-150 transition-transform duration-500 pointer-events-none">
        <span className="text-8xl">{item.icon}</span>
      </div>

      <div className={cn(
        "w-20 h-20 pixel-border flex items-center justify-center text-2xl relative shrink-0 overflow-hidden",
        item.type !== 'background' && "bg-muted",
        isLegendary && "bg-gold/10 glow-gold"
      )}>
        {item.type === 'background' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="scale-[0.8]">
              <PixelAvatar
                playerClass={profile?.player_class}
                equippedHat={profile?.equipped_hat}
                equippedArmor={profile?.equipped_armor}
                equippedWeapon={profile?.equipped_weapon}
                equippedShield={profile?.equipped_shield}
                equippedLegs={profile?.equipped_legs}
                equippedAccessory={profile?.equipped_accessory}
                equippedBackground={item.id}
                size={80}
              />
            </div>
          </div>
        ) : (
          item.icon
        )}
        {isLegendary && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="bg-gold text-black text-[6px] px-1 font-bold h-3 flex items-center shadow-lg">LENDÁRIO</div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "text-[11px] font-bold truncate",
            isLegendary ? "text-gold" : "text-foreground"
          )}>
            {item.name}
          </h3>
          <Badge variant="outline" className={cn("text-[6px] h-3 px-1 border-none", RARITY_COLORS[item.rarity])}>
            {RARITY_LABELS[item.rarity].toUpperCase()}
          </Badge>
        </div>
        <p className="text-[8px] text-muted-foreground line-clamp-1">{item.description}</p>

        <div className="flex gap-2 mt-1 flex-wrap">
          {item.effects.map((effect, idx) => (
            <span key={idx} className="text-[7px] text-accent font-bold bg-accent/5 px-1 italic">
              +{effect.value} {attributeMap[effect.attribute] || effect.attribute}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('CLICKED PURCHASE', item.name);
          onPurchase();
        }}
        disabled={isPurchasing}
        className={cn(
          "pixel-button text-[10px] h-9 px-3 shrink-0 relative z-50 flex items-center justify-center gap-1 min-w-[80px]",
          item.priceType === 'gold' ? "bg-gold text-black active:translate-y-1" : "bg-diamond hover:bg-diamond/80 text-white active:translate-y-1",
          isPurchasing && "opacity-50 cursor-not-allowed"
        )}
      >
        {isPurchasing ? '...' : (
          <>
            {item.price} {item.priceType === 'gold' ? '💰' : '💎'}
          </>
        )}
      </button>
    </div>
  );
}
