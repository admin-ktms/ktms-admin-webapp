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
registerRoute('/login', renderLogin);

for (const [path, title] of Object.entries(pages)) {
  registerRoute(path, () => routeProtected(() => renderPlaceholder(title)));
}

async function routeProtected(render) {
  const session = await auth.getSession().catch(() => null);
  if (!session?.access_token || !auth.getAdminSession()) {
    window.history.replaceState({}, '', '/login');
    return renderLogin();
  }
  return render();
}

window.addEventListener('popstate', () => startRouter());

startRouter().catch((error) => {
  console.error('KTMS Admin startup failure:', error);
  document.querySelector('#app').innerHTML = `
    <main class="login-page">
      <section class="login-card surface">
        <div class="login-brand">KTMS ADMIN</div>
        <h1>Application startup failed</h1>
        <p class="muted">The Admin Web App could not initialize.</p>
        <pre class="startup-error">${String(error?.message || error)}</pre>
      </section>
    </main>`;
});
