const SESSION_KEY = 'ktms_admin_session';
const SESSION_EXPIRY_KEY = 'ktms_admin_session_expires_at';

export const getAdminSession = () => localStorage.getItem(SESSION_KEY);

export const getAdminSessionExpiresAt = () => localStorage.getItem(SESSION_EXPIRY_KEY);

export const setAdminSession = (sessionToken, expiresAt = null) => {
  if (!sessionToken) {
    throw new Error('A KTMS admin session token is required.');
  }

  localStorage.setItem(SESSION_KEY, sessionToken);

  if (expiresAt) localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt);
  else localStorage.removeItem(SESSION_EXPIRY_KEY);
};

export const clearAdminSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
};
