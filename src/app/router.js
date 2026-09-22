import { auth } from '../auth/auth.js';
import { renderLogin } from '../pages/Login/login.js';
import { renderAdminShell } from '../layout/AdminShell.js';
import { renderTournamentsOverview, renderAllTournaments } from '../pages/Tournaments/tournaments.js';
import { renderCreateTournament } from '../pages/Tournaments/create.js';
import { renderTournamentPage } from '../pages/Tournaments/tournament.js';

const routes = new Map([
  ['/tournaments', 'Tournaments'],
  ['/registrations', 'Registrations'],
  ['/players', 'Players'],
  ['/payments', 'Payments'],
  ['/matchdays', 'Matchdays'],
  ['/fixtures', 'Fixtures'],
  ['/results', 'Results'],
  ['/standings', 'Standings'],
  ['/progression', 'Progression'],
  ['/awards', 'Awards'],
  ['/notifications', 'Notifications'],
  ['/support', 'Support'],
  ['/operations', 'Operations'],
  ['/audit', 'Audit'],
  ['/administrators', 'Administrators'],
]);

export function resolvePath() {
  return window.location.hash.replace(/^#/, '') || '/';
}

export async function renderRoute() {
  const session = auth.getAdminSession();
  if (!session) { renderLogin(); return; }

  try {
    const admin = auth.getAdmin() || await auth.restoreSession();
    if (!admin) { renderLogin(); return; }

    const path = resolvePath();

    if (path === '/tournaments') return renderTournamentsOverview();
    if (path === '/tournaments/all') return renderAllTournaments();
    if (path === '/tournaments/create') return renderCreateTournament();

    const match = path.match(/^\/tournaments\/([^/]+)(?:\/(overview|settings|lifecycle))?$/);
    if (match) {
      const tournamentId = decodeURIComponent(match[1]);
      return renderTournamentPage(tournamentId, match[2] || 'overview');
    }

    const title = path === '/' ? 'Dashboard' : routes.get(path) || 'Page not found';
    const description = path === '/' ? 'KTMS operational overview.' : routes.get(path) ? 'This module will be implemented in the appropriate KTMS frontend phase.' : 'The requested Admin Web App route does not exist.';
    document.querySelector('#app').innerHTML = renderAdminShell({
      path,
      content: `<section><p class="eyebrow">KTMS ADMIN</p><h1>${title}</h1><p class="muted">${description}</p><p class="muted">Signed in as ${admin.displayName || admin.email || 'Administrator'}.</p></section>`,
    });
  } catch (error) {
    console.error(error);
    renderLogin();
  }
}

export function startRouter() {
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}
