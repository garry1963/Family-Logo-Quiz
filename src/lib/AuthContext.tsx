import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, initSupabase, isSupabaseConfigured, getSupabase } from './supabase';

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
  const [configured, setConfigured] = useState(isSupabaseConfigured());

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
    let isMounted = true;

    async function initAuth() {
      try {
        // Fetch server Supabase configuration if client keys are not set statically
        const res = await fetch('/api/config/supabase');
        if (res.ok) {
          const config = await res.json();
          if (config.supabaseUrl && config.supabaseAnonKey) {
            initSupabase(config.supabaseUrl, config.supabaseAnonKey);
            if (isMounted) {
              setConfigured(true);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch Supabase configuration from server:', err);
      }

      const client = getSupabase();

      // Check stored session
      try {
        const { data: { session } } = await client.auth.getSession();
        if (isMounted && session) {
          setSession(session);
          setUser(session.user ?? null);
          setToken(session.access_token ?? null);
          syncWithBackend(session.access_token);
        }
      } catch (err) {
        console.warn('Error reading Supabase session:', err);
      } finally {
        if (isMounted) setLoading(false);
      }

      // Subscribe to auth state changes
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, newSession) => {
        if (!isMounted) return;
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
    }

    const cleanupPromise = initAuth();

    return () => {
      isMounted = false;
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    if (token) return token;
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (session?.access_token) {
        setToken(session.access_token);
        return session.access_token;
      }
    } catch (e) {
      console.warn('getIdToken error:', e);
    }
    return token;
  };

  const signInWithGoogle = async () => {
    const currentUrl = window.location.origin;
    const client = getSupabase();

    // If Supabase is configured client-side, use direct OAuth
    if (isSupabaseConfigured()) {
      try {
        const { error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: currentUrl,
          }
        });
        if (!error) return;
        console.warn('Client OAuth failed, trying server proxy fallback:', error.message);
      } catch (err) {
        console.warn('Client OAuth threw, trying server proxy fallback:', err);
      }
    }

    // Server proxy fallback
    const res = await fetch('/api/auth/oauth-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'google', redirectTo: currentUrl })
    });

    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || 'Failed to initiate Google sign in. Please verify your Supabase credentials.');
    }

    window.location.href = data.url;
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const client = getSupabase();

    // 1. Try client SDK if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data.session) {
          setSession(data.session);
          setUser(data.user);
          setToken(data.session.access_token);
          await syncWithBackend(data.session.access_token);
          return { error: null };
        }
        if (error && !error.message.includes('API key') && !error.message.includes('apikey')) {
          return { error: new Error(error.message) };
        }
      } catch (e: any) {
        console.warn('Client email sign in error, trying server fallback:', e);
      }
    }

    // 2. Server proxy fallback
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: new Error(data.error || 'Sign in failed') };
      }

      if (data.session && data.session.access_token && data.session.refresh_token) {
        try {
          await client.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        } catch (setErr) {
          console.warn('Could not set session on client SDK:', setErr);
        }
      }

      setSession(data.session);
      setUser(data.user);
      setToken(data.token || data.session?.access_token || null);
      if (data.token || data.session?.access_token) {
        await syncWithBackend(data.token || data.session.access_token);
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Network error during sign in') };
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const client = getSupabase();

    // 1. Try client SDK if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
        });
        if (!error && data.session) {
          setSession(data.session);
          setUser(data.user);
          setToken(data.session.access_token);
          await syncWithBackend(data.session.access_token);
          return { error: null };
        }
        if (error && !error.message.includes('API key') && !error.message.includes('apikey')) {
          return { error: new Error(error.message) };
        }
      } catch (e: any) {
        console.warn('Client email signup error, trying server fallback:', e);
      }
    }

    // 2. Server proxy fallback
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: new Error(data.error || 'Sign up failed') };
      }

      if (data.session && data.session.access_token && data.session.refresh_token) {
        try {
          await client.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        } catch (setErr) {
          console.warn('Could not set session on client SDK:', setErr);
        }
      }

      setSession(data.session);
      setUser(data.user);
      setToken(data.token || data.session?.access_token || null);
      if (data.token || data.session?.access_token) {
        await syncWithBackend(data.token || data.session.access_token);
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Network error during sign up') };
    }
  };

  const signOut = async () => {
    try {
      await getSupabase().auth.signOut();
    } catch (error) {
      console.error('Supabase Sign Out error:', error);
    } finally {
      setUser(null);
      setSession(null);
      setToken(null);
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
