-- Corrige a tabela inventory adicionando a coluna quantity se faltar
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.shop_items(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verifica e adiciona a coluna quantity se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory' AND column_name = 'quantity') THEN
        ALTER TABLE public.inventory ADD COLUMN quantity INTEGER DEFAULT 1;
    END IF;
END $$;

-- Garante permissões RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory" ON public.inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own inventory" ON public.inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON public.inventory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own inventory" ON public.inventory
    FOR DELETE USING (auth.uid() = user_id);
