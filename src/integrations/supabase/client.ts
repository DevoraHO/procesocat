import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://onkbqxmxrghzypddookg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ua2JxeG14cmdoenlwZGRvb2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTQxMzIsImV4cCI6MjA5MDQ3MDEzMn0.cz1srijC0M41kCeiUZ0jjfXYMSOgb4IwxaKhmCzMKnQ";

// Safe localStorage wrapper for iOS Safari private browsing
const safeStorage = {
  getItem: (key: string) => { try { return window.localStorage.getItem(key); } catch { return null; } },
  setItem: (key: string, value: string) => { try { window.localStorage.setItem(key, value); } catch {} },
  removeItem: (key: string) => { try { window.localStorage.removeItem(key); } catch {} },
};

export const SUPABASE_URL_EXPORT = SUPABASE_URL;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'procesocat-auth',
    storage: safeStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
