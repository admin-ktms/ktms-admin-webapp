import { config } from '../config/config.js';
import { auth } from '../auth/auth.js';

const buildUrl = (path) => {
  if (!config.adminApiUrl) throw new Error('VITE_KTMS_ADMIN_API_URL is not configured.');
  return `${config.adminApiUrl.replace(/\\/$/, '')}/${path.replace(/^\\//, '')}`;
};

export async function adminApi(path, options = {}) {
  const session = await auth.getSession();
  const adminSession = auth.getAdminSession();

  if (!session?.access_token) throw new Error('Authentication session is required.');
  if (!adminSession) throw new Error('KTMS administrator session is required.');

  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      'X-KTMS-Admin-Session': adminSession,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; }
  catch { body = { raw: text }; }

  if (!response.ok) {
    const message = body?.error?.message || body?.message || `KTMS Admin API request failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}
