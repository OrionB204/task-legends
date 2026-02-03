/**
 * Equipment Slot Types - Sistema de Slots de Equipamento
 * Baseado no design do Habitica com camadas de renderização
 */

export type EquipmentSlot =
    | 'body'      // Base do corpo
    | 'hair'      // Cabelo
    | 'legs'      // Equipamento de Perna
    | 'chest'     // Equipamento de Peito (Armor)
    | 'head'      // Equipamento de Cabeça (Helmet/Hat)
    | 'weapon'    // Arma (mão direita)
    | 'shield'    // Escudo (mão esquerda)
    | 'accessory' // Acessório
    | 'mount'     // Montaria
    | 'skin'      // Skin especial
    | 'background'; // Novo: Cenário de fundo

export interface EquipmentLayer {
    slot: EquipmentSlot;
    zIndex: number;
    offsetX: number;
    offsetY: number;
    scale: number;
}

// Configuração de camadas para renderização - ordem do Habitica
export const EQUIPMENT_LAYERS: Record<EquipmentSlot, EquipmentLayer> = {
    background: { slot: 'background', zIndex: 2, offsetX: 0, offsetY: 0, scale: 1.0 },
    mount: { slot: 'mount', zIndex: 3, offsetX: 0, offsetY: 30, scale: 1.2 },
    body: { slot: 'body', zIndex: 10, offsetX: 0, offsetY: 0, scale: 1.0 },
    hair: { slot: 'hair', zIndex: 15, offsetX: 0, offsetY: -10, scale: 0.9 },
    skin: { slot: 'skin', zIndex: 20, offsetX: 0, offsetY: 0, scale: 1.0 },
    legs: { slot: 'legs', zIndex: 25, offsetX: 0, offsetY: 20, scale: 0.8 },
    chest: { slot: 'chest', zIndex: 30, offsetX: 0, offsetY: 5, scale: 0.85 },
    head: { slot: 'head', zIndex: 40, offsetX: 0, offsetY: -15, scale: 0.7 },
    shield: { slot: 'shield', zIndex: 35, offsetX: -25, offsetY: 10, scale: 0.6 },
    weapon: { slot: 'weapon', zIndex: 45, offsetX: 25, offsetY: 10, scale: 0.65 },
    accessory: { slot: 'accessory', zIndex: 50, offsetX: 0, offsetY: 0, scale: 0.5 },
};

// Mapeamento de tipo de item para slot
export const ITEM_TYPE_TO_SLOT: Record<string, EquipmentSlot> = {
    'weapon': 'weapon',
    'armor': 'chest',
    'helmet': 'head',
    'hat': 'head',
    'shield': 'shield',
    'accessory': 'accessory',
    'mount': 'mount',
    'skin': 'skin',
    'legs': 'legs',
    'background': 'background',
};

// Interface para item equipado com dados completos
export interface EquippedItemInfo {
    id: string;
    slot: EquipmentSlot;
    name: string;
    icon: string;
    spriteUrl?: string;
    rarity: string;
    effects: EquipmentEffect[];
}

// Efeito de equipamento
export interface EquipmentEffect {
    attribute: string;
    value: number;
}

// Bônus totais de equipamento
export interface EquipmentBonuses {
    strength: number;
    intelligence: number;
    constitution: number;
    perception: number;
    agility: number;
    vitality: number;
    endurance: number;
    hp: number;
    mana: number;
    damage: number;
    goldBonus: number;
    xpBonus: number;
}

// Estado vazio de bônus
export const EMPTY_BONUSES: EquipmentBonuses = {
    strength: 0,
    intelligence: 0,
    constitution: 0,
    perception: 0,
    agility: 0,
    vitality: 0,
    endurance: 0,
    hp: 0,
    mana: 0,
    damage: 0,
    goldBonus: 0,
    xpBonus: 0,
};
