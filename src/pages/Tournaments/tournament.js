import { adminApi } from '../../api/adminApi.js';
import { renderTournamentContextShell, esc, money } from './tournaments.js';

function dateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}
function info(label,value) { return `<div class="info-item"><span>${esc(label)}</span><strong>${esc(value ?? '—')}</strong></div>`; }

export async function renderTournamentPage(tournamentId,page='overview') {
  try {
    const tournament = await adminApi.tournaments.get(tournamentId);
    if (!tournament) throw new Error('Tournament was not found.');
    if (page === 'settings') return renderSettings(tournament);
    if (page === 'lifecycle') return renderLifecycle(tournament);
    return renderOverview(tournament);
  } catch (error) {
    return renderTournamentContextShell(
      { tournament_id:tournamentId, tournament_name:'Tournament unavailable', tournament_status:'Unavailable' },
      page,
      `<div class="error-state"><strong>Unable to load tournament.</strong><p>${esc(error.message)}</p><a class="button button--secondary" href="#/tournaments/all">Back to tournaments</a></div>`,
    );
  }
}
function renderOverview(t) {
  const s=t.operationalSummary||{}, reg=s.registration||{}, comp=s.competition||{}, results=s.results||{};
  const content=`<section class="page-heading"><div><p class="eyebrow">TOURNAMENT OVERVIEW</p><h2>Operational snapshot</h2><p>Authoritative tournament information and current operational counts.</p></div></section>
  <section class="stat-grid"><div class="stat-card"><span>Registered players</span><strong>${reg.registeredPlayers??'—'} / ${reg.maximumPlayers??t.maximum_players??'—'}</strong></div><div class="stat-card"><span>Registration requests</span><strong>${reg.registrationRequests??'—'}</strong></div><div class="stat-card"><span>Matchdays completed</span><strong>${comp.matchdaysCompleted??'—'} / ${comp.matchdays??'—'}</strong></div><div class="stat-card"><span>Fixtures completed</span><strong>${comp.fixturesCompleted??'—'} / ${comp.fixtures??'—'}</strong></div><div class="stat-card"><span>Official results</span><strong>${results.officialResults??'—'}</strong></div><div class="stat-card"><span>Pending verification</span><strong>${results.pendingVerification??'—'}</strong></div></section>
  <section class="panel"><div class="section-heading"><h2>Tournament details</h2></div><div class="info-grid">${info('Tournament ID',t.tournament_id)}${info('Tournament type',t.tournament_type_id)}${info('Edition',t.tournament_edition)}${info('Year',t.tournament_year)}${info('Registration fee',money(t.registration_fee))}${info('Minimum age',t.minimum_age)}${info('Maximum players',t.maximum_players)}${info('Registration opens',dateTime(t.registration_open_datetime))}${info('Registration closes',dateTime(t.registration_close_datetime))}${info('Tournament starts',t.tournament_start_date)}${info('Tournament ends',t.tournament_end_date)}${info('Created',dateTime(t.created_datetime))}</div></section>`;
  return renderTournamentContextShell(t,'overview',content);
}
function renderSettings(t) {
  const content=`<section class="page-heading"><div><p class="eyebrow">TOURNAMENT SETTINGS</p><h2>Configuration</h2><p>Only settings with a verified KTMS administrative mutation contract will become editable here.</p></div></section><section class="panel"><div class="section-heading"><h2>Current configuration</h2><span class="ktms-status">Read-only</span></div><div class="info-grid">${info('Tournament name',t.tournament_name)}${info('Tournament year',t.tournament_year)}${info('Registration fee',money(t.registration_fee))}${info('Minimum age',t.minimum_age)}${info('Maximum players',t.maximum_players)}${info('Start date',t.tournament_start_date)}${info('End date',t.tournament_end_date)}${info('Registration opens',dateTime(t.registration_open_datetime))}${info('Registration closes',dateTime(t.registration_close_datetime))}</div></section><div class="notice">No verified tournament-settings mutation endpoint is currently exposed by the Admin API. The frontend will not invent one.</div>`;
  return renderTournamentContextShell(t,'settings',content);
}
function renderLifecycle(t) {
  const actions=[['OPEN_REGISTRATION','Open registration'],['CLOSE_REGISTRATION','Close registration'],['SUSPEND','Suspend tournament'],['REOPEN','Reopen tournament'],['COMPLETE','Complete tournament']];
  const content=`<section class="page-heading"><div><p class="eyebrow">TOURNAMENT LIFECYCLE</p><h2>Lifecycle control</h2><p>Actions are submitted to KTMS; the frontend does not recreate lifecycle rules.</p></div></section><section class="panel"><div class="section-heading"><h2>Current status</h2><span class="ktms-status">${esc(t.tournament_status)}</span></div><div class="lifecycle-actions">${actions.map(([action,label])=>`<div class="lifecycle-row"><div><strong>${label}</strong></div><button class="button button--secondary lifecycle-action" data-action="${action}">Run</button></div>`).join('')}</div></section><section class="panel"><p class="muted">Tournament start and archival are not exposed as callable actions by the current Admin API contract, so they are not fabricated here.</p></section>`;
  setTimeout(()=>bindLifecycleActions(t),0);
  return renderTournamentContextShell(t,'lifecycle',content);
}
function bindLifecycleActions(t) {
  document.querySelectorAll('.lifecycle-action').forEach(button=>button.addEventListener('click',async()=>{
    button.disabled=true;
    try {
      if(button.dataset.action==='COMPLETE') await adminApi.request('tournament.complete',{tournamentId:t.tournament_id});
      else await adminApi.tournaments.action(t.tournament_id,button.dataset.action);
      window.location.hash=`#/tournaments/${encodeURIComponent(t.tournament_id)}/lifecycle`;
    } catch(error) {
      button.disabled=false;
      const row=button.closest('.lifecycle-row');
      row.insertAdjacentHTML('beforeend',`<span class="action-error">${esc(error.message)}</span>`);
    }
  }));
}
