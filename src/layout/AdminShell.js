import { getCurrentAdmin, signOut } from '../auth/auth.js';
import { navigate } from '../app/router.js';

const NAV_ITEMS = [
  ['/', 'Overview'],
  ['/tournaments', 'Tournaments'],
  ['/registrations', 'Registrations'],
  ['/players', 'Players'],
  ['/operations', 'Operations']
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function currentPath() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function roleLabel(role) {
  return String(role || '').replaceAll('_', ' ');
}

export function renderAdminShell({ title = 'Dashboard', content = '' } = {}) {
  const path = currentPath();
  const admin = getCurrentAdmin();
  const navigation = NAV_ITEMS.map(([href, label]) => {
    const active = href === path;
    return `<a href="${href}" data-route${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');

  document.querySelector('#app').innerHTML = `
    <div class="admin-shell">
      <header class="topbar">
        <a class="brand" href="/" data-route aria-label="KTMS Admin home">
          <span class="brand-mark">KT</span>
          <span>KTMS <small>ADMIN</small></span>
        </a>
        <div class="admin-identity">
          <div class="admin-identity-copy">
            <strong>${escapeHtml(admin?.displayName || 'Administrator')}</strong>
            <span>${escapeHtml(roleLabel(admin?.role || 'Administrator'))}</span>
          </div>
          <button class="logout-button" id="admin-logout" type="button">Sign out</button>
        </div>
      </header>
      <div class="shell-body">
        <aside class="sidebar">
          <nav aria-label="Admin navigation">${navigation}</nav>
        </aside>
        <main class="main-content">
          <div class="page-heading">
            <p class="eyebrow">KTMS ADMIN</p>
            <h1>${escapeHtml(title)}</h1>
          </div>
          <section class="page-content">${content}</section>
        </main>
      </div>
    </div>
  `;

  document.querySelector('#admin-logout')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'Signing out…';
    try {
      await signOut();
    } finally {
      navigate('/login');
    }
  });
}
