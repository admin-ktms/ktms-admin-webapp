import './styles/global.css';
import './styles/components.css';
import './styles/shell.css';
import { renderRoute, startRouter } from './app/router.js';
import {
  bootstrapSupabaseSession,
  installAuthStateListener,
} from './lib/supabase.js';

window.addEventListener('error', (e) =>
  console.error('KTMS Admin Web App error:', e.error || e.message),
);

window.addEventListener('unhandledrejection', (e) =>
  console.error('KTMS Admin Web App rejection:', e.reason),
);

async function startApplication() {
  installAuthStateListener(() => renderRoute());

  try {
    await bootstrapSupabaseSession();
  } catch (error) {
    console.error('KTMS Admin Supabase session bootstrap failed:', error);
  }

  startRouter();
}

startApplication();
