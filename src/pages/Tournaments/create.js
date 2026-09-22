import { adminApi } from '../../api/adminApi.js';
import { renderModuleShell, esc } from './tournaments.js';

export function renderCreateTournament() {
  return renderModuleShell('Create Tournament', `<section class="page-heading"><div><p class="eyebrow">TOURNAMENTS</p><h1>Create tournament</h1><p>KTMS creates the tournament ID, edition, lifecycle records and matchdays.</p></div></section><form id="create-tournament-form" class="panel form-grid"><label>Tournament name<input class="ktms-input" name="tournamentName" required></label><label>Year<input class="ktms-input" name="year" type="number" min="2000" required></label><label>Start date<input class="ktms-input" name="startDate" type="date" required></label><label>End date<input class="ktms-input" name="endDate" type="date" required></label><label>Registration fee<input class="ktms-input" name="registrationFee" type="number" min="0" step="0.01" value="1000" required></label><label>Minimum age<input class="ktms-input" name="minimumAge" type="number" min="0" value="18" required></label><label>Maximum players<input class="ktms-input" name="maximumPlayers" type="number" min="1" value="100" required></label><div class="form-actions"><a class="button button--secondary" href="#/tournaments">Cancel</a><button class="button button--primary" type="submit">Create Tournament</button></div><div id="create-message" class="form-message" role="status"></div></form>`);
}
export function bindCreateTournamentForm() {
  const form = document.querySelector('#create-tournament-form');
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const message = document.querySelector('#create-message');
    const data = Object.fromEntries(new FormData(form).entries());
    data.year = Number(data.year); data.registrationFee = Number(data.registrationFee); data.minimumAge = Number(data.minimumAge); data.maximumPlayers = Number(data.maximumPlayers);
    button.disabled = true; message.textContent = 'Creating tournament…';
    try {
      const result = await adminApi.tournaments.create(data);
      const id = result?.tournamentId;
      if (!id) throw new Error('KTMS created the tournament but did not return a tournament ID.');
      window.location.hash = `#/tournaments/${encodeURIComponent(id)}`;
    } catch (error) { button.disabled = false; message.className = 'form-message form-message--error'; message.textContent = esc(error.message); }
  });
}
