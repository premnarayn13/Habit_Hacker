import { createClient } from '@supabase/supabase-js';

// Both values must be set as environment variables (Vercel dashboard or local .env file)
// VITE_SUPABASE_URL  — your Supabase project URL
// VITE_SUPABASE_ANON_KEY — your Supabase anon/public key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file (local) or Vercel environment variables (production).'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
