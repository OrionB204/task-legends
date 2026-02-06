-- CRIAÇÃO DO BUCKET DE ARMAZENAMENTO (task_evidences)
-- Isso resolve o erro "Bucket not found"

-- 1. Cria o bucket se não existir (e o torna público para visualização)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task_evidences', 'task_evidences', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permissão: Qualquer usuário logado pode ENVIAR (Upload) imagens
CREATE POLICY "Qualquer usuário logado pode enviar evidencias"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'task_evidences');

-- 3. Permissão: Qualquer pessoa pode VER (Download/View) as imagens
CREATE POLICY "Público pode ver evidencias"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'task_evidences');

-- 4. Opcional: Usuário pode deletar/atualizar a PRÓPRIA imagem (se quiser)
CREATE POLICY "Usuário dono pode gerenciar sua imagem"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'task_evidences' AND auth.uid() = owner);
