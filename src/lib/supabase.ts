/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe resolution of Supabase environment variables in client environment
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const metaEnv = (import.meta as any).env;
    if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
    if (metaEnv[key]) return metaEnv[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`] || '';
    if (process.env[key]) return process.env[key] || '';
  }
  return '';
};

let currentUrl = getEnvVar('SUPABASE_URL') || '';
let currentAnonKey = getEnvVar('SUPABASE_ANON_KEY') || '';

let clientInstance: SupabaseClient = createClient(
  currentUrl || 'https://placeholder.supabase.co',
  currentAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = () => {
  return Boolean(
    currentUrl && 
    currentAnonKey && 
    currentUrl !== 'https://placeholder.supabase.co' &&
    currentAnonKey !== 'placeholder-anon-key'
  );
};

export const initSupabase = (url: string, anonKey: string): SupabaseClient => {
  if (url && anonKey) {
    currentUrl = url;
    currentAnonKey = anonKey;
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
};

export const getSupabase = (): SupabaseClient => clientInstance;

// Proxy export so existing `supabase.auth...` and `supabase.from...` code works continuously
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const active = clientInstance as any;
    const value = active[prop];
    if (typeof value === 'function') {
      return value.bind(active);
    }
    return value;
  }
});
