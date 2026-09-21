import { renderShell } from '../../layout/AdminShell.js';

export async function renderDashboard() {
  await renderShell(() => `
    <h1 class="page-title">Command Center</h1>
    <p class="page-subtitle">KTMS administrative overview and operational status.</p>

    <div class="grid stats-grid">
      ${['Tournaments','Players','Pending Payments','Support'].map(label => `
        <section class="surface stat">
          <div class="stat-label">${label}</div>
          <div class="stat-value">0</div>
        </section>
      `).join('')}
    </div>

    <section class="surface panel">
      <div class="panel-header">
        <h2 class="panel-title">Attention Center</h2>
      </div>
      <p class="muted">No authoritative attention records are currently exposed by the Admin API.</p>
    </section>

    <section class="surface panel">
      <div class="panel-header">
        <h2 class="panel-title">Operational Status</h2>
      </div>
      <p class="status">Frontend shell online</p>
      <p class="muted">Live operational indicators will be connected only after their authoritative API contracts are verified.</p>
    </section>
  `);
}
