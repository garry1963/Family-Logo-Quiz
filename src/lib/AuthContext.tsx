import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  token: null,
  loading: true,
  isConfigured: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signOut: async () => {},
  getIdToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  const syncWithBackend = async (accessToken: string) => {
    try {
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
    } catch (e) {
      console.error('Failed to sync user with server:', e);
    }
  };

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setToken(session?.access_token ?? null);
      if (session?.access_token) {
        syncWithBackend(session.access_token);
      }
      setLoading(false);
    }).catch(err => {
      console.warn('Error fetching Supabase session:', err);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      const accessToken = newSession?.access_token ?? null;
      setToken(accessToken);
      if (accessToken) {
        syncWithBackend(accessToken);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setToken(session.access_token);
      return session.access_token;
    }
    return null;
  };

  const signInWithGoogle = async () => {
    try {
      const currentUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentUrl,
        }
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Supabase Google Sign-In error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };
      if (data.session?.access_token) {
        setSession(data.session);
        setUser(data.user);
        setToken(data.session.access_token);
        await syncWithBackend(data.session.access_token);
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) return { error };
      if (data.session?.access_token) {
        setSession(data.session);
        setUser(data.user);
        setToken(data.session.access_token);
        await syncWithBackend(data.session.access_token);
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setToken(null);
    } catch (error) {
      console.error('Supabase Sign Out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      token,
      loading,
      isConfigured: configured,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      getIdToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
