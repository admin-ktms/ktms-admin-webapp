import './styles/global.css';
import { registerRoute, startRouter } from './app/router.js';
import { renderDashboard } from './pages/Dashboard/dashboard.js';
import { renderPlaceholder } from './pages/Placeholder/placeholder.js';
import { renderLogin } from './pages/Login/login.js';
import { restoreSession, getCurrentAdmin } from './auth/auth.js';

registerRoute('/login', renderLogin, { protected: false });
registerRoute('/', renderDashboard);
registerRoute('/tournaments', () => renderPlaceholder('Tournaments'));
registerRoute('/registrations', () => renderPlaceholder('Registrations'));
registerRoute('/players', () => renderPlaceholder('Players'));
registerRoute('/operations', () => renderPlaceholder('Operations'));
registerRoute('*', renderDashboard);

await restoreSession().catch(() => null);

if (getCurrentAdmin() && window.location.pathname === '/login') {
  window.history.replaceState({}, '', '/');
}

startRouter();
