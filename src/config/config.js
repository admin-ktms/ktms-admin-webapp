const required = (name, value) => {
  if (!value) console.warn(`KTMS configuration value ${name} is not set.`);
  return value || '';
};

export const config = Object.freeze({
  adminApiUrl: required('VITE_KTMS_ADMIN_API_URL', import.meta.env.VITE_KTMS_ADMIN_API_URL),
  adminLoginUrl: required('VITE_KTMS_ADMIN_LOGIN_URL', import.meta.env.VITE_KTMS_ADMIN_LOGIN_URL),
});
