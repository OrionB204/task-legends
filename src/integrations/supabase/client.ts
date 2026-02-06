import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// CHAVES FIXAS - PROJETO "ORIGINAL" (LJQ...)
// Recuperadas do backup .env.local onde as contas antigas estão
const SUPABASE_URL = "https://ljqcnvsethddhaxvytlm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcWNudnNldGhkZGhheHZ5dGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzU1MDUsImV4cCI6MjA4NTgxMTUwNX0.Mjxh-OD-bSUg9nNqD8TW_3C0yQuEogcR2MA-OFlYn3o";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Logging para debug seguro
console.log("Supabase Client: Connected to LJQ... (Original Database)");