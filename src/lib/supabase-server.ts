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

export function getSupabaseEnv() {
  const rawUrl = 
    process.env.SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    '';
  
  const rawAnonKey = 
    process.env.SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_KEY || 
    process.env.SUPABASE_API_KEY || 
    '';

  const rawServiceRoleKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY || 
    '';

  const url = sanitizeSupabaseUrl(rawUrl);
  const anonKey = sanitizeSupabaseKey(rawAnonKey);
  const serviceRoleKey = sanitizeSupabaseKey(rawServiceRoleKey) || anonKey;

  return {
    url,
    anonKey,
    serviceRoleKey,
    isConfigured: Boolean(url && (anonKey || serviceRoleKey))
  };
}

let serverClient: SupabaseClient | null = null;
let currentServerUrl: string | null = null;
let currentServerKey: string | null = null;

export function getSupabaseServer(): SupabaseClient {
  const { url, serviceRoleKey, anonKey } = getSupabaseEnv();
  const targetUrl = url || 'https://placeholder.supabase.co';
  const targetKey = serviceRoleKey || anonKey || 'placeholder-key';

  if (!serverClient || currentServerUrl !== targetUrl || currentServerKey !== targetKey) {
    currentServerUrl = targetUrl;
    currentServerKey = targetKey;
    serverClient = createClient(targetUrl, targetKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return serverClient;
}
