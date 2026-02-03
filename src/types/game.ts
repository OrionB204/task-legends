export type ItemType = 'weapon' | 'armor' | 'helmet' | 'accessory' | 'mount' | 'consumable' | 'buff' | 'skin' | 'legs' | 'shield' | 'background';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type PriceType = 'gold' | 'gems';

export interface ItemEffect {
    attribute: string;
    value: number;
}

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: Rarity;
    price: number;
    priceType: PriceType;
    effects: ItemEffect[];
    icon: string;
    buffDuration?: number;
}
