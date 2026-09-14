import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://phsubtmwjfkspqpzusxm.supabase.co';
// Supabase Anon Keys always start with 'eyJhbGci...'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoc3VidG13amZrc3BxcHp1c3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNTMwMDB9.placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
