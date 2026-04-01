import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { safeStorage } from '@/utils/safeStorage';

const REMEMBER_ME_KEY = 'procesocat-remember-me';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  banner_color: string;
  banner_image?: string | null;
  language: string;
  plan: string;
  points: number;
  weekly_points: number;
  rank: string;
  pet_name: string | null;
  pet_type: string | null;
  referral_code: string | null;
  created_at: string;
  municipality_id?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  authUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetPassword: (email: string) => Promise<void>;
  setRememberMe: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const loadProfile = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) return data as UserProfile;

      const { data: created } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          points: 0,
          weekly_points: 0,
          rank: 'Observador',
          plan: 'free',
          banner_color: '#2D6A4F',
          language: 'es',
        }, { onConflict: 'id' })
        .select()
        .single();

      return (created as UserProfile) ?? null;
    } catch (err) {
      console.error('Profile load error:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    let alive = true;

    // Hard timeout — never stay loading more than 4 seconds
    const hardTimeout = setTimeout(() => {
      if (alive && mountedRef.current) {
        console.warn('Auth hard timeout reached');
        setLoading(false);
      }
    }, 4000);

    // If user unchecked "remember me", skip session restore
    const rememberMe = safeStorage.getItem(REMEMBER_ME_KEY);

    // Get initial session
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!alive || !mountedRef.current) return;

        if (session?.user && rememberMe !== 'false') {
          setAuthUser(session.user);
          const p = await loadProfile(session.user);
          if (alive && mountedRef.current) setProfile(p);
        } else if (rememberMe === 'false' && session) {
          // User chose not to be remembered — sign out silently
          await supabase.auth.signOut();
          setAuthUser(null);
          setProfile(null);
        }
        if (alive && mountedRef.current) {
          setLoading(false);
          clearTimeout(hardTimeout);
        }
      })
      .catch(() => {
        if (alive && mountedRef.current) {
          setLoading(false);
          clearTimeout(hardTimeout);
        }
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!alive || !mountedRef.current) return;
        if (session?.user) {
          setAuthUser(session.user);
          const p = await loadProfile(session.user);
          if (alive && mountedRef.current) {
            setProfile(p);
            setLoading(false);
          }
        } else {
          setAuthUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      alive = false;
      subscription.unsubscribe();
      clearTimeout(hardTimeout);
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    safeStorage.removeItem(REMEMBER_ME_KEY);
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!authUser) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authUser.id);
    if (error) {
      console.error('Error updating profile:', error);
      return;
    }
    setProfile(prev => prev ? { ...prev, ...updates } : prev);
  }, [authUser]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const setRememberMe = useCallback((value: boolean) => {
    safeStorage.setItem(REMEMBER_ME_KEY, String(value));
  }, []);

  const user = profile;

  return (
    <AuthContext.Provider value={{ user, authUser, profile, loading, signIn, signOut, signUp, updateProfile, resetPassword, setRememberMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
