import './styles/global.css';
import { registerRoute, startRouter } from './app/router.js';
import { renderDashboard } from './pages/Dashboard/dashboard.js';
import { renderPlaceholder } from './pages/Placeholder/placeholder.js';

registerRoute('/', renderDashboard);
registerRoute('/tournaments', () => renderPlaceholder('Tournaments'));
registerRoute('/registrations', () => renderPlaceholder('Registrations'));
registerRoute('/players', () => renderPlaceholder('Players'));
registerRoute('/operations', () => renderPlaceholder('Operations'));
registerRoute('*', renderDashboard);

startRouter();