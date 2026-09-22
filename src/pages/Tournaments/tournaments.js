import { adminApi } from '../../api/adminApi.js';

const STATUS_ORDER = ['Registration Open','Registration Closed','Group Stage','Playoff Stage','Knockout Stage','Finals','Completed','Suspended','Archived'];

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function money(value) {
  if (value === null || value === undefined || value === '') return '—';
  return Number(value).toLocaleString();
}
export function tournamentCard(t) {
  return `<article class="tournament-card"><div class="tournament-card__top"><div><span class="eyebrow">${esc(t.tournament_id)}</span><h3>${esc(t.tournament_name)}</h3></div><span class="ktms-status">${esc(t.tournament_status)}</span></div><div class="tournament-card__meta"><span><b>Type</b>${esc(t.tournament_type_id || '—')}</span><span><b>Year</b>${esc(t.tournament_year || '—')}</span><span><b>Capacity</b>${Number(t.maximum_players || 0) || '—'}</span><span><b>Start</b>${esc(t.tournament_start_date || '—')}</span></div><a class="button button--secondary" href="#/tournaments/${encodeURIComponent(t.tournament_id)}">Open Tournament</a></article>`;
}
function featureCard(label, description) {
  return `<div class="tournament-feature is-disabled"><strong>${esc(label)}</strong><span>${esc(description)}</span><small>Available when this module is implemented</small></div>`;
}
function stats(tournaments) {
  const count = (s) => tournaments.filter(t => t.tournament_status === s).length;
  return [['Active', tournaments.filter(t => !['Completed','Archived'].includes(t.tournament_status)).length],['Registration Open',count('Registration Open')],['Upcoming / Closed',tournaments.filter(t => ['Registration Closed','Suspended'].includes(t.tournament_status)).length],['Completed',count('Completed')]];
}
export function renderModuleShell(active, content) {
  const tabs = [['Overview','/tournaments'],['All Tournaments','/tournaments/all'],['Create Tournament','/tournaments/create']];
  const nav = tabs.map(([label,href]) => `<a class="module-nav__item ${label === active ? 'is-active' : ''}" href="#${href}">${label}</a>`).join('');
  return `<div class="tournament-module"><nav class="module-nav" aria-label="Tournaments module navigation">${nav}</nav>${content}</div>`;
}
export function renderTournamentContextShell(tournament, active, content) {
  const tabs = [['Overview','overview'],['Settings','settings'],['Lifecycle','lifecycle']];
  const nav = tabs.map(([label,key]) => `<a class="module-subnav__item ${key === active ? 'is-active' : ''}" href="#/tournaments/${encodeURIComponent(tournament.tournament_id)}/${key}">${label}</a>`).join('');
  return `<div class="tournament-module"><nav class="module-nav"><a class="module-nav__item" href="#/tournaments">Overview</a><a class="module-nav__item" href="#/tournaments/all">All Tournaments</a><a class="module-nav__item" href="#/tournaments/create">Create Tournament</a></nav><header class="tournament-context"><div><span class="eyebrow">${esc(tournament.tournament_id)}</span><h1>${esc(tournament.tournament_name)}</h1></div><span class="ktms-status">${esc(tournament.tournament_status)}</span></header><nav class="module-subnav" aria-label="Selected tournament navigation">${nav}</nav>${content}</div>`;
}
export async function renderTournamentsOverview() {
  let content = '<div class="loading-block">Loading tournament data…</div>';
  try {
    const data = await adminApi.tournaments.list();
    const tournaments = Array.isArray(data) ? data : [];
    const statCards = stats(tournaments).map(([label,value]) => `<div class="stat-card"><span>${esc(label)}</span><strong>${value}</strong></div>`).join('');
    const active = tournaments.filter(t => !['Completed','Archived'].includes(t.tournament_status)).slice(0,8);
    content = `<section class="page-heading"><div><p class="eyebrow">TOURNAMENTS</p><h1>Tournament overview</h1><p>Monitor tournaments and enter a specific tournament workspace.</p></div><a class="button button--primary" href="#/tournaments/create">Create Tournament</a></section><div class="stack"><section><div class="section-heading"><h2>Overview statistics</h2><span>${tournaments.length} tournaments</span></div><div class="stat-grid">${statCards}</div></section><section><div class="section-heading"><h2>Active tournaments</h2><a href="#/tournaments/all">View all</a></div>${active.length ? `<div class="tournament-grid">${active.map(tournamentCard).join('')}</div>` : '<div class="empty-state">No active tournaments were returned.</div>'}</section><section><div class="section-heading"><h2>Tournament features</h2><span>Select a tournament first</span></div><div class="feature-grid">${featureCard('Registrations','Manage registrations for a selected tournament.')}${featureCard('Players','Open player operations in tournament context.')}${featureCard('Matchdays','Manage tournament matchdays.')}${featureCard('Fixtures','Manage fixtures for a selected tournament.')}${featureCard('Results','Manage official match results.')}${featureCard('Standings','View tournament standings.')}${featureCard('Progression','Manage tournament progression.')}${featureCard('Awards','Manage tournament awards.')}</div></section></div>`;
  } catch (error) { content = `<div class="error-state"><strong>Unable to load tournaments.</strong><p>${esc(error.message)}</p></div>`; }
  return renderModuleShell('Overview', content);
}
export async function renderAllTournaments() {
  let content = '<div class="loading-block">Loading tournaments…</div>';
  try {
    const data = await adminApi.tournaments.list();
    const tournaments = Array.isArray(data) ? data : [];
    const cards = tournaments.map(tournamentCard).join('');
    content = `<section class="page-heading"><div><p class="eyebrow">TOURNAMENTS</p><h1>All tournaments</h1><p>Find and open a tournament.</p></div><a class="button button--primary" href="#/tournaments/create">Create Tournament</a></section><div class="toolbar"><input id="tournament-search" class="ktms-input" placeholder="Search by tournament ID or name" aria-label="Search tournaments"><select id="tournament-status" class="ktms-input"><option value="">All statuses</option>${STATUS_ORDER.map(s => `<option>${esc(s)}</option>`).join('')}</select></div><div id="all-tournaments-list" class="stack"><div class="tournament-grid">${cards || '<div class="empty-state">No tournaments were returned.</div>'}</div></div>`;
  } catch (error) { content = `<div class="error-state"><strong>Unable to load tournaments.</strong><p>${esc(error.message)}</p></div>`; }
  return renderModuleShell('All Tournaments', content);
}
