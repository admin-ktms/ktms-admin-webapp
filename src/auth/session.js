const STORAGE_KEY = 'ktms_admin_session';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.adminSessionToken || !session?.accessToken || !session?.adminSessionExpiresAt) return null;
    return session;
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

export function getSupabaseAccessToken() {
  const session = read();
  if (!session || isExpired(session.adminSessionExpiresAt)) {
    if (session) clearAdminSession();
    return null;
  }
  return session.accessToken;
}

export function getAdminSessionExpiresAt() {
  return read()?.adminSessionExpiresAt || null;
}

export function setAdminSession({
  sessionToken,
  adminSessionExpiresAt,
  accessToken,
  accessTokenExpiresAt,
  refreshToken,
}) {
  if (!sessionToken || !adminSessionExpiresAt || !accessToken || !accessTokenExpiresAt) {
    throw new Error('KTMS did not return a complete administrator session.');
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      adminSessionToken: sessionToken,
      adminSessionExpiresAt,
      accessToken,
      accessTokenExpiresAt,
      refreshToken: refreshToken || null,
    }),
  );
}

export function clearAdminSession() {
  localStorage.removeItem(STORAGE_KEY);
}
