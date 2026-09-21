import { createClient } from '@supabase/supabase-js';
import { config } from '../config/config.js';

let client = null;

export function getSupabase() {
  if (client) return client;

  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    throw new Error(
      'KTMS Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the webapp deployment environment.'
    );
  }

  client = createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
