const DEFAULT_ADMIN_API_URL =
  'https://gfokwfsqsttrjueqjojz.supabase.co/functions/v1/ktms-admin-api';

const DEFAULT_ADMIN_LOGIN_URL =
  'https://gfokwfsqsttrjueqjojz.supabase.co/functions/v1/ktms-admin-login';

export const config = Object.freeze({
  appName: 'KTMS Admin',
  supabaseUrl: 'https://gfokwfsqsttrjueqjojz.supabase.co',
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__dF8ANtuBA8bW4rZQ6lYXw_3N3Xzqkg',
  adminApiUrl: import.meta.env.VITE_KTMS_ADMIN_API_URL || DEFAULT_ADMIN_API_URL,
  adminLoginUrl:
    import.meta.env.VITE_KTMS_ADMIN_LOGIN_URL || DEFAULT_ADMIN_LOGIN_URL,
  environment: import.meta.env.MODE,
});