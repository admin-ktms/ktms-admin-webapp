import { auth } from '../auth/auth.js';
import { renderLogin } from '../pages/Login/login.js';
import { renderAdminShell } from '../layout/AdminShell.js';

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
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

export async function renderRoute() {
  const session = auth.getAdminSession();

  if (!session) {
    renderLogin();
    return;
  }

  try {
    const admin = auth.getAdmin() || await auth.restoreSession();
    if (!admin) {
      renderLogin();
      return;
    }

    const path = resolvePath();
    const title = path === '/' ? 'Dashboard' : routes.get(path) || 'Page not found';
    const description =
      path === '/'
        ? 'KTMS operational overview.'
        : routes.get(path)
          ? 'This module will be implemented in the appropriate KTMS frontend phase.'
          : 'The requested Admin Web App route does not exist.';

    document.querySelector('#app').innerHTML = renderAdminShell({
      path,
      content: `
        <section>
          <p style="color:var(--ktms-secondary);margin:0 0 8px">KTMS ADMIN</p>
          <h1 style="margin:0 0 10px">${title}</h1>
          <p style="color:var(--ktms-secondary);max-width:720px">${description}</p>
          <p style="color:var(--ktms-secondary);margin-top:24px">Signed in as ${admin.displayName || admin.email || 'Administrator'}.</p>
        </section>
      `,
    });
  } catch (error) {
    renderLogin();
  }
}

export function startRouter() {
  window.addEventListener('hashchange', () => {
    renderRoute();
  });
  renderRoute();
}
