import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as UserProfile;
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            const p = await fetchProfile(session.user.id);
            setProfile(p);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
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

  const user = profile; // backward compat

  return (
    <AuthContext.Provider value={{ user, authUser, profile, loading, signIn, signOut, signUp, updateProfile, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
