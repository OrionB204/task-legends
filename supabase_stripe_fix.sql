-- ==============================================================================
-- CORREÇÃO STRIPE & DIAMONDS (Limpeza e Reinstalação)
-- ==============================================================================

-- 1. Tentar limpar objetos antigos para evitar conflitos
DROP FUNCTION IF EXISTS add_diamonds(uuid, integer);
DROP TRIGGER IF EXISTS tr_update_diamond_transaction ON diamond_transactions;
DROP FUNCTION IF EXISTS update_diamond_balance_after();

-- Nota: Não dropamos a tabela para não perder dados, apenas garantimos que existe
CREATE TABLE IF NOT EXISTS diamond_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    balance_after INTEGER DEFAULT 0,
    reference_id TEXT,
    reference_type TEXT,
    metadata JSONB
);

-- 2. Habilitar RLS (Segurança)
ALTER TABLE diamond_transactions ENABLE ROW LEVEL SECURITY;

-- 3. Recriar Política de Segurança
DROP POLICY IF EXISTS "Users can view own transactions" ON diamond_transactions;

CREATE POLICY "Users can view own transactions" ON diamond_transactions
FOR SELECT USING (auth.uid() = user_id);

-- 4. Criar a Função de Adicionar Diamantes (Sem ambiguidade de nomes)
CREATE OR REPLACE FUNCTION add_diamonds(target_user_id UUID, amount_to_add INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE profiles
    SET diamonds = COALESCE(diamonds, 0) + amount_to_add
    WHERE user_id = target_user_id;
END;
$$;

-- 5. Função Trigger para atualizar saldo no histórico
CREATE OR REPLACE FUNCTION update_diamond_balance_after()
RETURNS TRIGGER AS $$
DECLARE
    current_diamonds INTEGER;
BEGIN
    SELECT diamonds INTO current_diamonds 
    FROM profiles 
    WHERE user_id = NEW.user_id;
    
    -- Se não encontrar perfil, assume 0
    NEW.balance_after := COALESCE(current_diamonds, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Ativar o Trigger
CREATE TRIGGER tr_update_diamond_transaction
BEFORE INSERT ON diamond_transactions
FOR EACH ROW
EXECUTE FUNCTION update_diamond_balance_after();

-- 7. Grant Permissões Finais
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON TABLE diamond_transactions TO service_role;
GRANT SELECT ON TABLE diamond_transactions TO authenticated;

-- FIM DA EXECUÇÃO
