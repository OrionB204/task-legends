/**
 * useEquipmentStats - Hook para sincronização de atributos de equipamento
 * 
 * Este hook calcula automaticamente os bônus de atributos com base nos
 * itens equipados e mantém sincronização em tempo real quando equipamentos
 * mudam.
 */

import { useMemo } from 'react';
import { SHOP_ITEMS } from '@/data/shopItems';
import {
    EquipmentBonuses,
    EMPTY_BONUSES,
    EquippedItemInfo,
    ITEM_TYPE_TO_SLOT,
    EquipmentSlot
} from '@/types/equipment';

interface UseEquipmentStatsParams {
    equippedHat?: string | null;
    equippedArmor?: string | null;
    equippedWeapon?: string | null;
    equippedShield?: string | null;
    equippedSkin?: string | null;
    equippedMount?: string | null;
    equippedAccessory?: string | null;
    equippedLegs?: string | null;
    equippedBackground?: string | null;
    equippedItemsData?: any[];
}

interface UseEquipmentStatsResult {
    bonuses: EquipmentBonuses;
    equippedItems: EquippedItemInfo[];
    getItemBySlot: (slot: EquipmentSlot) => EquippedItemInfo | undefined;
    totalBonusValue: number;
}

// Converte IDs para UUID de forma segura
const toSafeUUID = (id: string): string => {
    if (!id) return '';
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}-0000-0000-0000-000000000000`.substring(0, 36);
};

// Busca item por ID (local ou do banco)
const findItemById = (id: string | null | undefined, dbItems?: any[]) => {
    if (!id) return null;

    const normalizedId = id.toLowerCase();
    const uuid = toSafeUUID(normalizedId).toLowerCase();

    // Busca primeiro nos itens locais
    const localItem = SHOP_ITEMS.find(i =>
        i.id.toLowerCase() === normalizedId ||
        toSafeUUID(i.id).toLowerCase() === normalizedId ||
        toSafeUUID(i.id).toLowerCase() === uuid
    );

    if (localItem) return localItem;

    // Fallback para dados do banco
    if (dbItems) {
        const dbItem = dbItems.find(i =>
            i.id?.toLowerCase() === normalizedId ||
            i.id?.toLowerCase() === uuid
        );
        if (dbItem) {
            return {
                id: dbItem.id,
                name: dbItem.name,
                icon: dbItem.icon || '📦',
                type: dbItem.item_type,
                rarity: dbItem.rarity || 'common',
                effects: dbItem.effect_type && dbItem.effect_value
                    ? [{ attribute: dbItem.effect_type, value: dbItem.effect_value }]
                    : []
            };
        }
    }

    return null;
};

export function useEquipmentStats({
    equippedHat,
    equippedArmor,
    equippedWeapon,
    equippedShield,
    equippedSkin,
    equippedMount,
    equippedAccessory,
    equippedLegs,
    equippedBackground,
    equippedItemsData = []
}: UseEquipmentStatsParams): UseEquipmentStatsResult {

    // Calcula itens equipados com informações completas
    const equippedItems = useMemo<EquippedItemInfo[]>(() => {
        const items: EquippedItemInfo[] = [];

        const equipmentSlots = [
            { id: equippedHat, slotOverride: 'head' as EquipmentSlot },
            { id: equippedArmor, slotOverride: 'chest' as EquipmentSlot },
            { id: equippedWeapon, slotOverride: 'weapon' as EquipmentSlot },
            { id: equippedShield, slotOverride: 'shield' as EquipmentSlot },
            { id: equippedSkin, slotOverride: 'skin' as EquipmentSlot },
            { id: equippedMount, slotOverride: 'mount' as EquipmentSlot },
            { id: equippedAccessory, slotOverride: 'accessory' as EquipmentSlot },
            { id: equippedLegs, slotOverride: 'legs' as EquipmentSlot },
            { id: equippedBackground, slotOverride: 'background' as EquipmentSlot },
        ];

        for (const { id, slotOverride } of equipmentSlots) {
            if (!id) continue;

            const item = findItemById(id, equippedItemsData);
            if (!item) continue;

            const slot = slotOverride || ITEM_TYPE_TO_SLOT[item.type] || 'accessory';

            items.push({
                id: item.id,
                slot,
                name: item.name,
                icon: item.icon || '📦',
                spriteUrl: `/assets/sprites/${slot}/${item.id}.png`,
                rarity: item.rarity || 'common',
                effects: item.effects || [],
            });
        }

        return items;
    }, [
        equippedHat,
        equippedArmor,
        equippedWeapon,
        equippedShield,
        equippedSkin,
        equippedMount,
        equippedAccessory,
        equippedLegs,
        equippedBackground,
        equippedItemsData
    ]);

    // Calcula bônus totais dos equipamentos
    const bonuses = useMemo<EquipmentBonuses>(() => {
        const result = { ...EMPTY_BONUSES };

        for (const item of equippedItems) {
            for (const effect of item.effects) {
                const attr = effect.attribute as keyof EquipmentBonuses;
                if (attr in result) {
                    result[attr] += effect.value;
                }
            }
        }

        return result;
    }, [equippedItems]);

    // Soma total de todos os bônus (para display)
    const totalBonusValue = useMemo(() => {
        return Object.values(bonuses).reduce((sum, val) => sum + val, 0);
    }, [bonuses]);

    // Função para obter item por slot
    const getItemBySlot = (slot: EquipmentSlot): EquippedItemInfo | undefined => {
        return equippedItems.find(item => item.slot === slot);
    };

    return {
        bonuses,
        equippedItems,
        getItemBySlot,
        totalBonusValue,
    };
}
