import './styles/global.css';
import './styles/shell.css';
import './styles/components.css';

import { startRouter, registerRoute } from './app/router.js';
import { renderDashboard } from './pages/Dashboard/dashboard.js';
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

registerRoute('/dashboard', renderDashboard);

for (const [path, title] of Object.entries(pages)) {
  registerRoute(path, () => renderPlaceholder(title));
}

window.addEventListener('popstate', () => startRouter());

startRouter();
