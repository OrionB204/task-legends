import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Pegando as chaves de forma segura
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// Se as chaves estiverem faltando, usamos valores de teste para não quebrar o site inteiro
const safeUrl = SUPABASE_URL && SUPABASE_URL.startsWith('http') ? SUPABASE_URL : "https://placeholder-project.supabase.co";
const safeKey = SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn("AVISO: Chaves do Supabase estão faltando nas variáveis de ambiente!");
}

export const supabase = createClient<Database>(safeUrl, safeKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});