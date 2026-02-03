-- =========================================
-- SUPABASE: Novos Slots de Equipamento
-- Execute este SQL no Supabase SQL Editor
-- =========================================

-- Adicionar coluna para equipamento de pernas
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS equipped_legs UUID REFERENCES shop_items(id) ON DELETE SET NULL;

-- Adicionar coluna para acessório equipado
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS equipped_accessory UUID REFERENCES shop_items(id) ON DELETE SET NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_legs ON profiles(equipped_legs);
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_accessory ON profiles(equipped_accessory);

-- Atualizar RLS policies se necessário (opcional - depende da config atual)
-- As políticas existentes de profiles já devem cobrir essas novas colunas

-- =========================================
-- ADICIONAR NOVOS ITENS DE PERNAS À LOJA
-- =========================================

-- Gerar UUIDs consistentes para itens de pernas
-- Usando a mesma lógica de hash do frontend

-- Calças de Tecido
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'a7f9b8c0-0000-0000-0000-000000000000',
    'Calças de Tecido',
    'Calças simples de pano.',
    'legs',
    'common',
    500,
    'gold',
    'agility',
    1,
    '👖'
) ON CONFLICT (id) DO NOTHING;

-- Calças de Couro
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'b8f0c9d1-0000-0000-0000-000000000000',
    'Calças de Couro',
    'Couro resistente para aventuras.',
    'legs',
    'common',
    800,
    'gold',
    'agility',
    1,
    '👖'
) ON CONFLICT (id) DO NOTHING;

-- Grevas de Malha
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'c9f1dae2-0000-0000-0000-000000000000',
    'Grevas de Malha',
    'Proteção leve para as pernas.',
    'legs',
    'uncommon',
    1500,
    'gold',
    'vitality',
    2,
    '🦵'
) ON CONFLICT (id) DO NOTHING;

-- Grevas de Placas
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'daf2ebf3-0000-0000-0000-000000000000',
    'Grevas de Placas',
    'Pesadas mas muito protetoras.',
    'legs',
    'uncommon',
    10,
    'gems',
    'vitality',
    3,
    '🦿'
) ON CONFLICT (id) DO NOTHING;

-- Grevas de Cavaleiro
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'ebf3fc04-0000-0000-0000-000000000000',
    'Grevas de Cavaleiro',
    'Usadas por cavaleiros nobres.',
    'legs',
    'rare',
    2500,
    'gold',
    'vitality',
    3,
    '🛡️'
) ON CONFLICT (id) DO NOTHING;

-- Calças do Assassino
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'fc040d15-0000-0000-0000-000000000000',
    'Calças do Assassino',
    'Silenciosas e flexíveis.',
    'legs',
    'rare',
    12,
    'gems',
    'agility',
    4,
    '🗡️'
) ON CONFLICT (id) DO NOTHING;

-- Grevas Dracônicas (Lendário)
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    '0d151e26-0000-0000-0000-000000000000',
    'Grevas Dracônicas',
    'Escamas de dragão nas pernas.',
    'legs',
    'legendary',
    15,
    'gems',
    'vitality',
    7,
    '🐉'
) ON CONFLICT (id) DO NOTHING;

-- =========================================
-- VERIFICAR ALTERAÇÕES
-- =========================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;
