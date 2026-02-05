import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// CHAVES FIXAS PARA GARANTIR CONEXÃO NO BUILD (Bypassing .env issues)
const SUPABASE_URL = "https://btqgaoeewllurhhopjwn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0cWdhb2Vld2xsdXJoaG9wanduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Njc2MzgsImV4cCI6MjA4NTU0MzYzOH0.H7dznukUFArIpKYYR1NfO_sNP5DL7hCfbzHwd-35EQE";

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
console.log("Supabase Client Initialized (Hardcoded Config)");