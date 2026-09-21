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

export function renderAdminShell({ title = 'Dashboard', content = '' } = {}) {
  const path = currentPath();
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
        <div class="topbar-context">Administrator</div>
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
}
