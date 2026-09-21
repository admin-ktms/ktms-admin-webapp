import { supabase } from '../lib/supabase.js';
import { config } from '../config/config.js';
import { clearAdminSession, getAdminSession, setAdminSession } from './session.js';

async function loginService(action, payload) {
  if (!config.adminLoginUrl) throw new Error('VITE_KTMS_ADMIN_LOGIN_URL is not configured.');

  const response = await fetch(config.adminLoginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    const message = body?.error?.message || `Administrator login failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body.data;
}

export const auth = {
  async requestOtp(email) {
    return loginService('request', { email });
  },

  async verifyOtp(email, token) {
    const data = await loginService('verify', { email, token });

    await supabase.auth.setSession({
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
    });

    setAdminSession(data.sessionToken);

    return data.admin;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  getAdminSession,
  setAdminSession,

  async signOut() {
    clearAdminSession();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
