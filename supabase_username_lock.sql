-- Migration: Adicionar coluna para rastrear troca única de nickname
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_changed_username boolean DEFAULT false;

-- Comentário para documentação
COMMENT ON COLUMN public.profiles.has_changed_username IS 'Rastreia se o usuário já utilizou sua única troca de nome de usuário permitida.';
