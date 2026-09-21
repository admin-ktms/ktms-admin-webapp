import { renderShell } from '../../layout/AdminShell.js';
import { adminApi } from '../../api/adminApi.js';

const metricDefinitions = [
  ['tournaments', 'Tournaments'],
  ['registrationRequests', 'Registration Requests'],
  ['players', 'Players'],
  ['awaitingVerification', 'Awaiting Payment Verification'],
  ['transactions', 'Transactions'],
  ['notifications', 'Notifications'],
  ['supportCases', 'Support Cases'],
];

const formatNumber = (value) => new Intl.NumberFormat().format(Number(value) || 0);

export async function renderDashboard() {
  await renderShell(() => `
    <div class="dashboard-heading">
      <div>
        <h1 class="page-title">Command Center</h1>
        <p class="page-subtitle">KTMS administrative overview and operational status.</p>
      </div>
      <span id="dashboard-refresh-status" class="status status-neutral">Loading authoritative data…</span>
    </div>

    <div id="dashboard-error" class="surface dashboard-alert" hidden></div>

    <div id="dashboard-metrics" class="grid stats-grid">
      ${metricDefinitions.map(([, label]) => `
        <section class="surface stat stat-loading">
          <div class="stat-label">${label}</div>
          <div class="stat-value" aria-live="polite">—</div>
        </section>
      `).join('')}
    </div>

    <section class="surface panel">
      <div class="panel-header">
        <h2 class="panel-title">Attention Center</h2>
      </div>
      <p class="muted">The current Admin API does not expose an authoritative attention-record action. This area remains intentionally unpopulated rather than displaying inferred or fabricated operational alerts.</p>
    </section>

    <section class="surface panel">
      <div class="panel-header">
        <h2 class="panel-title">Operational Status</h2>
      </div>
      <p id="dashboard-operational-status" class="status status-neutral">Connecting to KTMS Admin API…</p>
      <p class="muted">Dashboard figures are read from the existing <code>dashboard.summary</code> Admin API operation. Business rules remain in KTMS Core.</p>
    </section>
  `, 'Command Center');

  const errorBox = document.querySelector('#dashboard-error');
  const refreshStatus = document.querySelector('#dashboard-refresh-status');
  const operationalStatus = document.querySelector('#dashboard-operational-status');

  try {
    const summary = await adminApi.dashboardSummary();

    metricDefinitions.forEach(([key], index) => {
      const value = document.querySelectorAll('#dashboard-metrics .stat-value')[index];
      if (value) value.textContent = formatNumber(summary?.[key]);
    });

    document.querySelectorAll('#dashboard-metrics .stat-loading').forEach(card => {
      card.classList.remove('stat-loading');
    });

    refreshStatus.textContent = 'Live';
    refreshStatus.className = 'status status-live';
    operationalStatus.textContent = 'Admin API connected · session authenticated';
    operationalStatus.className = 'status status-live';
  } catch (error) {
    refreshStatus.textContent = 'Unavailable';
    refreshStatus.className = 'status status-warning';
    operationalStatus.textContent = 'Admin API request failed';
    operationalStatus.className = 'status status-warning';

    errorBox.hidden = false;
    errorBox.innerHTML = `
      <strong>Dashboard data could not be loaded.</strong>
      <p>${escapeHtml(error?.message || 'Unknown Admin API error.')}</p>
      ${error?.traceId ? `<small>Trace ID: ${escapeHtml(error.traceId)}</small>` : ''}
    `;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
