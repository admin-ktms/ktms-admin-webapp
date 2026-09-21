import { config } from '../config/config.js';

function read() {
  const raw = sessionStorage.getItem(config.sessionStorageKey);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return { sessionToken: raw }; }
}

export function getAdminSession() {
  const data = read();
  return data?.sessionToken || null;
}

export function getAdminSessionData() {
  return read();
}

export function setAdminSession(sessionToken, admin = null, expiresAt = null) {
  if (!sessionToken) throw new Error('A KTMS administrator session token is required.');
  sessionStorage.setItem(config.sessionStorageKey, JSON.stringify({
    sessionToken,
    admin,
    expiresAt
  }));
}

export function setAdminContext(admin) {
  const current = read();
  if (!current?.sessionToken) return;
  sessionStorage.setItem(config.sessionStorageKey, JSON.stringify({
    ...current,
    admin
  }));
}

export function clearAdminSession() {
  sessionStorage.removeItem(config.sessionStorageKey);
}

export function hasAdminSession() {
  const data = read();
  if (!data?.sessionToken) return false;
  if (data.expiresAt && Date.parse(data.expiresAt) <= Date.now()) {
    clearAdminSession();
    return false;
  }
  return true;
}
