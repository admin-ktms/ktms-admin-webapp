import { requestOtp, verifyOtp } from '../../auth/auth.js';
import { navigate } from '../../app/router.js';

let email = '';
let stage = 'email';
let busy = false;
let message = '';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function render() {
  document.querySelector('#app').innerHTML = `
    <main class="login-page">
      <section class="login-card panel">
        <div class="login-brand">
          <span class="brand-mark">KT</span>
          <div><strong>KTMS</strong><small>ADMINISTRATOR</small></div>
        </div>
        <p class="eyebrow">SECURE ADMIN ACCESS</p>
        <h1>${stage === 'email' ? 'Administrator sign in' : 'Verify your access'}</h1>
        <p class="login-copy">
          ${stage === 'email'
            ? 'Enter your registered administrator email to receive a verification code.'
            : `A 6-digit verification code was sent to <strong>${escapeHtml(email)}</strong>.`}
        </p>
        <form id="admin-login-form">
          ${stage === 'email' ? `
            <label for="admin-email">Administrator email</label>
            <input id="admin-email" name="email" type="email" autocomplete="email" required value="${escapeHtml(email)}" placeholder="name@example.com">
            <button class="primary-button" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Sending…' : 'Send verification code'}</button>
          ` : `
            <label for="admin-otp">Verification code</label>
            <input id="admin-otp" name="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required placeholder="000000">
            <button class="primary-button" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Verifying…' : 'Verify and sign in'}</button>
            <button class="text-button" id="change-email" type="button" ${busy ? 'disabled' : ''}>Use a different email</button>
          `}
          ${message ? `<p class="form-message" role="alert">${escapeHtml(message)}</p>` : ''}
        </form>
      </section>
    </main>
  `;

  const form = document.querySelector('#admin-login-form');
  form.addEventListener('submit', handleSubmit);
  document.querySelector('#change-email')?.addEventListener('click', () => {
    stage = 'email';
    message = '';
    render();
  });
  document.querySelector('#admin-email')?.focus();
  document.querySelector('#admin-otp')?.focus();
}

async function handleSubmit(event) {
  event.preventDefault();
  if (busy) return;
  message = '';

  const form = new FormData(event.currentTarget);
  busy = true;
  render();

  try {
    if (stage === 'email') {
      email = String(form.get('email') || '').trim();
      await requestOtp(email);
      stage = 'otp';
      message = '';
    } else {
      const token = String(form.get('otp') || '').trim();
      await verifyOtp(email, token);
      navigate('/');
      return;
    }
  } catch (error) {
    message = error?.message || 'Unable to complete administrator sign in.';
  } finally {
    busy = false;
    render();
  }
}

export function renderLogin() {
  stage = 'email';
  busy = false;
  message = '';
  render();
}
