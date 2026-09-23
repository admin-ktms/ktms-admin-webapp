const STORAGE_KEY = 'ktms_admin_session';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);

    if (!session?.adminSessionToken || !session?.adminSessionExpiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isExpired(value) {
  return !value || Date.now() >= new Date(value).getTime();
}

export function getAdminSession() {
  const session = read();

  if (!session || isExpired(session.adminSessionExpiresAt)) {
    if (session) clearAdminSession();
    return null;
  }

  return session.adminSessionToken;
}

export function getAdminSessionExpiresAt() {
  return read()?.adminSessionExpiresAt || null;
}

export function setAdminSession({ sessionToken, adminSessionExpiresAt }) {
  if (!sessionToken || !adminSessionExpiresAt) {
    throw new Error('KTMS did not return a complete administrator session.');
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      adminSessionToken: sessionToken,
      adminSessionExpiresAt,
    }),
  );
}

export function getLegacySupabaseCredentials() {
  const session = readRaw();

  if (!session?.accessToken || !session?.refreshToken) {
    return null;
  }

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
}

export function clearLegacySupabaseCredentials() {
  const session = readRaw();

  if (!session?.adminSessionToken || !session?.adminSessionExpiresAt) {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      adminSessionToken: session.adminSessionToken,
      adminSessionExpiresAt: session.adminSessionExpiresAt,
    }),
  );
}

export function clearAdminSession() {
  localStorage.removeItem(STORAGE_KEY);
}
