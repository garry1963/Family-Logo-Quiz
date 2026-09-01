import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseEnv() {
  const url = 
    process.env.SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    '';
  
  const anonKey = 
    process.env.SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_KEY || 
    process.env.SUPABASE_API_KEY || 
    '';

  const serviceRoleKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_KEY || 
    anonKey;

  return {
    url,
    anonKey,
    serviceRoleKey,
    isConfigured: Boolean(url && (anonKey || serviceRoleKey))
  };
}

let serverClient: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (!serverClient) {
    const { url, serviceRoleKey, anonKey } = getSupabaseEnv();
    const targetUrl = url || 'https://placeholder.supabase.co';
    const targetKey = serviceRoleKey || anonKey || 'placeholder-key';

    serverClient = createClient(targetUrl, targetKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return serverClient;
}
