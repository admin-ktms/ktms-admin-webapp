import { config } from '../config/config.js';
import { clearAdminSession, getAdminSession, getSupabaseAccessToken } from '../auth/session.js';

function traceId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `ktms-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function request(action, payload = {}) {
  const session = getAdminSession();

  if (!session) {
    const error = new Error('KTMS administrator session required.');
    error.code = 'ADMIN_SESSION_REQUIRED';
    error.status = 401;
    throw error;
  }

  const response = await fetch(config.adminApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getSupabaseAccessToken()}`,\n      'X-KTMS-Admin-Session': session,
      'X-KTMS-Trace-ID': traceId(),
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    if (response.status === 401) clearAdminSession();

    const error = new Error(
      body?.error?.message || `KTMS Admin API request failed (${response.status}).`,
    );
    error.status = response.status;
    error.code = body?.error?.code;
    error.traceId =
      body?.error?.traceId ||
      response.headers.get('X-KTMS-Trace-ID') ||
      null;
    error.body = body;
    throw error;
  }

  return body.data;
}

export const adminApi = Object.freeze({
  request,
  me: () => request('admin.me'),
  dashboardSummary: () => request('dashboard.summary'),
  logout: () => request('admin.session.logout'),
});
