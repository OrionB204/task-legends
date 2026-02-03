import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from './useProfile';
import { toast } from 'sonner';
import { SHOP_ITEMS } from '@/data/shopItems';

export interface InventoryItem {
    id: string;
    user_id: string;
    item_id: string;
    quantity: number;
    item?: {
        name: string;
        description: string;
        item_type: string;
        effect_type?: string;
        effect_value?: number;
        icon?: string;
        rarity?: string;
    };
}

export function useInventory() {
    const { user } = useAuth();
    const { profile, updateProfile, healHp, addMana } = useProfile();
    const queryClient = useQueryClient();

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

    const { data: inventory = [], isLoading } = useQuery({
        queryKey: ['inventory', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('inventory')
                .select(`
                  *,
                  db_item:shop_items(*)
                `)
                .eq('user_id', user.id);

            if (error) {
                console.error('Inventory Fetch Error:', error);
                throw error;
            }

            console.log(`Inventário carregado: ${data?.length || 0} itens para o usuário ${user.id}`);

            // Mapping items with local SHOP_ITEMS as fallback
            const mapped = (data || []).map((inv: any) => {
                const localInfo = SHOP_ITEMS.find(i => toSafeUUID(i.id) === inv.item_id);

                // If we have DB item, use its props. If not, use localInfo.
                const itemData = inv.db_item || (localInfo ? {
                    name: localInfo.name,
                    description: localInfo.description,
                    item_type: localInfo.type,
                    icon: localInfo.icon,
                    rarity: localInfo.rarity,
                    // Map local effects to DB-like fields if needed
                    effect_type: localInfo.effects[0]?.attribute,
                    effect_value: localInfo.effects[0]?.value,
                } : null);

                return {
                    ...inv,
                    item: itemData
                };
            }) as InventoryItem[];

            console.log('Itens mapeados:', mapped.map(i => i.item?.name));
            return mapped;
        },
        enabled: !!user,
    });



    const useItem = useMutation({
        mutationFn: async (inventoryItem: InventoryItem) => {
            if (!user || !profile || !inventoryItem.item) return;

            const item = inventoryItem.item;

            // Consumable logic
            if (item.item_type === 'consumable') {
                if (item.effect_type === 'heal_hp') {
                    await healHp(item.effect_value);
                } else if (item.effect_type === 'restore_mana') {
                    await addMana(item.effect_value);
                }

                // Deduct quantity
                if (inventoryItem.quantity > 1) {
                    await supabase
                        .from('inventory')
                        .update({ quantity: inventoryItem.quantity - 1 })
                        .eq('id', inventoryItem.id);
                } else {
                    await supabase
                        .from('inventory')
                        .delete()
                        .eq('id', inventoryItem.id);
                }

                toast.success(`Usou ${item.name}!`);
            }
            // Equipment logic
            else {
                const id = inventoryItem.item_id;
                // Tentativa robusta de pegar o tipo, verificando várias fontes possíveis
                const type = (item.item_type || (item as any).type || '').toLowerCase();

                console.log('🚀 Tentando equipar:', item.name, '| Tipo detectado:', type, '| ID:', id);
                toast.info(`Equipando ${item.name}...`);

                const updates: any = {};

                if (type === 'helmet' || type === 'hat') updates.equipped_hat = id;
                else if (type === 'armor') updates.equipped_armor = id;
                else if (type === 'weapon') updates.equipped_weapon = id;
                else if (type === 'shield') updates.equipped_shield = id;
                else if (type === 'skin') updates.equipped_skin = id;
                else if (type === 'mount') updates.equipped_mount = id;
                else if (type === 'accessory' || type === 'accessories') updates.equipped_accessory = id;
                else if (type === 'legs') updates.equipped_legs = id;
                else if (type === 'background' || type === 'backgrounds' || type === 'cenário' || type === 'cenario') {
                    updates.equipped_background = id;
                }

                if (Object.keys(updates).length > 0) {
                    try {
                        await updateProfile.mutateAsync(updates);
                        toast.success(`${item.name} equipado com sucesso!`);
                        console.log('✅ Equipado com sucesso:', updates);
                    } catch (err: any) {
                        console.error('❌ Erro detalhado ao equipar:', err);
                        const errorMessage = err?.message || 'Erro desconhecido';
                        toast.error(`Falha no banco de dados: ${errorMessage}`);
                    }
                } else {
                    console.warn('⚠️ Slot não encontrado para o tipo:', type);
                    toast.error(`Não sei como usar este item: ${type}`);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['equipped_items_data', user?.id] });
        },
    });

    const unequipItem = async (type: string) => {
        if (!user) return;
        const updates: any = {};
        if (type === 'hat' || type === 'helmet') updates.equipped_hat = null;
        if (type === 'armor') updates.equipped_armor = null;
        if (type === 'weapon') updates.equipped_weapon = null;
        if (type === 'shield') updates.equipped_shield = null;
        if (type === 'skin') updates.equipped_skin = null;
        if (type === 'mount') updates.equipped_mount = null;
        if (type === 'accessory') updates.equipped_accessory = null;
        if (type === 'legs') updates.equipped_legs = null;
        if (type === 'background') updates.equipped_background = null;

        await updateProfile.mutateAsync(updates);
        toast.success('Item removido');
    };

    return {
        inventory,
        isLoading,
        useItem: useItem.mutate,
        unequipItem,
    };
}
