import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://obaqhbfaeejepocsdgiv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iYXFoYmZhZWVqZXBvY3NkZ2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjQyMjgsImV4cCI6MjA5MzQ0MDIyOH0.D8GFUOAKOrIkr0vUKCFpTEDNFCNehq0MNskukIWY2Qg'
);
