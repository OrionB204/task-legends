import { useInventory, InventoryItem } from '@/hooks/useInventory';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Package, Sword, Shield, Shirt, MousePointer2, TrendingUp, Sparkles } from 'lucide-react';
import { PixelAvatar } from './PixelAvatar';
import { SHOP_ITEMS, RARITY_COLORS } from '@/data/shopItems';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Mapping for attribute names and icons
const ATTRIBUTE_INFO: Record<string, { label: string; icon: string; color: string }> = {
    strength: { label: 'FOR', icon: '💪', color: 'text-red-400' },
    intelligence: { label: 'INT', icon: '🧠', color: 'text-blue-400' },
    agility: { label: 'AGI', icon: '⚡', color: 'text-yellow-400' },
    vitality: { label: 'VIT', icon: '❤️', color: 'text-pink-400' },
    endurance: { label: 'RES', icon: '🛡️', color: 'text-green-400' },
    constitution: { label: 'CON', icon: '🏋️', color: 'text-orange-400' },
    perception: { label: 'PER', icon: '👁️', color: 'text-purple-400' },
    damage: { label: 'DMG', icon: '⚔️', color: 'text-red-500' },
    hp: { label: 'HP', icon: '💗', color: 'text-red-300' },
    mana: { label: 'MP', icon: '💧', color: 'text-blue-300' },
    goldBonus: { label: 'Ouro%', icon: '🪙', color: 'text-yellow-500' },
    xpBonus: { label: 'XP%', icon: '⭐', color: 'text-purple-300' },
};

// Component to display item effects
function ItemEffects({ effects, compact = false }: { effects: { attribute: string; value: number }[]; compact?: boolean }) {
    if (!effects || effects.length === 0) return null;

    return (
        <div className={cn(
            "flex flex-wrap gap-1",
            compact ? "mt-0.5" : "mt-1"
        )}>
            {effects.map((effect, idx) => {
                const info = ATTRIBUTE_INFO[effect.attribute] || { label: effect.attribute, icon: '📊', color: 'text-muted-foreground' };
                return (
                    <span
                        key={idx}
                        className={cn(
                            "inline-flex items-center gap-0.5 px-1 rounded text-[7px] font-bold bg-black/30",
                            info.color
                        )}
                    >
                        <span>{info.icon}</span>
                        <span>+{effect.value}</span>
                        {!compact && <span className="opacity-70">{info.label}</span>}
                    </span>
                );
            })}
        </div>
    );
}

// Component to display equipped slot with effects
function EquippedSlot({ type, itemId, label, onUnequip }: {
    type: string;
    itemId: string | null;
    label: string;
    onUnequip: (type: string) => void;
}) {
    const toSafeUUID = (id: string) => {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash |= 0;
        }
        const hex = Math.abs(hash).toString(16).padStart(8, '0');
        return `${hex}-0000-0000-0000-000000000000`.substring(0, 36);
    };

    const getItemData = (id: string | null) => {
        if (!id) return null;
        return SHOP_ITEMS.find(i => toSafeUUID(i.id) === id || i.id === id);
    };

    const item = getItemData(itemId);
    const rarityClass = item ? RARITY_COLORS[item.rarity] || '' : '';

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "p-2 pixel-border bg-muted/50 flex flex-col items-center gap-1 min-h-[70px] justify-center relative transition-all hover:bg-muted/70",
                        item && rarityClass
                    )}>
                        <span className="text-[7px] uppercase text-muted-foreground font-bold">{label}</span>
                        {item ? (
                            <>
                                <span className="text-sm">{item.icon}</span>
                                <span className={cn("text-[8px] font-bold text-center truncate w-full px-1", rarityClass)}>
                                    {item.name}
                                </span>
                                {item.effects && (
                                    <ItemEffects effects={item.effects} compact />
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground text-lg">—</span>
                        )}
                        {item && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-1 right-1 h-4 w-4 text-destructive hover:bg-destructive/10"
                                onClick={() => onUnequip(type)}
                            >
                                ×
                            </Button>
                        )}
                    </div>
                </TooltipTrigger>
                {item && (
                    <TooltipContent side="top" className="pixel-border bg-card p-2 max-w-[200px]">
                        <p className={cn("font-bold text-xs", rarityClass)}>{item.name}</p>
                        <p className="text-[9px] text-muted-foreground mt-1">{item.description}</p>
                        {item.effects && (
                            <div className="mt-2 pt-1 border-t border-border">
                                <p className="text-[8px] text-muted-foreground mb-1">Atributos:</p>
                                <ItemEffects effects={item.effects} />
                            </div>
                        )}
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
}

// Component for inventory item card
function InventoryItemCard({
    invItem,
    onUse,
    isEquipped,
    onUnequip
}: {
    invItem: InventoryItem;
    onUse: (item: InventoryItem) => void;
    isEquipped: boolean;
    onUnequip: () => void;
}) {
    const toSafeUUID = (id: string) => {
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash |= 0;
        }
        const hex = Math.abs(hash).toString(16).padStart(8, '0');
        return `${hex}-0000-0000-0000-000000000000`.substring(0, 36);
    };

    const localItem = SHOP_ITEMS.find(i => toSafeUUID(i.id) === invItem.item_id || i.id === invItem.item_id);
    const itemData = localItem || invItem.item;
    const rarityClass = localItem ? RARITY_COLORS[localItem.rarity] || '' : '';

    if (!itemData) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        className={cn(
                            "p-2 pixel-border bg-muted/30 hover:bg-muted/50 transition-all flex flex-col gap-2 relative group min-h-[100px]",
                            rarityClass && `border-l-2 ${rarityClass.split(' ')[1]}`,
                            isEquipped && "ring-1 ring-primary/50 bg-primary/5"
                        )}
                    >
                        <div className="flex justify-between items-start">
                            <div className={cn("p-1 pixel-border bg-card", rarityClass)}>
                                <span className="text-sm">
                                    {localItem?.icon || invItem.item?.icon || (invItem.item?.item_type === 'consumable' ? '🧪' : '⚔️')}
                                </span>
                            </div>
                            <span className="bg-primary text-primary-foreground text-[7px] px-1 pixel-border font-bold">
                                x{invItem.quantity}
                            </span>
                        </div>

                        <div className="space-y-0.5">
                            <p className={cn("text-[8px] font-bold leading-tight truncate", rarityClass)}>
                                {localItem?.name || invItem.item?.name}
                            </p>
                            {localItem?.effects && <ItemEffects effects={localItem.effects} compact />}
                        </div>

                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                isEquipped ? onUnequip() : onUse(invItem);
                            }}
                            className={cn(
                                "h-5 text-[7px] pixel-button mt-auto font-black",
                                isEquipped
                                    ? "bg-destructive hover:bg-destructive/80 text-white"
                                    : "bg-primary hover:bg-primary/80 text-primary-foreground"
                            )}
                        >
                            {invItem.item?.item_type === 'consumable' ? 'USAR' : (isEquipped ? 'DESEQUIPAR' : 'EQUIPAR')}
                        </Button>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="pixel-border bg-card p-2 max-w-[220px]">
                    <p className={cn("font-bold text-xs", rarityClass)}>{localItem?.name || invItem.item?.name}</p>
                    <p className="text-[9px] text-muted-foreground mt-1">{localItem?.description || invItem.item?.description}</p>
                    {localItem?.effects && (
                        <div className="mt-2 pt-1 border-t border-border">
                            <p className="text-[8px] text-green-400 font-bold mb-1 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Bônus:
                            </p>
                            <ItemEffects effects={localItem.effects} />
                        </div>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Bonus Stats Summary Component
function BonusStatsSummary({ bonusStats }: { bonusStats: Record<string, number> }) {
    const activeStats = Object.entries(bonusStats).filter(([_, value]) => value > 0);

    if (activeStats.length === 0) return null;

    return (
        <Card className="pixel-border bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/50">
            <CardHeader className="pb-1 p-2">
                <CardTitle className="text-[10px] flex items-center gap-1 text-purple-300">
                    <Sparkles className="w-3 h-3" /> Bônus de Equipamentos
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
                <div className="flex flex-wrap gap-1">
                    {activeStats.map(([stat, value]) => {
                        const info = ATTRIBUTE_INFO[stat] || { label: stat, icon: '📊', color: 'text-muted-foreground' };
                        return (
                            <span
                                key={stat}
                                className={cn(
                                    "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold bg-black/40",
                                    info.color
                                )}
                            >
                                <span>{info.icon}</span>
                                <span>+{value}</span>
                                <span className="opacity-70 ml-0.5">{info.label}</span>
                            </span>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export function InventoryPanel() {
    const { inventory, useItem, unequipItem, isLoading } = useInventory();
    const { profile, bonusStats, equippedItemsData } = useProfile();

    if (isLoading) {
        return <div className="p-4 text-center">Carregando inventário...</div>;
    }

    const equippedSlots = [
        { type: 'hat', itemId: profile?.equipped_hat || null, label: 'Cabeça' },
        { type: 'armor', itemId: profile?.equipped_armor || null, label: 'Corpo' },
        { type: 'legs', itemId: profile?.equipped_legs || null, label: 'Pernas' },
        { type: 'weapon', itemId: profile?.equipped_weapon || null, label: 'Arma' },
        { type: 'shield', itemId: profile?.equipped_shield || null, label: 'Escudo' },
        { type: 'accessory', itemId: profile?.equipped_accessory || null, label: 'Acessório' },
        { type: 'skin', itemId: profile?.equipped_skin || null, label: 'Pele' },
        { type: 'mount', itemId: profile?.equipped_mount || null, label: 'Montaria' },
        { type: 'background', itemId: profile?.equipped_background || null, label: 'Cenário' },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Character Preview */}
            <Card className="pixel-border bg-card">
                <CardHeader className="pb-2 p-3">
                    <CardTitle className="text-[12px] flex items-center gap-2">
                        <MousePointer2 className="w-4 h-4" /> Equipamento Atual
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-3">
                    <div className="flex justify-center py-4 bg-muted/30 pixel-border relative min-h-[140px]">
                        {profile && (
                            <PixelAvatar
                                playerClass={profile.player_class}
                                equippedHat={profile.equipped_hat}
                                equippedArmor={profile.equipped_armor}
                                equippedWeapon={profile.equipped_weapon}
                                equippedShield={profile.equipped_shield}
                                equippedSkin={profile.equipped_skin}
                                equippedMount={profile.equipped_mount}
                                equippedLegs={profile.equipped_legs}
                                equippedAccessory={profile.equipped_accessory}
                                equippedBackground={profile.equipped_background}
                                equippedItemsData={equippedItemsData}
                                size={120}
                                showEffects={true}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {equippedSlots.map((slot) => (
                            <EquippedSlot
                                key={slot.type}
                                type={slot.type}
                                itemId={slot.itemId}
                                label={slot.label}
                                onUnequip={unequipItem}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Bonus Stats Summary */}
            {bonusStats && <BonusStatsSummary bonusStats={bonusStats} />}

            {/* Inventory List */}
            <Card className="pixel-border bg-card">
                <CardHeader className="pb-2 p-3">
                    <CardTitle className="text-[12px] flex items-center gap-2 font-black uppercase">
                        <Package className="w-4 h-4" /> Mochila
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                    <ScrollArea className="h-[300px] pr-2">
                        <div className="grid grid-cols-2 gap-2">
                            {inventory.length === 0 ? (
                                <p className="col-span-full text-center text-muted-foreground py-10 text-[9px]">
                                    Mochila vazia. <br /> Visite a loja!
                                </p>
                            ) : (
                                inventory.map((invItem) => {
                                    // Detect item type for unequipping logic
                                    const itemType = (invItem.item?.item_type || (invItem.item as any)?.type || '').toLowerCase();

                                    // Check if this specific item ID is equipped in any slot
                                    const equipmentFields = [
                                        'equipped_hat', 'equipped_armor', 'equipped_weapon', 'equipped_shield',
                                        'equipped_skin', 'equipped_mount', 'equipped_accessory', 'equipped_legs',
                                        'equipped_background'
                                    ];
                                    const isEquipped = profile && equipmentFields.some(field =>
                                        profile[field as keyof typeof profile] === invItem.item_id
                                    );

                                    return (
                                        <InventoryItemCard
                                            key={invItem.id}
                                            invItem={invItem}
                                            onUse={useItem}
                                            isEquipped={!!isEquipped}
                                            onUnequip={() => unequipItem(itemType)}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
