import { createClient } from '@supabase/supabase-js';

// Pulling keys securely from your frontend .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUBSPACE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);