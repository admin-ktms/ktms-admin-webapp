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
  if (['Tournaments','Registrations','Players','Accounts','Payments'].includes(label)) return 'Core';
  if (['Matchdays','Groups','Fixtures','Results','Standings','Progression','Awards'].includes(label)) return 'Competition';
  if (['Notifications','Support'].includes(label)) return 'Engagement';
  return 'Administration';
};

export async function renderShell(renderPage, title = 'Dashboard') {
  const path = window.location.pathname;
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
          <div><strong>${title}</strong></div>
          <div class="role-label">Game Master</div>
        </header>
        <div class="content"><div class="page">${renderPage()}</div></div>
      </main>
    </div>
  `;

  document.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigate(link.getAttribute('href'));
    });
  });
}
