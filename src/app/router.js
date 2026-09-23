import { auth } from '../auth/auth.js';
import { renderLogin } from '../pages/Login/login.js';
import { renderAdminShell } from '../layout/AdminShell.js';
import { renderTournamentsRoute } from '../pages/Tournaments/router.js';
import { currentPath } from './navigation.js';

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

let renderSequence = 0;

export function resolvePath() {
  return currentPath();
}

function renderModulePlaceholder(path, admin) {
  const title = path === '/' ? 'Dashboard' : routes.get(path) || 'Page not found';
  const description =
    path === '/'
      ? 'KTMS operational overview.'
      : routes.get(path)
        ? 'This module will be implemented in the appropriate KTMS frontend phase.'
        : 'The requested Admin Web App route does not exist.';

  return `
    <section>
      <p class="eyebrow">KTMS ADMIN</p>
      <h1>${title}</h1>
      <p class="muted">${description}</p>
      <p class="muted">Signed in as ${admin.displayName || admin.email || 'Administrator'}.</p>
    </section>
  `;
}

function renderShell(path, content) {
  const app = document.querySelector('#app');
  if (!app) return null;

  let shell = app.querySelector('.admin-shell');
  if (!shell) {
    app.innerHTML = renderAdminShell({ path, content: '' });
    shell = app.querySelector('.admin-shell');
  }

  const adminContent = shell?.querySelector('.admin-content');
  if (!adminContent) return null;

  adminContent.innerHTML = content;

  const activePath = path.startsWith('/tournaments') ? '/tournaments' : path;
  shell.querySelectorAll('.admin-nav__item').forEach((link) => {
    const href = link.getAttribute('href')?.replace(/^#/, '') || '/';
    if (href === activePath) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  return shell;
}

function renderRouteError(path, error) {
  const message = error?.message || 'An unexpected frontend error occurred.';
  renderShell(
    path,
    `
      <section class="error-state">
        <strong>Unable to load this page.</strong>
        <p>${String(message).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</p>
      </section>
    `,
  );
}

export async function renderRoute() {
  const sequence = ++renderSequence;
  const path = resolvePath();

  if (!auth.getAdminSession()) {
    renderLogin();
    return;
  }

  let admin;
  try {
    admin = auth.getAdmin() || await auth.restoreSession();
  } catch (error) {
    if (error?.code === 'ADMIN_SESSION_EXPIRED' || error?.code === 'ADMIN_SESSION_REVOKED') {
      renderLogin();
      return;
    }

    console.error('KTMS Admin route authentication error:', error);
    renderRouteError(path, error);
    return;
  }

  if (!admin) {
    renderLogin();
    return;
  }

  try {
    let content;

    if (path.startsWith('/tournaments')) {
      content = await renderTournamentsRoute(path);
    } else {
      content = renderModulePlaceholder(path, admin);
    }

    if (sequence !== renderSequence || path !== resolvePath()) return;

    renderShell(path, content);
  } catch (error) {
    if (sequence !== renderSequence || path !== resolvePath()) return;

    console.error('KTMS Admin route error:', error);
    renderRouteError(path, error);
  }
}

export function startRouter() {
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}
