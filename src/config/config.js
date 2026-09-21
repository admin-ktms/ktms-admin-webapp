const DEFAULT_API_URL='https://gfokwfsqsttrjueqjojz.supabase.co/functions/v1/ktms-admin-api';
const DEFAULT_LOGIN_URL='https://gfokwfsqsttrjueqjojz.supabase.co/functions/v1/ktms-admin-login';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY='sb_publishable__dF8ANtuBA8bW4rZQ6lYXw_3N3Xzqkg';

export const config=Object.freeze({
  appName:'KTMS Admin',
  apiUrl:import.meta.env.VITE_KTMS_ADMIN_API_URL||DEFAULT_API_URL,
  loginUrl:import.meta.env.VITE_KTMS_ADMIN_LOGIN_URL||DEFAULT_LOGIN_URL,
  publishableKey:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  sessionStorageKey:'ktms_admin_session'
});