import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://onkbqxmxrghzypddookg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ua2JxeG14cmdoenlwZGRvb2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MTE2MDgsImV4cCI6MjA5MDQ4NzYwOH0.PgC3SIMjj5FTwzm1ZgrzvCr5N_bErHvqwYjNOB5M0To';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Using fallback values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
