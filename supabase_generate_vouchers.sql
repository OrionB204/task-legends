-- ==============================================================================
-- 1. SETUP DA TABELA DE CÓDIGOS (Modelo Voucher Único - Igual à imagem)
-- ==============================================================================

-- Remover tabela antiga se existir para garantir estrutura correta
DROP TABLE IF EXISTS redemption_codes CASCADE; 
DROP TABLE IF EXISTS redemption_history CASCADE;
-- Nota: Se você já tem a tabela 'diamond_codes' com dados importantes, comente a linha abaixo.
-- Mas para alinhar com o código, vamos garantir a estrutura:
CREATE TABLE IF NOT EXISTS diamond_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    diamond_amount INTEGER NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE diamond_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ninguém vê códigos" ON diamond_codes FOR SELECT USING (false); -- Apenas a função acessa

-- ==============================================================================
-- 2. FUNÇÃO DE RESGATE (Atualizada para a nova tabela)
-- ==============================================================================
CREATE OR REPLACE FUNCTION redeem_diamond_code(input_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  target_code RECORD;
BEGIN
  -- Buscar o código
  SELECT * INTO target_code 
  FROM diamond_codes 
  WHERE code = input_code;

  -- Validações
  IF target_code IS NULL THEN
     RETURN jsonb_build_object('success', false, 'message', 'Código inválido.');
  END IF;

  IF target_code.is_used THEN
     RETURN jsonb_build_object('success', false, 'message', 'Este código já foi utilizado por alguém.');
  END IF;

  -- 1. Marcar como usado
  UPDATE diamond_codes 
  SET is_used = TRUE, 
      used_by = auth.uid() 
  WHERE id = target_code.id;

  -- 2. Entregar Diamantes
  UPDATE profiles 
  SET diamonds = diamonds + target_code.diamond_amount 
  WHERE user_id = auth.uid();

  RETURN jsonb_build_object(
      'success', true, 
      'message', 'Sucesso! +' || target_code.diamond_amount || ' Diamantes adicionados!'
  );
END;
$$;

-- ==============================================================================
-- 3. GERADOR DE CÓDIGOS EM MASSA (Formato TK05-XXXX)
-- ==============================================================================
DO $$
DECLARE
  i INTEGER;
  new_code TEXT;
  -- Caracteres permitidos (sem I, O, 0, 1 para fácil leitura)
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
BEGIN
  -- Gerar 50 códigos de 5 Diamantes
  FOR i IN 1..50 LOOP
    new_code := 'TK05-' || 
                substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
                substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
                substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
                substr(chars, floor(random() * length(chars) + 1)::int, 1);
                
    INSERT INTO diamond_codes (code, diamond_amount)
    VALUES (new_code, 5)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
    -- Gerar 20 códigos de 10 Diamantes (TK10-XXXX)
  FOR i IN 1..20 LOOP
    new_code := 'TK10-' || 
                substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
                substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
                substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
                substr(chars, floor(random() * length(chars) + 1)::int, 1);
                
    INSERT INTO diamond_codes (code, diamond_amount)
    VALUES (new_code, 10)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
