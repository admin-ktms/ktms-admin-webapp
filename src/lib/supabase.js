import { createClient } from '@supabase/supabase-js';
import { config } from '../config/config.js';

export const supabase = createClient(
  config.supabaseUrl,
  config.publishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
