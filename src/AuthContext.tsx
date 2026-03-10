import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

// Types
interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: 'male' | 'female' | 'other' | '';
  grade: string;
  subjects: string[];
  created_at: string;
  onboarding_completed: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement profil:', error);
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) await createUserProfile(data.user.id, email);
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  };

  const createUserProfile = async (userId: string, email: string) => {
    try {
      const newProfile: Partial<UserProfile> = {
        id: userId,
        email,
        display_name: '',
        first_name: '',
        last_name: '',
        age: 0,
        gender: '',
        grade: '',
        subjects: [],
        created_at: new Date().toISOString(),
        onboarding_completed: false
      };

      const { error } = await supabase.from('users').insert([newProfile]);
      if (error) throw error;
      setUserProfile(newProfile as UserProfile);
    } catch (error) {
      console.error('Erreur création profil:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserProfile(null);
    } catch (error: any) {
      console.error('Erreur déconnexion:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('users').update(updates).eq('id', user.id);
      if (error) throw error;
      await loadUserProfile(user.id);
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
