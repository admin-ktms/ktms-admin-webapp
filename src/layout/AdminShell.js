import { navigate } from '../app/router.js';
import { auth } from '../auth/auth.js';

const links = [
  ['Dashboard', '/dashboard'],
  ['Tournaments', '/tournaments'],
  ['Registrations', '/registrations'],
  ['Players', '/players'],
  ['Accounts', '/accounts'],
  ['Payments', '/payments'],
  ['Matchdays', '/matchdays'],
  ['Groups', '/groups'],
  ['Fixtures', '/fixtures'],
  ['Results', '/results'],
  ['Standings', '/standings'],
  ['Progression', '/progression'],
  ['Awards', '/awards'],
  ['Notifications', '/notifications'],
  ['Support', '/support'],
  ['Operations', '/operations'],
  ['Audit', '/audit'],
  ['Administrators', '/administrators'],
  ['Roles', '/roles'],
  ['GM Security', '/game-master-security'],
];

const sectionFor = (label) => {
  if (['Dashboard'].includes(label)) return 'Command';
  if (['Tournaments', 'Registrations', 'Players', 'Accounts', 'Payments'].includes(label)) return 'Core';
  if (['Matchdays', 'Groups', 'Fixtures', 'Results', 'Standings', 'Progression', 'Awards'].includes(label)) return 'Competition';
  if (['Notifications', 'Support'].includes(label)) return 'Engagement';
  return 'Administration';
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export async function renderShell(renderPage, title = 'Dashboard') {
  const path = window.location.pathname;
  const admin = auth.getAdmin();
  const groups = [...new Set(links.map(([label]) => sectionFor(label)))];

  document.querySelector('#app').innerHTML = `
    <div class="admin-shell">
      <aside class="sidebar">
        <div class="brand">KTMS ADMIN</div>
        ${groups.map(section => `
          <div class="nav-section">${section}</div>
          ${links.filter(([label]) => sectionFor(label) === section).map(([label, href]) => `
            <a class="nav-link ${path === href ? 'active' : ''}" href="${href}" data-route>${label}</a>
          `).join('')}
        `).join('')}
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="topbar-title">
            <strong>${escapeHtml(title)}</strong>
          </div>

          <div class="topbar-actions">
            <div class="admin-identity">
              <strong>${escapeHtml(admin?.display_name || 'Administrator')}</strong>
              <span class="role-label">${escapeHtml(admin?.role || 'Administrator')}</span>
            </div>
            <button class="button topbar-logout" id="logout-button" type="button">Sign out</button>
          </div>
        </header>

        <div class="content">
          <div class="page">${renderPage()}</div>
        </div>
      </main>
    </div>
  `;

  document.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigate(link.getAttribute('href'));
    });
  });

  document.querySelector('#logout-button').addEventListener('click', async () => {
    const button = document.querySelector('#logout-button');
    button.disabled = true;
    button.textContent = 'Signing out…';

    try {
      await auth.signOut();
    } finally {
      window.history.replaceState({}, '', '/login');
      await navigate('/login');
    }
  });
}
