/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = getEnvVar('SUPABASE_URL') || 'https://placeholder.supabase.co';
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY') || 'placeholder-anon-key';

export const isSupabaseConfigured = () => {
  const url = getEnvVar('SUPABASE_URL');
  const key = getEnvVar('SUPABASE_ANON_KEY');
  return Boolean(url && key && url !== 'https://placeholder.supabase.co');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
