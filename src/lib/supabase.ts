/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!url) return '';
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('.supabase.co')) {
      return `${parsed.protocol}//${parsed.hostname}`;
    }
    const cleanPath = parsed.pathname
      .replace(/\/rest\/v1\/?$/, '')
      .replace(/\/auth\/v1\/?$/, '')
      .replace(/\/v1\/?$/, '')
      .replace(/\/+$/, '');
    return `${parsed.origin}${cleanPath}`;
  } catch {
    return url
      .replace(/\/rest\/v1\/?$/, '')
      .replace(/\/auth\/v1\/?$/, '')
      .replace(/\/v1\/?$/, '')
      .replace(/\/+$/, '');
  }
}

export function sanitizeSupabaseKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

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

let currentUrl = sanitizeSupabaseUrl(getEnvVar('SUPABASE_URL'));
let currentAnonKey = sanitizeSupabaseKey(getEnvVar('SUPABASE_ANON_KEY'));

// Singleton SupabaseClient reference
let clientInstance: SupabaseClient | null = null;
let initializedUrl: string | null = null;
let initializedKey: string | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    currentUrl && 
    currentAnonKey && 
    currentUrl !== 'https://placeholder.supabase.co' &&
    currentAnonKey !== 'placeholder-anon-key'
  );
};

export const getSupabase = (url?: string, anonKey?: string): SupabaseClient => {
  const cleanUrl = sanitizeSupabaseUrl(url || currentUrl) || 'https://placeholder.supabase.co';
  const cleanKey = sanitizeSupabaseKey(anonKey || currentAnonKey) || 'placeholder-anon-key';

  // If already instantiated with the exact same URL and key, return existing singleton instance
  if (clientInstance && initializedUrl === cleanUrl && initializedKey === cleanKey) {
    return clientInstance;
  }

  // Update current credentials
  currentUrl = cleanUrl;
  currentAnonKey = cleanKey;
  initializedUrl = cleanUrl;
  initializedKey = cleanKey;

  clientInstance = createClient(cleanUrl, cleanKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return clientInstance;
};

export const initSupabase = (url: string, anonKey: string): SupabaseClient => {
  if (!url || !anonKey) {
    return getSupabase();
  }
  return getSupabase(url, anonKey);
};

// Proxy export so existing `supabase.auth...` and `supabase.from...` code works seamlessly
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const active = getSupabase() as any;
    const value = active[prop];
    if (typeof value === 'function') {
      return value.bind(active);
    }
    return value;
  }
});
