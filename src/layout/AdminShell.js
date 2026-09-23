const NAV_ITEMS = [
  ['Dashboard', '/'],
  ['Tournaments', '/tournaments'],
  ['Registrations', '/registrations'],
  ['Players', '/players'],
  ['Payments', '/payments'],
  ['Matchdays', '/matchdays'],
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
];

export function renderAdminShell({ path, content }) {
  const nav = NAV_ITEMS.map(
    ([label, href]) =>
      `<a class="admin-nav__item" href="#${href}" ${activePath === href ? 'aria-current="page"' : ''}>${label}</a>`,
  ).join('');

  return `
    <div class="admin-shell">
      <header class="admin-header">
        <a class="admin-brand" href="#/" aria-label="KTMS Admin dashboard">
          <span class="admin-brand-mark" aria-hidden="true"></span>
          <span>KTMS ADMIN</span>
        </a>

        <div class="admin-header__actions">
          <span class="ktms-status">Administrator</span>
          <button
            type="button"
            class="admin-logout"
            id="admin-logout"
            aria-label="Log out of KTMS Admin"
          >
            Log out
          </button>
        </div>
      </header>
      <aside class="admin-sidebar">
        <nav class="admin-nav" aria-label="Admin navigation">${nav}</nav>
      </aside>
      <main class="admin-main">
        <div class="admin-content">${content}</div>
      </main>
    </div>
  `;
}
