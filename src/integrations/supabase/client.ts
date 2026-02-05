import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Pegando as chaves de forma segura
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// Diagnóstico de conexão para o "Failed to Fetch" no mobile
if (typeof window !== 'undefined') {
  (window as any).__SUPABASE_DIAGNOSTIC = {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_PUBLISHABLE_KEY,
    urlPrefix: SUPABASE_URL ? SUPABASE_URL.substring(0, 15) : "MISSING",
    mode: import.meta.env.MODE
  };
}

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("ERRO CRÍTICO: Chaves do Supabase não encontradas! O login vai falhar com 'Failed to fetch'.");
  console.log("Verifique se o seu arquivo .env contém VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY");
}

export const supabase = createClient<Database>(
  SUPABASE_URL || "https://placeholder-to-avoid-crash.supabase.co",
  SUPABASE_PUBLISHABLE_KEY || "placeholder-key",
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);