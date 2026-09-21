const SESSION_KEY = 'ktms_admin_session';

export const getAdminSession = () => sessionStorage.getItem(SESSION_KEY);

export const setAdminSession = (sessionToken) => {
  if (!sessionToken) {
    throw new Error('A KTMS admin session token is required.');
  }
  sessionStorage.setItem(SESSION_KEY, sessionToken);
};

export const clearAdminSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};
