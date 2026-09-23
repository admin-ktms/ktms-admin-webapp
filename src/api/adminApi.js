import { config } from '../config/config.js';
import { clearAdminSession, getAdminSession } from '../auth/session.js';
import { getCurrentSupabaseAccessToken } from '../lib/supabase.js';

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

  let accessToken;

  try {
    accessToken = await getCurrentSupabaseAccessToken();
  } catch (error) {
    if (error?.code === 'SUPABASE_AUTH_REQUIRED') clearAdminSession();
    throw error;
  }

  const response = await fetch(config.adminApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
      'X-KTMS-Admin-Session': session,
      'X-KTMS-Trace-ID': traceId(),
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    const terminalSession =
      response.status === 401 &&
      (body?.error?.code === 'ADMIN_SESSION_EXPIRED' ||
        body?.error?.code === 'ADMIN_SESSION_REVOKED');

    if (terminalSession) clearAdminSession();

    const error = new Error(
      body?.error?.message ||
        `KTMS Admin API request failed (${response.status}).`,
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
