import { config } from '../config/config.js';
import { getAdminSession, clearAdminSession } from '../auth/session.js';

function traceId() {
  return globalThis.crypto?.randomUUID?.()
    || `ktms-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function parseResponse(response) {
  const body = await response.json().catch(() => null);

  if (!response.ok || body?.success === false) {
    const error = new Error(
      body?.error?.message || `KTMS Admin API request failed (${response.status}).`
    );
    error.status = response.status;
    error.code = body?.error?.code || null;
    error.traceId =
      body?.error?.traceId ||
      response.headers.get('X-KTMS-Trace-ID') ||
      null;
    throw error;
  }

  return body?.data;
}

export async function sendAdminSignal(action, payload = {}) {
  if (!action || typeof action !== 'string') {
    throw new TypeError('A KTMS Admin API action is required.');
  }

  const session = getAdminSession();
  if (!session) {
    const error = new Error('KTMS administrator session required.');
    error.status = 401;
    error.code = 'ADMIN_SESSION_REQUIRED';
    throw error;
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-KTMS-Admin-Session': session,
      'X-KTMS-Trace-ID': traceId()
    },
    body: JSON.stringify({ action, ...payload })
  });

  try {
    return await parseResponse(response);
  } catch (error) {
    if (
      error.status === 401 ||
      error.code === 'ADMIN_SESSION_INVALID' ||
      error.code === 'ADMIN_SESSION_EXPIRED' ||
      error.code === 'ADMIN_SESSION_REQUIRED'
    ) {
      clearAdminSession();
      window.dispatchEvent(new CustomEvent('ktms:session-expired', {
        detail: { code: error.code || 'ADMIN_SESSION_INVALID', traceId: error.traceId || null }
      }));
    }
    throw error;
  }
}

export const adminApi = Object.freeze({
  send: sendAdminSignal
});
