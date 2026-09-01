import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { initSupabase, isSupabaseConfigured, getSupabase } from './supabase';

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

async function safeJsonParse(res: Response): Promise<{ ok: boolean; data: any; rawText: string }> {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return { ok: res.ok, data, rawText: text };
  } catch {
    return { ok: res.ok, data: null, rawText: text };
  }
}

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
        const res = await fetch('/api/config/supabase');
        const parsed = await safeJsonParse(res);
        if (parsed.ok && parsed.data?.supabaseUrl && parsed.data?.supabaseAnonKey) {
          initSupabase(parsed.data.supabaseUrl, parsed.data.supabaseAnonKey);
          if (isMounted) {
            setConfigured(true);
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

    // 1. If Supabase is configured client-side, initiate client OAuth
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await client.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: currentUrl,
          }
        });
        if (error) {
          const msg = error.message || '';
          if (msg.includes('not enabled') || msg.includes('validation_failed') || msg.includes('Unsupported provider')) {
            throw new Error('Google Sign-In is not enabled in your Supabase project dashboard yet. Please enable Google in Supabase > Authentication > Providers, or use Email/Password below.');
          }
          throw new Error(msg);
        }
        if (data?.url) {
          window.location.href = data.url;
        }
        return;
      } catch (err: any) {
        const msg = err?.message || '';
        if (msg.includes('not enabled') || msg.includes('validation_failed') || msg.includes('Unsupported provider')) {
          throw err;
        }
        console.warn('Client OAuth error, attempting server fallback:', err);
      }
    }

    // 2. Server proxy fallback
    try {
      const res = await fetch('/api/auth/oauth-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', redirectTo: currentUrl })
      });

      const parsed = await safeJsonParse(res);
      if (!parsed.ok || !parsed.data?.url) {
        const errorText = parsed.data?.error || parsed.rawText || '';
        if (errorText.includes('not enabled') || errorText.includes('validation_failed') || errorText.includes('Unsupported provider')) {
          throw new Error('Google Sign-In is not enabled in your Supabase project dashboard yet. Please enable Google under Authentication > Providers in Supabase, or sign in with Email & Password.');
        }
        if (errorText.toLowerCase().includes('the page cannot be found') || errorText.includes('404')) {
          throw new Error('Supabase OAuth endpoint returned 404. Please ensure Google provider is enabled in your Supabase Dashboard.');
        }
        throw new Error(parsed.data?.error || 'Google Sign-In could not be started. Please check your Supabase dashboard or use Email/Password.');
      }

      window.location.href = parsed.data.url;
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('is not valid JSON') || msg.includes('Unexpected token')) {
        throw new Error('Google Sign-In is not enabled in your Supabase project dashboard yet. Please enable Google in Supabase > Authentication > Providers, or use Email & Password.');
      }
      throw e;
    }
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
      const parsed = await safeJsonParse(res);
      if (!parsed.ok || !parsed.data) {
        return { error: new Error(parsed.data?.error || 'Sign in failed. Please verify your email and password.') };
      }

      const data = parsed.data;
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
      const parsed = await safeJsonParse(res);
      if (!parsed.ok || !parsed.data) {
        return { error: new Error(parsed.data?.error || 'Sign up failed. Please try again.') };
      }

      const data = parsed.data;
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
