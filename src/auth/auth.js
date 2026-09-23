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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response;

  try {
    response = await fetch(config.adminLoginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ action, ...payload }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Administrator verification service timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    const error = new Error(
      body?.error?.message || `Administrator login failed (${response.status}).`,
    );
    error.status = response.status;
    error.code = body?.error?.code;
    error.body = body;
    throw error;
  }

  return body.data;
}

export const auth = Object.freeze({
  async requestOtp(email) {
    return loginService('request', { email });
  },

  async verifyOtp(email, token) {
    const data = await loginService('verify', { email, token });

    setAdminSession({
      sessionToken: data.sessionToken,
      adminSessionExpiresAt: data.adminSessionExpiresAt,
    });

    currentAdmin = data.admin;
    return data.admin;
  },

  getAdminSession,
  getAdminSessionExpiresAt,

  getAdmin() {
    return currentAdmin;
  },

  async restoreSession() {
    const session = getAdminSession();
    if (!session) {
      currentAdmin = null;
      return null;
    }

    try {
      const admin = await adminApi.me();
      currentAdmin = admin;
      return admin;
    } catch (error) {
      if (
        error?.status === 401 ||
        error?.code === 'ADMIN_SESSION_EXPIRED' ||
        error?.code === 'ADMIN_SESSION_REVOKED' ||
        error?.code === 'ADMIN_SESSION_INVALID'
      ) {
        clearAdminSession();
        currentAdmin = null;
        return null;
      }
      throw error;
    }
  },

  async signOut() {
    try {
      if (getAdminSession()) {
        try {
          await adminApi.logout();
        } catch (error) {
          console.warn('KTMS administrator logout request failed:', error);
        }
      }
    } finally {
      currentAdmin = null;
      clearAdminSession();
    }
  },
});
