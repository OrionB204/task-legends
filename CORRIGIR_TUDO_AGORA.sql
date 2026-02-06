-- 1. CORRIGIR TABELA DE INVENTÁRIO
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.shop_items(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona a coluna quantity se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'quantity') THEN
        ALTER TABLE public.inventory ADD COLUMN quantity INTEGER DEFAULT 1;
    END IF;
END $$;

-- Permissões de segurança para o inventário
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own inventory" ON public.inventory FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert into own inventory" ON public.inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own inventory" ON public.inventory FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete from own inventory" ON public.inventory FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- 2. CADASTRAR ITENS NA LOJA (Para corrigir erro de chaves/registro)
INSERT INTO public.shop_items (id, name, description, item_type, rarity, price_gold, price_diamonds, effect_type, effect_value, image_url)
VALUES
('10b33783-0000-0000-0000-000000000000', 'Espada de Madeira', 'Uma espada de treino para iniciantes.', 'weapon', 'common', 1000, 0, 'strength', 1, '🗡️'),
('10b98968-0000-0000-0000-000000000000', 'Espada de Ferro', 'Uma espada básica mas confiável.', 'weapon', 'common', 1200, 0, 'strength', 2, '⚔️'),
('2b91536a-0000-0000-0000-000000000000', 'Espada de Bronze', 'Forjada com bronze resistente.', 'weapon', 'common', 1400, 0, 'strength', 2, '⚔️'),
('05e9f605-0000-0000-0000-000000000000', 'Espada de Aço', 'Aço temperado de qualidade.', 'weapon', 'uncommon', 1800, 0, 'strength', 3, '⚔️'),
('3ab1bc5d-0000-0000-0000-000000000000', 'Espada de Cavaleiro', 'Usada pelos cavaleiros reais.', 'weapon', 'uncommon', 2200, 0, 'strength', 3, '⚔️'),
('4813a0dd-0000-0000-0000-000000000000', 'Espada de Prata', 'Eficaz contra criaturas das trevas.', 'weapon', 'uncommon', 2500, 0, 'strength', 4, '⚔️'),
('05fa08c9-0000-0000-0000-000000000000', 'Espada Real', 'Pertencia à família real.', 'weapon', 'rare', 3500, 0, 'strength', 5, '⚔️'),
('63a2e545-0000-0000-0000-000000000000', 'Espada Glacial', 'Congela o ar ao redor.', 'weapon', 'rare', 3800, 0, 'strength', 4, '❄️'),
('10ba095c-0000-0000-0000-000000000000', 'Espada Sagrada', 'Abençoada pelos deuses.', 'weapon', 'epic', 4500, 0, 'strength', 5, '✨'),
('0798707e-0000-0000-0000-000000000000', 'Cajado do Aprendiz', 'Canaliza energia mágica básica.', 'weapon', 'common', 1000, 0, 'intelligence', 2, '🪄'),
('0a70b6b7-0000-0000-0000-000000000000', 'Cajado de Cristal', 'Amplifica poderes mágicos.', 'weapon', 'uncommon', 1800, 0, 'intelligence', 3, '💎'),
('6bc45e1e-0000-0000-0000-000000000000', 'Cajado de Gelo', 'Congela os inimigos.', 'weapon', 'uncommon', 2200, 0, 'intelligence', 4, '❄️'),
('678de2f7-0000-0000-0000-000000000000', 'Cajado do Trovão', 'Invoca tempestades.', 'weapon', 'rare', 3000, 0, 'intelligence', 4, '⚡'),
('73934c64-0000-0000-0000-000000000000', 'Cajado Necromante', 'Controla os mortos.', 'weapon', 'rare', 3800, 0, 'intelligence', 5, '💀'),
('0cc71fa1-0000-0000-0000-000000000000', 'Cajado Sagrado', 'Abençoado pelos deuses.', 'weapon', 'epic', 4500, 0, 'intelligence', 6, '✨'),
('48d5e947-0000-0000-0000-000000000000', 'Arco Curto', 'Rápido mas de curto alcance.', 'weapon', 'common', 1000, 0, 'agility', 2, '🏹'),
('7e3b8761-0000-0000-0000-000000000000', 'Arco Longo', 'Grande alcance e poder.', 'weapon', 'uncommon', 1900, 0, 'agility', 3, '🏹'),
('4999482b-0000-0000-0000-000000000000', 'Arco Élfico', 'Artesanato élfico perfeito.', 'weapon', 'uncommon', 2700, 0, 'agility', 4, '🧝'),
('2e122e83-0000-0000-0000-000000000000', 'Arco das Sombras', 'Dispara flechas silenciosas.', 'weapon', 'rare', 3500, 0, 'agility', 5, '🌑'),
('08dec228-0000-0000-0000-000000000000', 'Arco do Assassino', 'Perfeito para ataques furtivos.', 'weapon', 'epic', 4600, 0, 'agility', 7, '🗡️'),
('5e7cc4c1-0000-0000-0000-000000000000', 'Maça de Ferro', 'Pesada e devastadora.', 'weapon', 'common', 1100, 0, 'strength', 2, '🔨'),
('5e7d44b5-0000-0000-0000-000000000000', 'Maça Sagrada', 'Abençoada pelos deuses.', 'weapon', 'uncommon', 2400, 0, 'strength', 3, '✨'),
('2839f4dd-0000-0000-0000-000000000000', 'Martelo do Trovão', 'Causa tremores ao impactar.', 'weapon', 'rare', 3200, 0, 'strength', 5, '⚡'),
('209e789f-0000-0000-0000-000000000000', 'Martelo de Guerra', 'Destruição garantida.', 'weapon', 'epic', 4200, 0, 'strength', 6, '🔨'),
('410bc9d9-0000-0000-0000-000000000000', 'Túnica de Pano', 'Uma simples túnica de pano para iniciantes.', 'armor', 'common', 500, 0, 'vitality', 1, '👗'),
('4018280c-0000-0000-0000-000000000000', 'Vestes de Tecido', 'Proteção mínima mas confortável.', 'armor', 'common', 1000, 0, 'vitality', 1, '👕'),
('08f9ed3b-0000-0000-0000-000000000000', 'Couro Reforçado', 'Couro com tachas de metal.', 'armor', 'common', 1500, 0, 'vitality', 2, '🥋'),
('40f5533c-0000-0000-0000-000000000000', 'Armadura de Escamas', 'Escamas metálicas sobrepostas.', 'armor', 'uncommon', 2300, 0, 'vitality', 3, '🐍'),
('40cf2508-0000-0000-0000-000000000000', 'Armadura de Placas', 'Proteção pesada para guerreiros.', 'armor', 'uncommon', 2900, 0, 'vitality', 4, '⚔️'),
('79c94ac0-0000-0000-0000-000000000000', 'Manto do Mago', 'Tecido encantado.', 'armor', 'rare', 3000, 0, 'vitality', 3, '🧙'),
('37671d15-0000-0000-0000-000000000000', 'Armadura de Paladino', 'Proteção sagrada.', 'armor', 'rare', 3500, 0, 'vitality', 5, '✨'),
('4bf0a2e7-0000-0000-0000-000000000000', 'Armadura Elemental', 'Protege contra elementos.', 'armor', 'epic', 4400, 0, 'vitality', 6, '🔮'),
('41066afe-0000-0000-0000-000000000000', 'Armadura do Titã', 'Resistência titânica.', 'armor', 'epic', 5000, 0, 'vitality', 7, '🗿'),
('6f712272-0000-0000-0000-000000000000', 'Calças de Tecido', 'Calças simples de pano.', 'legs', 'common', 500, 0, 'agility', 1, '👖'),
('27133a81-0000-0000-0000-000000000000', 'Calças de Couro', 'Couro resistente para aventuras.', 'legs', 'common', 800, 0, 'agility', 1, '👖'),
('6f6f1b19-0000-0000-0000-000000000000', 'Grevas de Malha', 'Proteção leve para as pernas.', 'legs', 'uncommon', 1500, 0, 'vitality', 2, '🦵'),
('738ccacb-0000-0000-0000-000000000000', 'Grevas de Cavaleiro', 'Usadas por cavaleiros nobres.', 'legs', 'rare', 2500, 0, 'vitality', 3, '🛡️'),
('67be29e6-0000-0000-0000-000000000000', 'Calças do Mago', 'Tecido encantado com runas.', 'legs', 'rare', 2800, 0, 'intelligence', 3, '✨'),
('663e4038-0000-0000-0000-000000000000', 'Calças das Sombras', 'Quase invisíveis na escuridão.', 'legs', 'epic', 4000, 0, 'agility', 5, '🌑'),
('551e30ba-0000-0000-0000-000000000000', 'Capuz de Tecido', 'Proteção mínima.', 'helmet', 'common', 1000, 0, 'vitality', 1, '🧢'),
('4d144e28-0000-0000-0000-000000000000', 'Elmo de Ferro', 'Proteção básica para a cabeça.', 'helmet', 'common', 1400, 0, 'vitality', 2, '⛑️'),
('5c67efed-0000-0000-0000-000000000000', 'Elmo de Cavaleiro', 'Usado por cavaleiros nobres.', 'helmet', 'uncommon', 2200, 0, 'vitality', 3, '🪖'),
('70a346cb-0000-0000-0000-000000000000', 'Chapéu de Mago', 'Amplifica poderes mágicos.', 'helmet', 'uncommon', 2300, 0, 'intelligence', 3, '🧙'),
('55f311a7-0000-0000-0000-000000000000', 'Coroa Real', 'Símbolo de poder.', 'helmet', 'rare', 3400, 0, 'vitality', 3, '👑'),
('230db243-0000-0000-0000-000000000000', 'Elmo de Paladino', 'Proteção sagrada.', 'helmet', 'rare', 3600, 0, 'vitality', 4, '✨'),
('560c73ac-0000-0000-0000-000000000000', 'Elmo do Titã', 'Tamanho e proteção titânica.', 'helmet', 'epic', 4500, 0, 'vitality', 5, '🗿'),
('034f44aa-0000-0000-0000-000000000000', 'Anel de Cobre', 'Um simples anel de cobre.', 'accessory', 'common', 1000, 0, 'endurance', 1, '💍'),
('17a7fd4a-0000-0000-0000-000000000000', 'Anel de Prata', 'Prata polida.', 'accessory', 'uncommon', 1600, 0, 'intelligence', 2, '💍'),
('218f0da8-0000-0000-0000-000000000000', 'Anel de Agilidade', 'Movimentos mais rápidos.', 'accessory', 'uncommon', 1800, 0, 'agility', 3, '🌀'),
('0f3015dd-0000-0000-0000-000000000000', 'Anel de Ouro', 'Ouro maciço.', 'accessory', 'rare', 2500, 0, 'vitality', 2, '💍'),
('2cec17bf-0000-0000-0000-000000000000', 'Anel de Safira', 'Pedra do oceano.', 'accessory', 'rare', 3000, 0, 'intelligence', 4, '💙'),
('54540018-0000-0000-0000-000000000000', 'Amuleto de Madeira', 'Talismã simples.', 'accessory', 'common', 1000, 0, 'endurance', 1, '📿'),
('6982a988-0000-0000-0000-000000000000', 'Amuleto de Prata', 'Prata protetora.', 'accessory', 'uncommon', 1700, 0, 'vitality', 2, '📿'),
('5458c07e-0000-0000-0000-000000000000', 'Amuleto de Mana', 'Aumenta reservas de mana.', 'accessory', 'uncommon', 2000, 0, 'intelligence', 3, '💧'),
('72e885d9-0000-0000-0000-000000000000', 'Amuleto do Guerreiro', 'Força em combate.', 'accessory', 'rare', 2800, 0, 'strength', 4, '⚔️'),
('576755fb-0000-0000-0000-000000000000', 'Amuleto do Caçador', 'Instinto predador.', 'accessory', 'rare', 2800, 0, 'agility', 4, '🏹'),
('54547531-0000-0000-0000-000000000000', 'Amuleto do Vazio', 'Energia do vazio.', 'accessory', 'epic', 4500, 0, 'intelligence', 5, '🌑'),
('403a7e70-0000-0000-0000-000000000000', 'Burro', 'Lento mas persistente.', 'mount', 'common', 1500, 0, 'endurance', 2, '🫏'),
('024ad529-0000-0000-0000-000000000000', 'Cavalo', 'Companheiro fiel.', 'mount', 'uncommon', 2200, 0, 'agility', 3, '🐴'),
('4a6c5386-0000-0000-0000-000000000000', 'Lobo Selvagem', 'Rápido e feroz.', 'mount', 'rare', 3200, 0, 'agility', 4, '🐺'),
('4355e104-0000-0000-0000-000000000000', 'Poção de Vida Pequena', 'Recupera 30 HP.', 'consumable', 'common', 500, 0, 'hp', 30, '🧪'),
('3212bbe0-0000-0000-0000-000000000000', 'Poção de Vida Média', 'Recupera 60 HP.', 'consumable', 'uncommon', 900, 0, 'hp', 60, '🧪'),
('7430e985-0000-0000-0000-000000000000', 'Poção de Mana Pequena', 'Recupera 30 Mana.', 'consumable', 'common', 500, 0, 'mana', 30, '💧'),
('1c98c37f-0000-0000-0000-000000000000', 'Poção de Mana Média', 'Recupera 50 Mana.', 'consumable', 'uncommon', 800, 0, 'mana', 50, '💧'),
('4ba481d4-0000-0000-0000-000000000000', 'Pergaminho de XP', '+5% XP por 1 dia.', 'buff', 'common', 800, 0, 'xpBonus', 5, '📜'),
('49041b14-0000-0000-0000-000000000000', 'Moeda da Sorte', '+5% Ouro por 1 dia.', 'buff', 'common', 800, 0, 'goldBonus', 5, '🪙')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    item_type = EXCLUDED.item_type,
    rarity = EXCLUDED.rarity,
    price_gold = EXCLUDED.price_gold,
    price_diamonds = EXCLUDED.price_diamonds,
    effect_type = EXCLUDED.effect_type,
    effect_value = EXCLUDED.effect_value,
    image_url = EXCLUDED.image_url;

-- 3. ADICIONAR OURO E DIAMANTES
UPDATE public.profiles
SET 
    gold = gold + 5000, 
    diamonds = diamonds + 20
FROM auth.users
WHERE profiles.user_id = auth.users.id
AND auth.users.email = 'davidmonteiro0122@gmail.com';
