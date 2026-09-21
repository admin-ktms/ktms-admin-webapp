import { config } from '../config/config.js';
import { adminApi } from '../api/adminApi.js';
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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action, ...payload })
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    const error = new Error(
      body?.error?.message || `KTMS administrator login failed (${response.status}).`
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

  setAdminSession(
    data.sessionToken,
    data.admin,
    data.adminSessionExpiresAt
  );
  currentAdmin = data.admin || null;
  return data;
}

export async function restoreSession() {
  if (!getAdminSessionData()?.sessionToken) return null;

  try {
    const admin = await adminApi.send('admin.me');
    currentAdmin = admin || null;
    setAdminContext(currentAdmin);
    return currentAdmin;
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
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
    clearAdminSession();
    currentAdmin = null;
  }
}

export function getCurrentAdmin() {
  return currentAdmin;
}
