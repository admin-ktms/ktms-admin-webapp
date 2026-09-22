import { renderTournamentsOverview, renderAllTournaments } from './tournaments.js';
import { renderCreateTournament, bindCreateTournamentForm } from './create.js';
import { renderTournamentPage } from './tournament.js';

function resolveTournamentRoute(path) {
  if (path === '/tournaments') return { type: 'overview' };
  if (path === '/tournaments/all') return { type: 'all' };
  if (path === '/tournaments/create') return { type: 'create' };

  const match = path.match(/^\/tournaments\/([^/]+)(?:\/(overview|settings|lifecycle))?$/);
  if (!match) return null;

  return {
    type: 'selected',
    tournamentId: decodeURIComponent(match[1]),
    page: match[2] || 'overview',
  };
}

export async function renderTournamentsRoute(path) {
  const route = resolveTournamentRoute(path);

  if (!route) {
    return `
      <section class="error-state">
        <strong>Tournament route not found.</strong>
        <p>The requested Tournaments page does not exist.</p>
      </section>
    `;
  }

  if (route.type === 'overview') return renderTournamentsOverview();
  if (route.type === 'all') return renderAllTournaments();

  if (route.type === 'create') {
    const content = renderCreateTournament();
    setTimeout(bindCreateTournamentForm, 0);
    return content;
  }

  return renderTournamentPage(route.tournamentId, route.page);
}
