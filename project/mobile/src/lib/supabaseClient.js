import { createClient } from '@supabase/supabase-js';

// Both values must be set as environment variables (Vercel dashboard or local .env file)
// VITE_SUPABASE_URL  — your Supabase project URL
// VITE_SUPABASE_ANON_KEY — your Supabase anon/public key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://phsubtmwjfkspqpzusxm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'VITE_SUPABASE_ANON_KEY is missing in project/mobile/.env. Please paste your real anon key from Supabase Dashboard -> Project Settings -> API.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

