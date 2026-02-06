-- CRIAÇÃO DE TABELA DE LOGS DE DEBUG
-- Isso vai nos permitir ver EXATAMENTE o que o Webhook está tentando fazer

CREATE TABLE IF NOT EXISTS debug_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_type TEXT,
    message TEXT,
    payload JSONB
);

-- Permissão para gravar
ALTER TABLE debug_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for service role only" ON debug_logs FOR INSERT TO service_role USING (true);
CREATE POLICY "Enable read for authenticated users" ON debug_logs FOR SELECT TO authenticated USING (true);
