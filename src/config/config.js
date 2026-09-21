const required = (name, value) => {
  if (!value) {
    console.warn(`KTMS configuration value ${name} is not set.`);
  }
  return value || '';
};

export const config = Object.freeze({
  supabaseUrl: required('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: required(
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ),
  adminApiUrl: required('VITE_KTMS_ADMIN_API_URL', import.meta.env.VITE_KTMS_ADMIN_API_URL),
});
