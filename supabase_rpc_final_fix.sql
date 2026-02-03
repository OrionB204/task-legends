-- ==============================================================================
-- CORREÇÃO FINAL: ALINHAMENTO DE NOMES (RPC FIX)
-- ==============================================================================

-- 1. Removemos a função incorreta anterior
DROP FUNCTION IF EXISTS add_diamonds(uuid, integer);

-- 2. Criamos a função COM O NOME EXATO que o código JavaScript envia (user_id)
--    Mas usamos "profiles.user_id" no comando para não confundir o banco.
CREATE OR REPLACE FUNCTION add_diamonds(user_id UUID, amount_to_add INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Agora o parâmetro se chama 'user_id' para bater com o JavaScript
    -- E especificamos 'profiles.user_id' para bater com a tabela
    UPDATE profiles
    SET diamonds = COALESCE(diamonds, 0) + amount_to_add
    WHERE profiles.user_id = add_diamonds.user_id; 
END;
$$;

-- 3. Garantimos permissão
GRANT EXECUTE ON FUNCTION add_diamonds(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION add_diamonds(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION add_diamonds(UUID, INTEGER) TO anon;

-- Pronto! Agora o parâmetro 'user_id' do código encontra o 'user_id' da função.
