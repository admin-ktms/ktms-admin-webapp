import './styles/global.css';
import './styles/components.css';
import './styles/shell.css';

import { renderRoute, startRouter } from './app/router.js';

window.addEventListener('error', (e) =>
  console.error('KTMS Admin Web App error:', e.error || e.message),
);

window.addEventListener('unhandledrejection', (e) =>
  console.error('KTMS Admin Web App rejection:', e.reason),
);

async function startApplication() {
  startRouter();

  try {
    await renderRoute();
  } catch (error) {
    console.error('KTMS Admin route initialization failed:', error);
  }
}

startApplication();
