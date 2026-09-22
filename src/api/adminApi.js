import { config } from '../config/config.js';
import { supabase } from '../lib/supabase.js';
import { getAdminSession, clearAdminSession } from '../auth/session.js';

function traceId() {
  return globalThis.crypto?.randomUUID?.()
    || 'ktms-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

async function parseResponse(response) {
  const body = await response.json().catch(() => null);

  if (!response.ok || body?.success === false) {
    const error = new Error(
      body?.error?.message || 'KTMS Admin API request failed (' + response.status + ').'
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

  const ktmsSession = getAdminSession();
  if (!ktmsSession) {
    const error = new Error('KTMS administrator session required.');
    error.status = 401;
    error.code = 'ADMIN_SESSION_REQUIRED';
    throw error;
  }

  const { data: authData, error: authError } = await supabase.auth.getSession();
  const accessToken = authData?.session?.access_token;

  if (authError || !accessToken) {
    const error = new Error('Supabase administrator authentication session required.');
    error.status = 401;
    error.code = 'SUPABASE_SESSION_REQUIRED';
    clearAdminSession();
    window.dispatchEvent(new CustomEvent('ktms:session-expired', {
      detail: { code: error.code, traceId: null }
    }));
    throw error;
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      apikey: config.publishableKey,
      Authorization: 'Bearer ' + accessToken,
      'X-KTMS-Admin-Session': ktmsSession,
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
      error.code === 'ADMIN_SESSION_REQUIRED' ||
      error.code === 'SUPABASE_SESSION_REQUIRED'
    ) {
      clearAdminSession();
      await supabase.auth.signOut().catch(() => {});
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
