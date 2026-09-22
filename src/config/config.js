const DEFAULT_ADMIN_API_URL =
  'https://gfokwfsqsttrjueqjojz.supabase.co/functions/v1/ktms-admin-api';

const DEFAULT_ADMIN_LOGIN_URL =
  'https://gfokwfsqsttrjueqjojz.supabase.co/functions/v1/ktms-admin-login';

export const config = Object.freeze({
  appName: 'KTMS Admin',
  supabaseUrl: 'https://gfokwfsqsttrjueqjojz.supabase.co',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmb2t3ZnNxc3R0cmp1ZXFqb2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzgxNTMsImV4cCI6MjEwNDYxNDE3M30.X1bMsMR3t4scYE46VkY_Ui3bsgKM_YXhdcHRExEqi6Y',
  adminApiUrl: import.meta.env.VITE_KTMS_ADMIN_API_URL || DEFAULT_ADMIN_API_URL,
  adminLoginUrl:
    import.meta.env.VITE_KTMS_ADMIN_LOGIN_URL || DEFAULT_ADMIN_LOGIN_URL,
  environment: import.meta.env.MODE,
});