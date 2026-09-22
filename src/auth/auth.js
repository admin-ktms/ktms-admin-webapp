import { config } from '../config/config.js';
import { adminApi } from '../api/adminApi.js';
import { supabase } from '../lib/supabase.js';
import {
  getAdminSessionData,
  setAdminSession,
  setAdminContext,
  clearAdminSession
} from './session.js';

let currentAdmin = getAdminSessionData()?.admin || null;

async function loginRequest(action, payload) {
  const response = await fetch(config.loginUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      apikey: config.publishableKey
    },
    body: JSON.stringify({ action, ...payload })
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    const error = new Error(
      body?.error?.message || 'KTMS administrator login failed (' + response.status + ').'
    );
    error.status = response.status;
    error.code = body?.error?.code || null;
    throw error;
  }

  return body?.data;
}

export async function requestOtp(email) {
  return loginRequest('request', { email: String(email || '').trim() });
}

export async function verifyOtp(email, token) {
  const data = await loginRequest('verify', {
    email: String(email || '').trim(),
    token: String(token || '').trim()
  });

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.accessToken,
    refresh_token: data.refreshToken
  });

  if (sessionError) {
    throw Object.assign(
      new Error('Supabase authentication session could not be established: ' + sessionError.message),
      { code: 'SUPABASE_SESSION_ESTABLISH_FAILED', status: 502 }
    );
  }

  setAdminSession(data.sessionToken, data.admin, data.adminSessionExpiresAt);
  currentAdmin = data.admin || null;
  return data;
}

export async function restoreSession() {
  const ktmsSession = getAdminSessionData()?.sessionToken;
  if (!ktmsSession) return null;

  const { data: authData, error: authError } = await supabase.auth.getSession();
  if (authError || !authData?.session?.access_token) {
    await supabase.auth.signOut().catch(() => {});
    clearAdminSession();
    currentAdmin = null;
    return null;
  }

  try {
    const admin = await adminApi.send('admin.me');
    currentAdmin = admin || null;
    setAdminContext(currentAdmin);
    return currentAdmin;
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      await supabase.auth.signOut().catch(() => {});
      clearAdminSession();
      currentAdmin = null;
    }
    throw error;
  }
}

export async function signOut() {
  try {
    if (getAdminSessionData()?.sessionToken) {
      await adminApi.send('admin.session.logout');
    }
  } finally {
    await supabase.auth.signOut().catch(() => {});
    clearAdminSession();
    currentAdmin = null;
  }
}

export function getCurrentAdmin() {
  return currentAdmin;
}
