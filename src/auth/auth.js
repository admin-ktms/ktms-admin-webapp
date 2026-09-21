import { config } from '../config/config.js';
import { adminApi } from '../api/adminApi.js';
import {
  clearAdminSession,
  getAdminSession,
  getAdminSessionExpiresAt,
  setAdminSession,
} from './session.js';

let currentAdmin = null;

async function loginService(action, payload) {
  if (!config.adminLoginUrl) throw new Error('VITE_KTMS_ADMIN_LOGIN_URL is not configured.');

  const response = await fetch(config.adminLoginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apikey: config.supabaseAnonKey,
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    const message = body?.error?.message || `Administrator login failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.code = body?.error?.code;
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
    setAdminSession(data.sessionToken, data.adminSessionExpiresAt);
    currentAdmin = data.admin;
    return data.admin;
  },

  getAdminSession,
  getAdminSessionExpiresAt,
  setAdminSession,

  getAdmin() {
    return currentAdmin;
  },

  async restoreSession() {
    const admin = await adminApi.me();
    currentAdmin = admin;
    return { adminSession: getAdminSession(), admin };
  },

  async signOut() {
    try {
      if (getAdminSession()) {
        await adminApi.request('admin.session.logout');
      }
    } finally {
      currentAdmin = null;
      clearAdminSession();
    }
  },
};
