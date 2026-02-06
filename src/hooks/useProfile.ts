import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  processLevelUp,
  canLevelUp,
  PlayerClass,
  CLASS_HP_REGEN_BONUS,
  PlayerAttributes
} from '@/lib/gameFormulas';
import { toast } from 'sonner';
import { SHOP_ITEMS } from '@/data/shopItems';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  player_class: PlayerClass;
  level: number;
  current_xp: number;
  max_hp: number;
  current_hp: number;
  max_mana: number;
  current_mana: number;
  gold: number;
  diamonds: number;
  trophies: number;
  is_pro: boolean;
  equipped_hat: string | null;
  equipped_armor: string | null;
  equipped_weapon: string | null;
  equipped_shield: string | null;
  equipped_skin: string | null;
  equipped_mount: string | null;
  equipped_legs: string | null;
  equipped_accessory: string | null;
  equipped_background: string | null;
  strength: number;
  intelligence: number;
  constitution: number;
  perception: number;
  points_to_assign: number;
  has_changed_username: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  const { data: equippedItemsData = [] } = useQuery({
    queryKey: ['equipped_items_data', user?.id],
    queryFn: async () => {
      if (!profile) return [];
      const itemIds = [
        profile?.equipped_weapon,
        profile?.equipped_armor,
        profile?.equipped_shield,
        profile?.equipped_hat,
        profile?.equipped_skin,
        profile?.equipped_mount,
        profile?.equipped_legs,
        profile?.equipped_accessory,
        profile?.equipped_background,
      ].filter(Boolean);

      if (itemIds.length === 0) return [];

      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .in('id', itemIds);

      if (error) throw error;
      return data;
    },
    enabled: !!profile,
  });

  // Calculate Bonus Stats from equipment
  // Helper to safely match IDs (UUID or String)
  const findLocalItem = (id: string | null) => {
    if (!id) return null;
    const normalized = id.toLowerCase();

    // 1. Direct match
    let found = SHOP_ITEMS.find(i => i.id.toLowerCase() === normalized);
    if (found) return found;

    // 2. Hash match (UUID)
    found = SHOP_ITEMS.find(i => {
      let hash = 0;
      for (let j = 0; j < i.id.length; j++) {
        hash = ((hash << 5) - hash) + i.id.charCodeAt(j);
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).padStart(8, '0');
      const uuid = `${hex}-0000-0000-0000-000000000000`.substring(0, 36);
      return uuid === normalized;
    });

    return found;
  };

  // Calculate Bonus Stats from equipment (Local Logic First)
  const bonusStats = useMemo(() => {
    if (!profile) return {
      strength: 0,
      intelligence: 0,
      constitution: 0,
      perception: 0,
      hp: 0,
      mana: 0
    };

    const equippedIds = [
      profile.equipped_weapon,
      profile.equipped_armor,
      profile.equipped_shield,
      profile.equipped_hat,
      profile.equipped_skin,
      profile.equipped_mount,
      profile.equipped_legs,
      profile.equipped_accessory,
      profile.equipped_background
    ];

    return equippedIds.reduce((acc, id) => {
      const item = findLocalItem(id);
      if (item && item.effects) {
        item.effects.forEach(effect => {
          const attr = effect.attribute as keyof typeof acc;
          if (acc[attr] !== undefined) {
            acc[attr] += effect.value;
          }
        });
      }
      return acc;
    }, {
      strength: 0,
      intelligence: 0,
      constitution: 0,
      perception: 0,
      hp: 0,
      mana: 0
    });
  }, [profile]);

  // Calculate derived stats
  const totalStats = {
    strength: (profile?.strength || 0) + bonusStats.strength,
    intelligence: (profile?.intelligence || 0) + bonusStats.intelligence,
    constitution: (profile?.constitution || 0) + bonusStats.constitution,
    perception: (profile?.perception || 0) + bonusStats.perception,
  };

  const maxHp = (profile ? (100 + (profile.level - 1) * 10 + totalStats.constitution * 5) : 100) + bonusStats.hp;
  const maxMana = (profile ? (50 + (profile.level - 1) * 5 + totalStats.intelligence * 5) : 50) + bonusStats.mana;

  const updateProfile = useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const addXp = async (amount: number) => {
    if (!profile) return;

    let newXp = profile.current_xp + amount;
    let newLevel = profile.level;

    if (canLevelUp(newLevel, newXp)) {
      const result = processLevelUp(newLevel, newXp);
      const levelsGained = result.newLevel - profile.level;
      newLevel = result.newLevel;
      newXp = result.remainingXp;

      // Give points
      const newPoints = (profile.points_to_assign || 0) + levelsGained;

      await updateProfile.mutateAsync({
        current_xp: newXp,
        level: newLevel,
        current_hp: maxHp, // Full heal on level up
        current_mana: maxMana, // Full mana on level up
        points_to_assign: newPoints,
      });

      toast.success(`🎉 Level Up! Você alcançou o nível ${newLevel}! +${levelsGained} pontos de atributo!`, {
        duration: 5000,
      });
    } else {
      await updateProfile.mutateAsync({ current_xp: newXp });
    }
  };

  const assignAttributePoint = async (attribute: keyof PlayerAttributes) => {
    if (!profile || (profile.points_to_assign || 0) <= 0) return;

    const updates: Partial<Profile> = {
      [attribute]: (profile[attribute as keyof Profile] as number || 0) + 1,
      points_to_assign: (profile.points_to_assign || 0) - 1,
    };

    await updateProfile.mutateAsync(updates);
    toast.success(`${String(attribute).toUpperCase()} aumentado!`);
  };

  const addGold = async (amount: number) => {
    if (!profile) return;
    await updateProfile.mutateAsync({ gold: profile.gold + amount });
  };

  const addTrophies = async (amount: number) => {
    if (!profile) return;
    await updateProfile.mutateAsync({ trophies: (profile.trophies || 0) + amount });
  };

  const addMana = async (amount: number) => {
    if (!profile) return;
    const newMana = Math.min(profile.current_mana + amount, maxMana);
    await updateProfile.mutateAsync({ current_mana: newMana });
  };

  const takeDamage = async (amount: number) => {
    if (!profile) return;
    const newHp = Math.max(profile.current_hp - amount, 0);
    await updateProfile.mutateAsync({ current_hp: newHp });

    if (newHp === 0) {
      toast.error('💀 Você foi derrotado! Descanse e complete tarefas para recuperar HP.');
    }
  };

  const healHp = async (amount: number, isFromHabit = false) => {
    if (!profile) return;

    let totalHeal = amount;
    if (isFromHabit) {
      totalHeal += CLASS_HP_REGEN_BONUS[profile.player_class];
    }

    const newHp = Math.min(profile.current_hp + totalHeal, maxHp);
    await updateProfile.mutateAsync({ current_hp: newHp });
  };

  const changeClass = async (newClass: PlayerClass) => {
    if (!profile) return;
    await updateProfile.mutateAsync({ player_class: newClass });
    toast.success(`🎭 Você agora é um ${newClass}!`);
  };

  const upgradeToPro = async () => {
    if (!profile) return;
    if (profile.diamonds < 5) {
      toast.error('Você precisa de 5 diamantes para fazer upgrade!');
      return false;
    }
    await updateProfile.mutateAsync({
      diamonds: profile.diamonds - 5,
      is_pro: true,
    });
    toast.success('🌟 Parabéns! Você agora é PRO!');
    return true;
  };

  const revive = async () => {
    if (!profile) return;
    if (profile.diamonds < 1) {
      toast.error('Você precisa de 1 diamante para reviver!');
      return false;
    }

    try {
      await updateProfile.mutateAsync({
        diamonds: profile.diamonds - 1,
        current_hp: Math.floor(maxHp * 0.5)
      });
      toast.success('Você reviveu com 50% de HP! 🧟‍♂️✨');
      return true;
    } catch (error) {
      toast.error('Erro ao reviver. Tente novamente.');
      return false;
    }
  };

  return {
    profile,
    bonusStats,
    totalStats,
    maxHp,
    maxMana,
    isLoading,
    equippedItemsData,
    updateProfile,
    addXp,
    addGold,
    addMana,
    addTrophies,
    takeDamage,
    healHp,
    assignAttributePoint,
    changeClass,
    upgradeToPro,
    revive,
    changeUsername: async (newUsername: string) => {
      if (!profile) return false;
      if (profile.has_changed_username) {
        toast.error('Você já alterou seu nome de herói uma vez!');
        return false;
      }
      if (newUsername.length < 3) {
        toast.error('O nome deve ter pelo menos 3 caracteres');
        return false;
      }

      try {
        await updateProfile.mutateAsync({
          username: newUsername,
          has_changed_username: true
        });
        toast.success('Nome de herói atualizado com sucesso! 🎭');
        return true;
      } catch (error: any) {
        if (error.code === '23505') {
          toast.error('Este nome de usuário já está sendo usado por outro herói!');
        } else {
          toast.error('Erro ao atualizar nome: ' + error.message);
        }
        return false;
      }
    },
    redeemCode: async (code: string) => {
      // @ts-ignore
      const { data, error } = await supabase.rpc('redeem_diamond_code', { input_code: code });

      if (error) {
        toast.error('Erro ao resgatar código: ' + error.message);
        return false;
      }

      const result = data as { success: boolean; message: string };

      if (!result.success) {
        toast.error(result.message);
        return false;
      }

      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      return true;
    }
  };
}
