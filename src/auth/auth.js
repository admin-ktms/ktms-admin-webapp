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

async function validateAdminSession() {
  const adminSession = getAdminSession();
  if (!adminSession) return null;

  const expiresAt = getAdminSessionExpiresAt();
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    clearAdminSession();
    return null;
  }

  if (!config.adminApiUrl) throw new Error('VITE_KTMS_ADMIN_API_URL is not configured.');

  const response = await fetch(config.adminApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-KTMS-Admin-Session': adminSession,
    },
    body: JSON.stringify({ action: 'admin.me' }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    clearAdminSession();
    return null;
  }

  return body.data;
}

export const auth = {
  async requestOtp(email) {
    return loginService('request', { email });
  },

  async verifyOtp(email, token) {
    const data = await loginService('verify', { email, token });
    setAdminSession(data.sessionToken, data.adminSessionExpiresAt);
    return data.admin;
  },

  getAdminSession,
  getAdminSessionExpiresAt,
  setAdminSession,

  async restoreSession() {
    const admin = await validateAdminSession();
    if (!admin) return null;
    return { adminSession: getAdminSession(), admin };
  },

  async signOut() {
    const adminSession = getAdminSession();

    try {
      if (adminSession && config.adminApiUrl) {
        await fetch(config.adminApiUrl, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-KTMS-Admin-Session': adminSession,
          },
          body: JSON.stringify({ action: 'admin.session.logout' }),
        });
      }
    } finally {
      clearAdminSession();
    }
  },
};
