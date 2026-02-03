import * as React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Profile } from "@/hooks/useProfile";
import { PixelAvatar } from "@/components/game/PixelAvatar";
import { SHOP_ITEMS } from "@/data/shopItems";
import { calculateMaxHp, calculateMaxMana, xpToNextLevel } from "@/lib/gameFormulas";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Sword, Shield, Shirt, Crown, PawPrint, Sparkles, Heart, Zap, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FriendHoverCardProps {
    children: React.ReactNode;
    profile: Profile | null;
    online?: boolean;
}

export function FriendHoverCard({ children, profile, online }: FriendHoverCardProps) {
    if (!profile) return <>{children}</>;

    // 1. Calculate Stats based on Equipment + Base
    // Similar logic to useProfile, simplified for display
    const equippedItemIds = [
        profile.equipped_weapon,
        profile.equipped_armor,
        profile.equipped_shield,
        profile.equipped_hat,
        profile.equipped_mount,
        profile.equipped_skin // Skin might modify stats? Usually cosmetic but checking shop items
    ].filter(Boolean);

    const bonusStats = equippedItemIds.reduce((acc, id) => {
        const item = SHOP_ITEMS.find(i => i.id === id);
        if (item && item.effects) {
            item.effects.forEach(effect => {
                const attr = effect.attribute;
                // @ts-ignore - dynamic key access
                if (acc[attr] !== undefined) acc[attr] += effect.value;
            });
        }
        return acc;
    }, {
        strength: 0,
        intelligence: 0,
        constitution: 0,
        perception: 0,
        agility: 0,
        vitality: 0,
        endurance: 0,
        hp: 0,
        mana: 0,
    });

    const totalStr = (profile.strength || 0) + bonusStats.strength;
    const totalInt = (profile.intelligence || 0) + bonusStats.intelligence;
    const totalCon = (profile.constitution || 0) + bonusStats.constitution;
    const totalPer = (profile.perception || 0) + bonusStats.perception;

    // Calculate Max Pools
    const maxHp = (100 + (profile.level - 1) * 10 + totalCon * 5) + (bonusStats.hp || 0) + (bonusStats.vitality * 5); // Vitality usually adds to HP too in many games, adhering to constitution formula mainly but showing vitality bonus if any
    // Note: gameFormulas uses Base + Constitution * 5. 
    // Shop items have 'vitality' which maps to HP usually? or just a stat. 
    // Let's stick to the formula: 
    // maxHp = 100 + (level-1)*10 + totalCon*5 + bonusStats.hp directly. 
    // Vitality usually maps to Constitution in some games or is separate. 
    // Let's assume for this preview we just use con.

    const maxMana = (50 + (profile.level - 1) * 5 + totalInt * 5) + (bonusStats.mana || 0);
    const nextLevelXp = xpToNextLevel(profile.level);

    // Helper to find item icon
    const getItemIcon = (id: string | null) => {
        if (!id) return null;
        const item = SHOP_ITEMS.find(i => i.id === id);
        return item ? item.icon : null;
    };

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80 pixel-border bg-card p-0 overflow-hidden shadow-2xl" side="right" align="start">
                {/* Header */}
                <div className="bg-muted p-3 flex items-center gap-3 border-b border-border">
                    <div className="relative">
                        <div className="w-12 h-12 pixel-border bg-background p-0.5">
                            <PixelAvatar
                                playerClass={profile.player_class}
                                equippedHat={profile.equipped_hat}
                                equippedArmor={profile.equipped_armor}
                                equippedSkin={profile.equipped_skin} // Skin might override body
                                size={44}
                            />
                        </div>
                        {online && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background animate-pulse" />}
                    </div>
                    <div>
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            {profile.username}
                            <Badge variant="outline" className="text-[9px] h-4 px-1 bg-background">
                                {(profile.player_class || 'aprendiz').toUpperCase()}
                            </Badge>
                        </h4>
                        <p className="text-[10px] text-muted-foreground">Nível {profile.level}</p>
                    </div>
                </div>

                <div className="p-3 space-y-3">
                    {/* Stats Bars */}
                    <div className="space-y-1.5">
                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[8px] uppercase font-bold text-muted-foreground">
                                <span className="flex items-center gap-1 text-hp"><Heart className="w-2 h-2" /> HP</span>
                                <span>{profile.current_hp}/{maxHp}</span>
                            </div>
                            <Progress value={((profile.current_hp || 0) / (maxHp || 1)) * 100} className="h-2 bg-muted [&>div]:bg-hp" />
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[8px] uppercase font-bold text-muted-foreground">
                                <span className="flex items-center gap-1 text-mana"><Zap className="w-2 h-2" /> Mana</span>
                                <span>{profile.current_mana || 0}/{maxMana}</span>
                            </div>
                            <Progress value={((profile.current_mana || 0) / (maxMana || 1)) * 100} className="h-2 bg-muted [&>div]:bg-mana" />
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex justify-between text-[8px] uppercase font-bold text-muted-foreground">
                                <span className="flex items-center gap-1 text-gold"><Star className="w-2 h-2" /> XP</span>
                                <span>{profile.current_xp || 0}/{nextLevelXp}</span>
                            </div>
                            <Progress value={((profile.current_xp || 0) / (nextLevelXp || 1)) * 100} className="h-2 bg-muted [&>div]:bg-gold" />
                        </div>
                    </div>

                    {/* Attributes Grid */}
                    <div className="grid grid-cols-4 gap-2 py-2 border-y border-border/50">
                        <div className="text-center">
                            <p className="text-[8px] text-muted-foreground uppercase">FOR</p>
                            <p className="text-xs font-bold">{totalStr}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] text-muted-foreground uppercase">INT</p>
                            <p className="text-xs font-bold">{totalInt}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] text-muted-foreground uppercase">CON</p>
                            <p className="text-xs font-bold">{totalCon}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] text-muted-foreground uppercase">PER</p>
                            <p className="text-xs font-bold">{totalPer}</p>
                        </div>
                    </div>

                    {/* Equipment Slots */}
                    <div className="grid grid-cols-5 gap-2">
                        <EquipSlot icon={<Sword className="w-3 h-3" />} itemIcon={getItemIcon(profile.equipped_weapon)} label="Arma" />
                        <EquipSlot icon={<Shield className="w-3 h-3" />} itemIcon={getItemIcon(profile.equipped_shield)} label="Escudo" />
                        <EquipSlot icon={<Shirt className="w-3 h-3" />} itemIcon={getItemIcon(profile.equipped_armor)} label="Armadura" />
                        <EquipSlot icon={<Crown className="w-3 h-3" />} itemIcon={getItemIcon(profile.equipped_hat)} label="Elmo" />
                        <EquipSlot icon={<PawPrint className="w-3 h-3" />} itemIcon={getItemIcon(profile.equipped_mount)} label="Montaria" />
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

function EquipSlot({ icon, itemIcon, label }: { icon: React.ReactNode, itemIcon: string | null | undefined, label: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className={cn(
                "w-8 h-8 pixel-border flex items-center justify-center bg-muted/30",
                itemIcon ? "bg-accent/10 border-accent/50" : "opacity-50"
            )}>
                {itemIcon ? <span className="text-lg">{itemIcon}</span> : <span className="text-muted-foreground opacity-50">{icon}</span>}
            </div>
            <span className="text-[7px] text-muted-foreground uppercase">{label}</span>
        </div>
    )
}
