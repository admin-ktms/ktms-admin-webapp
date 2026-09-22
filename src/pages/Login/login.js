import { auth } from '../../auth/auth.js';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderLogin() {
  document.querySelector('#app').innerHTML = `
    <main class="auth-page">
      <section class="auth-card" aria-labelledby="login-title">
        <div class="auth-brand">KTMS ADMIN</div>
        <p class="auth-eyebrow">Administrator sign in</p>
        <h1 id="login-title">Sign in to KTMS</h1>
        <p class="auth-copy">Use your authorized administrator email. KTMS will send a verification code.</p>

        <form id="admin-login-form" class="auth-form">
          <label for="admin-email">Administrator email</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            autocomplete="email"
            required
            inputmode="email"
            placeholder="name@example.com"
          />
          <button type="submit" class="button button--primary">Send verification code</button>
        </form>

        <div id="auth-message" class="auth-message" role="status" aria-live="polite"></div>
      </section>
    </main>
  `;

  const form = document.querySelector('#admin-login-form');
  const message = document.querySelector('#auth-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = form.email.value.trim().toLowerCase();
    const button = form.querySelector('button');

    button.disabled = true;
    message.className = 'auth-message';
    message.textContent = 'Sending verification code…';

    try {
      await auth.requestOtp(email);
      renderOtp(email);
    } catch (error) {
      message.className = 'auth-message auth-message--error';
      message.textContent = error.message || 'Unable to send verification code.';
      button.disabled = false;
    }
  });
}

function renderOtp(email) {
  document.querySelector('#app').innerHTML = `
    <main class="auth-page">
      <section class="auth-card" aria-labelledby="otp-title">
        <div class="auth-brand">KTMS ADMIN</div>
        <p class="auth-eyebrow">Verification required</p>
        <h1 id="otp-title">Enter verification code</h1>
        <p class="auth-copy">A verification code was sent to <strong>${escapeHtml(email)}</strong>. It expires in 5 minutes.</p>

        <form id="admin-otp-form" class="auth-form">
          <label for="admin-otp">Verification code</label>
          <input
            id="admin-otp"
            name="token"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            pattern="[0-9]{6}"
            required
            placeholder="000000"
          />
          <button type="submit" class="button button--primary">Verify and sign in</button>
          <button type="button" id="change-email" class="button button--secondary">Use another email</button>
        </form>

        <div id="auth-message" class="auth-message" role="status" aria-live="polite"></div>
      </section>
    </main>
  `;

  document.querySelector('#change-email').addEventListener('click', renderLogin);

  const form = document.querySelector('#admin-otp-form');
  const message = document.querySelector('#auth-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = form.token.value.trim();
    const button = form.querySelector('button[type="submit"]');

    button.disabled = true;
    message.className = 'auth-message';
    message.textContent = 'Verifying…';

    try {
      await auth.verifyOtp(email, token);
      // Move back into the existing Admin App router after successful verification.
      if (window.location.hash === '#/') window.dispatchEvent(new Event('hashchange'));
      else window.location.hash = '/';
    } catch (error) {
      message.className = 'auth-message auth-message--error';
      message.textContent = error.message || 'Verification failed.';
      button.disabled = false;
    }
  });

  document.querySelector('#admin-otp').focus();
}
