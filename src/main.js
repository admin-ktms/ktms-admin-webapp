import './styles/global.css';
import './styles/shell.css';
import './styles/components.css';

import { startRouter, registerRoute } from './app/router.js';
import { auth } from './auth/auth.js';
import { renderDashboard } from './pages/Dashboard/dashboard.js';
import { renderLogin } from './pages/Login/login.js';
import { renderPlaceholder } from './pages/Placeholder/placeholder.js';

const pages = {
  '/tournaments': 'Tournaments',
  '/registrations': 'Registrations',
  '/players': 'Players',
  '/accounts': 'Accounts',
  '/payments': 'Payments',
  '/matchdays': 'Matchdays',
  '/groups': 'Groups',
  '/fixtures': 'Fixtures',
  '/results': 'Results',
  '/standings': 'Standings',
  '/progression': 'Progression',
  '/awards': 'Awards',
  '/notifications': 'Notifications',
  '/support': 'Support',
  '/operations': 'Operations',
  '/audit': 'Audit',
  '/administrators': 'Administrators',
  '/roles': 'Roles',
  '/game-master-security': 'GM Security',
};

registerRoute('/', () => routeProtected(renderDashboard));
registerRoute('/dashboard', () => routeProtected(renderDashboard));
registerRoute('/login', routeLogin);

for (const [path, title] of Object.entries(pages)) {
  registerRoute(path, () => routeProtected(() => renderPlaceholder(title)));
}

async function routeLogin() {
  if (window.location.pathname !== '/login') return;

  const restored = await auth.restoreSession().catch(() => null);
  if (restored) {
    window.history.replaceState({}, '', '/dashboard');
    return renderDashboard();
  }

  return renderLogin();
}

async function routeProtected(render) {
  const restored = await auth.restoreSession().catch(() => null);
  if (!restored) {
    window.history.replaceState({}, '', '/login');
    return renderLogin();
  }
  return render();
}

window.addEventListener('popstate', () => {
  startRouter().catch(handleStartupFailure);
});

startRouter().catch(handleStartupFailure);

function handleStartupFailure(error) {
  console.error('KTMS Admin startup failure:', error);
  document.querySelector('#app').innerHTML = `
    <main class="login-page">
      <section class="login-card surface">
        <div class="login-brand">KTMS ADMIN</div>
        <h1>Application startup failed</h1>
        <p class="muted">The Admin Web App could not initialize.</p>
        <pre class="startup-error">${escapeHtml(error?.message || error)}</pre>
      </section>
    </main>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
