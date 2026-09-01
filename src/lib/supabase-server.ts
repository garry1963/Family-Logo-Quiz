import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverClient: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (!serverClient) {
    const url = 
      process.env.SUPABASE_URL || 
      process.env.VITE_SUPABASE_URL || 
      'https://placeholder.supabase.co';
    
    const key = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.SUPABASE_ANON_KEY || 
      process.env.VITE_SUPABASE_ANON_KEY || 
      'placeholder-key';

    serverClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return serverClient;
}
