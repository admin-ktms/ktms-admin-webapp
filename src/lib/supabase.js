import { createClient } from '@supabase/supabase-js';
import { config } from '../config/config.js';
import {
  clearAdminSession,
  getLegacySupabaseCredentials,
  clearLegacySupabaseCredentials,
} from '../auth/session.js';

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'ktms_admin_supabase_auth',
  },
});

let authStateListenerInstalled = false;

export function installAuthStateListener() {
  if (authStateListenerInstalled) return;
  authStateListenerInstalled = true;

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') clearAdminSession();
  });
}

export async function bootstrapSupabaseSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    const authError = new Error('Supabase administrator session could not be loaded.');
    authError.code = 'SUPABASE_SESSION_LOAD_ERROR';
    authError.cause = error;
    throw authError;
  }

  if (data.session) return data.session;

  const legacy = getLegacySupabaseCredentials();
  if (!legacy?.accessToken || !legacy?.refreshToken) return null;

  const { data: restored, error: restoreError } = await supabase.auth.setSession({
    access_token: legacy.accessToken,
    refresh_token: legacy.refreshToken,
  });

  if (restoreError || !restored.session) {
    clearAdminSession();
    const authError = new Error('Administrator authentication could not be restored.');
    authError.code = 'SUPABASE_SESSION_RESTORE_ERROR';
    authError.cause = restoreError || null;
    throw authError;
  }

  clearLegacySupabaseCredentials();
  return restored.session;
}

export async function getCurrentSupabaseSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    const authError = new Error('Supabase administrator session could not be loaded.');
    authError.code = 'SUPABASE_SESSION_LOAD_ERROR';
    authError.cause = error;
    throw authError;
  }

  return data.session;
}

export async function getCurrentSupabaseAccessToken() {
  const session = await getCurrentSupabaseSession();

  if (!session?.access_token) {
    const authError = new Error('Supabase administrator authentication is required.');
    authError.code = 'SUPABASE_AUTH_REQUIRED';
    authError.status = 401;
    throw authError;
  }

  return session.access_token;
}

export async function setSupabaseSession(accessToken, refreshToken) {
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    const authError = new Error('Supabase administrator authentication could not be established.');
    authError.code = 'SUPABASE_SESSION_SET_ERROR';
    authError.cause = error || null;
    throw authError;
  }

  return data.session;
}

export async function signOutSupabase() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error) {
    const authError = new Error('Supabase administrator sign out failed.');
    authError.code = 'SUPABASE_SIGNOUT_ERROR';
    authError.cause = error;
    throw authError;
  }
}