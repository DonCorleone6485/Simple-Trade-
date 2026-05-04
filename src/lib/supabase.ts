import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://obaqhbfaeejepocsdgiv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iYXFoYmZhZWVqZXBvY3NkZ2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjQyMjgsImV4cCI6MjA5MzQ0MDIyOH0.D8GFUOAKOrIkr0vUKCFpTEDNFCNehq0MNskukIWY2Qg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
