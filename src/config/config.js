const DEFAULT_ADMIN_API_URL =
  'https://gfokwfsqsttrjueqjojz.supabase.co/functions/v1/ktms-admin-api';

const DEFAULT_ADMIN_LOGIN_URL =
  'https://gfokwfsqsttrjueqjojz.supabase.co/functions/v1/ktms-admin-login';

const configured = (name, value, fallback) => {
  if (!value) {
    console.info(
      `KTMS configuration ${name} is not set; using the deployed KTMS backend endpoint.`,
    );
  }

  return value || fallback;
};

export const config = Object.freeze({
  supabaseUrl: 'https://gfokwfsqsttrjueqjojz.supabase.co',

  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  adminApiUrl: configured(
    'VITE_KTMS_ADMIN_API_URL',
    import.meta.env.VITE_KTMS_ADMIN_API_URL,
    DEFAULT_ADMIN_API_URL,
  ),

  adminLoginUrl: configured(
    'VITE_KTMS_ADMIN_LOGIN_URL',
    import.meta.env.VITE_KTMS_ADMIN_LOGIN_URL,
    DEFAULT_ADMIN_LOGIN_URL,
  ),
});
