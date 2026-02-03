-- =========================================
-- SUPABASE: Novo Sistema de Cenários (Backgrounds)
-- =========================================

-- Adicionar coluna para cenário equipado
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS equipped_background UUID REFERENCES shop_items(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_background ON profiles(equipped_background);

-- =========================================
-- SEED: CENÁRIOS (BACKGROUNDS)
-- =========================================

-- FLORESTA VERDEJANTE (Básico - Ouro)
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'b1a1c2d3-0000-0000-0000-000000000000',
    'Floresta Verdejante',
    'Um fundo relaxante de mata densa.',
    'background',
    'common',
    1000,
    'gold',
    'vitality',
    0,
    '🌳'
) ON CONFLICT (id) DO NOTHING;

-- VALE DOS VENTOS (Básico - Ouro)
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'b2a2c3d4-0000-0000-0000-000000000000',
    'Vale dos Ventos',
    'Planícies abertas com brisas constantes.',
    'background',
    'common',
    1500,
    'gold',
    'agility',
    0,
    '🍃'
) ON CONFLICT (id) DO NOTHING;

-- MONTANHAS ROCHOSAS (Básico - Ouro)
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'b3a3c4d5-0000-0000-0000-000000000000',
    'Montanhas Rochosas',
    'Picos gelados e terrenos difíceis.',
    'background',
    'common',
    2000,
    'gold',
    'endurance',
    0,
    '🏔️'
) ON CONFLICT (id) DO NOTHING;

-- CASTELO FLUTUANTE DE CRISTAL (Lendário - Diamantes)
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'l1a1c2d3-0000-0000-0000-000000000000',
    'Castelo Flutuante de Cristal',
    'A morada dos deuses antigos.',
    'background',
    'legendary',
    15,
    'gems',
    'intelligence',
    0,
    '🏰'
) ON CONFLICT (id) DO NOTHING;

-- VULCÃO DE DRACONIS (Lendário - Diamantes)
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'l2a2c3d4-0000-0000-0000-000000000000',
    'Vulcão de Draconis',
    'Onde os dragões de fogo nascem.',
    'background',
    'legendary',
    18,
    'gems',
    'strength',
    0,
    '🌋'
) ON CONFLICT (id) DO NOTHING;

-- ABISMO ESTELAR (Lendário - Diamantes)
INSERT INTO shop_items (id, name, description, item_type, rarity, price, currency_type, effect_type, effect_value, icon) 
VALUES (
    'l3a3c4d5-0000-0000-0000-000000000000',
    'Abismo Estelar',
    'O vazio infinito cravejado de estrelas.',
    'background',
    'legendary',
    20,
    'gems',
    'damage',
    0,
    '🌌'
) ON CONFLICT (id) DO NOTHING;
