import { adminApi } from '../../api/adminApi.js';
import { navigate } from '../../app/navigation.js';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const date = (value) => value ? new Date(value).toLocaleDateString() : '—';
const statusClass = (status) => 'tournament-status tournament-status--' + String(status || '').toLowerCase().replace(/[^a-z]+/g, '-');

function listHtml(items) {
  if (!items.length) return '<div class="ktms-card empty-state">No tournaments found.</div>';
  return items.map((t) => '<article class="ktms-card tournament-card"><div class="tournament-card__top"><div><p class="eyebrow">' + esc(t.tournament_id) + '</p><h2>' + esc(t.tournament_name) + '</h2></div><span class="' + statusClass(t.tournament_status) + '">' + esc(t.tournament_status) + '</span></div><div class="tournament-card__meta"><span>' + esc(t.tournament_type_id) + '</span><span>Edition ' + esc(t.tournament_edition) + '</span><span>' + esc(t.tournament_year) + '</span></div><div class="tournament-card__dates"><div><small>Registration</small><strong>' + date(t.registration_open_datetime) + ' – ' + date(t.registration_close_datetime) + '</strong></div><div><small>Tournament</small><strong>' + date(t.tournament_start_date) + ' – ' + date(t.tournament_end_date) + '</strong></div></div><button class="button button--secondary tournament-view" type="button" data-id="' + esc(t.tournament_id) + '">View Tournament</button></article>').join('');
}

function bindList(container) {
  container.querySelector('#tournament-create')?.addEventListener('click', () => navigate('/tournaments/create'));
  container.querySelectorAll('.tournament-view').forEach((b) => b.addEventListener('click', () => navigate('/tournaments/' + encodeURIComponent(b.dataset.id))));
}

async function renderList(container) {
  container.innerHTML = '<div class="loading-state">Loading tournaments…</div>';
  const result = await adminApi.listTournaments();
  const all = Array.isArray(result) ? result : [];
  container.innerHTML = '<section><div class="page-header"><div><p class="eyebrow">KTMS</p><h1>Tournaments</h1><p class="muted">Manage tournament lifecycle and configuration.</p></div><button class="button button--primary" id="tournament-create">Create Tournament</button></div><div class="tournament-toolbar"><input class="ktms-input" id="tournament-search" type="search" placeholder="Search tournaments"><select class="ktms-input" id="tournament-status-filter"><option value="">All statuses</option><option>Registration Open</option><option>Registration Closed</option><option>Group Stage</option><option>Playoff Stage</option><option>Knockout Stage</option><option>Reopened</option><option>Suspended</option><option>Completed</option><option>Archived</option></select></div><div class="tournament-grid" id="tournament-grid">' + listHtml(all) + '</div></section>';
  const filter = () => { const q = container.querySelector('#tournament-search').value.trim().toLowerCase(); const status = container.querySelector('#tournament-status-filter').value; const filtered = all.filter((t) => (!status || t.tournament_status === status) && (!q || [t.tournament_id,t.tournament_name,t.tournament_type_id,t.tournament_year].join(' ').toLowerCase().includes(q))); container.querySelector('#tournament-grid').innerHTML = listHtml(filtered); bindList(container); };
  container.querySelector('#tournament-search').addEventListener('input', filter);
  container.querySelector('#tournament-status-filter').addEventListener('change', filter);
  bindList(container);
}

async function renderCreate(container) {
  const types = await adminApi.listTournamentTypes();
  container.innerHTML = '<section><div class="page-header"><div><p class="eyebrow">TOURNAMENTS</p><h1>Create Tournament</h1><p class="muted">Enter only the values required to create the tournament.</p></div></div><form class="ktms-card tournament-form" id="create-tournament-form"><label>Tournament Type<select class="ktms-input" name="tournamentTypeId" required><option value="">Select tournament type</option>' + (Array.isArray(types) ? types.map((t) => '<option value="' + esc(t.tournamentTypeId) + '">' + esc(t.tournamentTypeName) + ' (' + esc(t.tournamentTypeCode) + ')</option>').join('') : '') + '</select></label><label>Tournament Name<input class="ktms-input" name="tournamentName" required></label><label>Tournament Year<input class="ktms-input" name="year" type="number" min="2000" required value="' + new Date().getFullYear() + '"></label><label>Tournament Start Date<input class="ktms-input" name="startDate" type="date" required></label><label>Registration Fee<input class="ktms-input" name="registrationFee" type="number" min="0" step="0.01" value="1000"></label><label>Minimum Age<input class="ktms-input" name="minimumAge" type="number" min="0" value="18"></label><div class="form-actions"><button class="button button--secondary" type="button" id="create-cancel">Cancel</button><button class="button button--primary" type="submit">Create Tournament</button></div><p class="muted form-note">Registration dates, tournament end date, and capacity are calculated by KTMS.</p><p class="auth-message" id="create-message" aria-live="polite"></p></form></section>';
  container.querySelector('#create-cancel').addEventListener('click', () => navigate('/tournaments'));
  container.querySelector('#create-tournament-form').addEventListener('submit', async (event) => { event.preventDefault(); const form = event.currentTarget; const button = form.querySelector('[type="submit"]'); const message = form.querySelector('#create-message'); button.disabled = true; message.textContent = 'Creating tournament…'; try { const data = await adminApi.createTournament(Object.fromEntries(new FormData(form).entries())); navigate('/tournaments/' + encodeURIComponent(data.tournamentId)); } catch (error) { message.textContent = error?.message || 'Tournament could not be created.'; button.disabled = false; } });
}

async function renderDetails(container, tournamentId) {
  const t = await adminApi.getTournament(tournamentId);
  if (!t) throw new Error('Tournament was not found.');
  const suspendable = ['Registration Open','Registration Closed','Group Stage','Playoff Stage','Knockout Stage','Reopened'].includes(t.tournament_status);
  const reopenable = ['Suspended','Registration Closed','Completed','Archived'].includes(t.tournament_status);
  const summary = t.operationalSummary || {};
  container.innerHTML = '<section><div class="page-header"><div><p class="eyebrow">' + esc(t.tournament_id) + '</p><h1>' + esc(t.tournament_name) + '</h1><span class="' + statusClass(t.tournament_status) + '">' + esc(t.tournament_status) + '</span></div><div class="form-actions">' + (suspendable ? '<button class="button button--secondary" id="tournament-suspend">Suspend</button>' : '') + (reopenable ? '<button class="button button--primary" id="tournament-reopen">Reopen</button>' : '') + '</div></div><div class="tournament-detail-grid"><div class="ktms-card detail-card"><h2>Overview</h2><dl class="detail-list"><dt>Type</dt><dd>' + esc(t.tournament_type_id) + '</dd><dt>Year</dt><dd>' + esc(t.tournament_year) + '</dd><dt>Edition</dt><dd>' + esc(t.tournament_edition) + '</dd><dt>Registration</dt><dd>' + date(t.registration_open_datetime) + ' – ' + date(t.registration_close_datetime) + '</dd><dt>Start</dt><dd>' + date(t.tournament_start_date) + '</dd><dt>End</dt><dd>' + date(t.tournament_end_date) + '</dd><dt>Entry fee</dt><dd>' + (t.registration_fee ?? '—') + '</dd><dt>Capacity</dt><dd>' + (t.maximum_players ?? '—') + '</dd></dl></div><div class="ktms-card detail-card"><h2>Operations</h2><p class="muted">Registration: ' + (summary.registrationCount ?? summary.registrations ?? '—') + ' / ' + (t.maximum_players ?? '—') + '</p><div class="module-links">' + [['Registrations','/registrations'],['Matchdays','/matchdays'],['Fixtures','/fixtures'],['Results','/results'],['Standings','/standings'],['Progression','/progression'],['Awards','/awards']].map((x) => '<button type="button" class="button button--secondary" data-module="' + x[1] + '">' + x[0] + '</button>').join('') + '</div></div></div></section>';
  container.querySelectorAll('[data-module]').forEach((b) => b.addEventListener('click', () => navigate(b.dataset.module)));
  for (const item of [['tournament-suspend','SUSPEND','Suspend Tournament'],['tournament-reopen','REOPEN','Reopen Tournament']]) container.querySelector('#' + item[0])?.addEventListener('click', async () => { if (!window.confirm(item[2] + '?\n\n' + t.tournament_id)) return; const b = container.querySelector('#' + item[0]); b.disabled = true; try { await adminApi.tournamentAction(t.tournament_id,item[1]); await renderDetails(container,t.tournament_id); } catch (error) { window.alert(error?.message || 'Tournament action failed.'); b.disabled = false; } });
}

export async function renderTournaments(container, subpath = '') {
  if (subpath === '/create') return renderCreate(container);
  if (subpath.startsWith('/')) return renderDetails(container, decodeURIComponent(subpath.slice(1)));
  return renderList(container);
}