-- ==============================================================================
-- SOLUÇÃO DE EMERGÊNCIA: APENAS A FUNÇÃO DE DIAMANTES
-- Vamos focar no essencial para o dinheiro cair. Ignorando histórico por enquanto.
-- ==============================================================================

-- Recria a função de adicionar diamantes de forma forçada e simples
CREATE OR REPLACE FUNCTION add_diamonds(target_user_id UUID, amount_to_add INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Roda como admin para ter permissão de alterar saldo
SET search_path = public
AS $$
BEGIN
    -- Atualiza o saldo do usuário
    UPDATE profiles
    SET diamonds = COALESCE(diamonds, 0) + amount_to_add
    WHERE user_id = target_user_id;
END;
$$;

-- Dá permissão para o sistema usar a função
GRANT EXECUTE ON FUNCTION add_diamonds(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION add_diamonds(UUID, INTEGER) TO authenticated;

-- Se isso rodar com sucesso ("Success"), o pagamento JÁ VAI FUNCIONAR.
-- O histórico de transações é um "plus", mas isso aqui é o motor.
