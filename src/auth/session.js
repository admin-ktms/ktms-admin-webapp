const STORAGE_KEY = 'ktms_admin_session';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.token || !session?.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}

export function getAdminSession() {
  const session = read();
  if (!session) return null;

  if (Date.now() >= new Date(session.expiresAt).getTime()) {
    clearAdminSession();
    return null;
  }

  return session.token;
}

export function getAdminSessionExpiresAt() {
  return read()?.expiresAt || null;
}

export function setAdminSession(token, expiresAt) {
  if (!token || !expiresAt) {
    throw new Error('KTMS did not return a valid administrator session.');
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token,
      expiresAt,
    }),
  );
}

export function clearAdminSession() {
  localStorage.removeItem(STORAGE_KEY);
}
