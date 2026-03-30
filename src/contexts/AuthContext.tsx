import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockUser } from '@/data/mockData';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  banner_color: string;
  language: string;
  plan: string;
  points: number;
  weekly_points: number;
  rank: string;
  pet_name: string;
  pet_type: string;
  referral_code: string;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'mock_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (_email: string, _password: string) => {
    const u = { ...mockUser };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const signUp = useCallback(async (email: string, _password: string, name: string) => {
    const u: UserProfile = {
      ...mockUser,
      id: crypto.randomUUID(),
      name,
      email,
      points: 0,
      weekly_points: 0,
      rank: 'Explorador',
      created_at: new Date().toISOString()
    };
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile: user, loading, signIn, signOut, signUp, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
