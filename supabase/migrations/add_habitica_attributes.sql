-- Adicionar colunas de atributos Habitica na tabela profiles

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS strength INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS intelligence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS constitution INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS perception INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_to_assign INTEGER DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN profiles.strength IS 'Força - Aumenta dano em raids e chance critical';
COMMENT ON COLUMN profiles.intelligence IS 'Inteligência - Aumenta XP ganho e mana máxima';
COMMENT ON COLUMN profiles.constitution IS 'Constituição - Reduz dano recebido e aumenta HP máximo';
COMMENT ON COLUMN profiles.perception IS 'Percepção - Aumenta gold ganho e chance de esquivar de contra-ataques';
COMMENT ON COLUMN profiles.points_to_assign IS 'Pontos de atributo disponíveis para distribuir';
