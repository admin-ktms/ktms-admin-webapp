import { config } from '../config/config.js';
import { auth } from '../auth/auth.js';
import { clearAdminSession } from '../auth/session.js';

export async function adminApi(action, options = {}) {
  if (!config.adminApiUrl) throw new Error('VITE_KTMS_ADMIN_API_URL is not configured.');

  const adminSession = auth.getAdminSession();
  if (!adminSession) throw new Error('KTMS administrator session is required.');

  const requestBody = options.body && typeof options.body === 'object'
    ? { action, ...options.body }
    : { action };

  const response = await fetch(config.adminApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-KTMS-Admin-Session': adminSession,
      ...(options.headers || {}),
    },
    body: JSON.stringify(requestBody),
  });

  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  if (!response.ok) {
    const errorCode = body?.error?.code;

    if (
      response.status === 401 &&
      ['AUTH_REQUIRED', 'INVALID_SESSION', 'ADMIN_SESSION_REQUIRED', 'ADMIN_SESSION_INVALID', 'ADMIN_SESSION_EXPIRED'].includes(errorCode)
    ) {
      clearAdminSession();
      window.history.replaceState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    const message = body?.error?.message || body?.message || `KTMS Admin API request failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}
