import { auth } from '../auth/auth.js';
import { renderLogin } from '../pages/Login/login.js';
import { renderAdminShell } from '../layout/AdminShell.js';
import { renderTournamentsOverview, renderAllTournaments } from '../pages/Tournaments/tournaments.js';
import { renderCreateTournament, bindCreateTournamentForm } from '../pages/Tournaments/create.js';
import { renderTournamentPage } from '../pages/Tournaments/tournament.js';

const routes = new Map([
  ['/tournaments','Tournaments'],['/registrations','Registrations'],['/players','Players'],['/payments','Payments'],
  ['/matchdays','Matchdays'],['/fixtures','Fixtures'],['/results','Results'],['/standings','Standings'],
  ['/progression','Progression'],['/awards','Awards'],['/notifications','Notifications'],['/support','Support'],
  ['/operations','Operations'],['/audit','Audit'],['/administrators','Administrators'],
]);

export function resolvePath() { return window.location.hash.replace(/^#/, '') || '/'; }

function tournamentRoute(path) {
  if (path === '/tournaments') return { type:'overview' };
  if (path === '/tournaments/all') return { type:'all' };
  if (path === '/tournaments/create') return { type:'create' };
  const match = path.match(/^\/tournaments\/([^/]+)(?:\/(overview|settings|lifecycle))?$/);
  if (!match) return null;
  return { type:'selected', tournamentId:decodeURIComponent(match[1]), page:match[2] || 'overview' };
}

export async function renderRoute() {
  if (!auth.getAdminSession()) { renderLogin(); return; }
  try {
    const admin = auth.getAdmin() || await auth.restoreSession();
    if (!admin) { renderLogin(); return; }
    const path = resolvePath();
    const tRoute = tournamentRoute(path);
    let content;
    if (tRoute?.type === 'overview') content = await renderTournamentsOverview();
    else if (tRoute?.type === 'all') content = await renderAllTournaments();
    else if (tRoute?.type === 'create') content = renderCreateTournament();
    else if (tRoute?.type === 'selected') content = await renderTournamentPage(tRoute.tournamentId, tRoute.page);
    else {
      const title = path === '/' ? 'Dashboard' : routes.get(path) || 'Page not found';
      const description = path === '/' ? 'KTMS operational overview.' : routes.get(path) ? 'This module will be implemented in the appropriate KTMS frontend phase.' : 'The requested Admin Web App route does not exist.';
      content = `<section><p class="eyebrow">KTMS ADMIN</p><h1>${title}</h1><p class="muted">${description}</p><p class="muted">Signed in as ${admin.displayName || admin.email || 'Administrator'}.</p></section>`;
    }
    document.querySelector('#app').innerHTML = renderAdminShell({ path, content });
    if (tRoute?.type === 'create') bindCreateTournamentForm();
  } catch (error) {
    console.error(error);
    renderLogin();
  }
}
export function startRouter() { window.addEventListener('hashchange', renderRoute); renderRoute(); }
