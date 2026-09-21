import { getSupabase } from '../lib/supabase.js';
import { config } from '../config/config.js';
import {
  clearAdminSession,
  getAdminSession,
  getAdminSessionExpiresAt,
  setAdminSession,
} from './session.js';

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

    await getSupabase().auth.setSession({
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
    });

    setAdminSession(data.sessionToken, data.adminSessionExpiresAt);

    return data.admin;
  },

  async getSession() {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await getSupabase().auth.getUser();
    if (error) throw error;
    return data.user;
  },

  getAdminSession,
  getAdminSessionExpiresAt,
  setAdminSession,

  async restoreSession() {
    const session = await this.getSession();
    const adminSession = getAdminSession();

    if (!session?.access_token || !adminSession) {
      clearAdminSession();
      return null;
    }

    const expiresAt = getAdminSessionExpiresAt();
    if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
      clearAdminSession();
      await getSupabase().auth.signOut().catch(() => {});
      return null;
    }

    if (!config.adminApiUrl) throw new Error('VITE_KTMS_ADMIN_API_URL is not configured.');

    const response = await fetch(config.adminApiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        'X-KTMS-Admin-Session': adminSession,
      },
      body: JSON.stringify({ action: 'admin.me' }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok || !body?.success) {
      clearAdminSession();
      await getSupabase().auth.signOut().catch(() => {});
      return null;
    }

    return { session, admin: body.data };
  },

  async signOut() {
    const session = await this.getSession().catch(() => null);
    const adminSession = getAdminSession();

    try {
      if (session?.access_token && adminSession && config.adminApiUrl) {
        await fetch(config.adminApiUrl, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            'X-KTMS-Admin-Session': adminSession,
          },
          body: JSON.stringify({ action: 'admin.session.logout' }),
        });
      }
    } finally {
      clearAdminSession();
      const { error } = await getSupabase().auth.signOut();
      if (error) throw error;
    }
  },

  onAuthStateChange(callback) {
    return getSupabase().auth.onAuthStateChange(callback);
  },
};
