import { auth } from '../../auth/auth.js';
import { navigate } from '../../app/router.js';

export async function renderLogin() {
  document.querySelector('#app').innerHTML = `
    <main class="login-page">
      <section class="login-card surface">
        <div class="login-brand">KTMS ADMIN</div>
        <h1>Administrator sign in</h1>
        <p class="muted">Use your authorized administrator email. KTMS will send a verification code.</p>

        <form id="otp-request-form">
          <label class="field-label" for="email">Administrator email</label>
          <input class="field" id="email" type="email" autocomplete="email" required />
          <button class="button primary" id="request-button" type="submit">Send verification code</button>
        </form>

        <form id="otp-verify-form" hidden>
          <label class="field-label" for="token">Verification code</label>
          <input class="field" id="token" inputmode="numeric" autocomplete="one-time-code" required />
          <button class="button primary" id="verify-button" type="submit">Verify and enter KTMS</button>
          <button class="button secondary" id="back-button" type="button">Use another email</button>
        </form>

        <p id="login-status" class="login-status" aria-live="polite"></p>
      </section>
    </main>
  `;

  const requestForm = document.querySelector('#otp-request-form');
  const verifyForm = document.querySelector('#otp-verify-form');
  const emailInput = document.querySelector('#email');
  const tokenInput = document.querySelector('#token');
  const requestButton = document.querySelector('#request-button');
  const verifyButton = document.querySelector('#verify-button');
  const status = document.querySelector('#login-status');

  requestForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    requestButton.disabled = true;
    status.textContent = 'Sending verification code…';

    try {
      await auth.requestOtp(emailInput.value.trim());
      requestForm.hidden = true;
      verifyForm.hidden = false;
      tokenInput.focus();
      status.textContent = 'Verification code sent. Check your email.';
    } catch (error) {
      status.textContent = error.message;
    } finally {
      requestButton.disabled = false;
    }
  });

  verifyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    verifyButton.disabled = true;
    status.textContent = 'Verifying…';

    try {
      await auth.verifyOtp(emailInput.value.trim(), tokenInput.value.trim());
      navigate('/dashboard');
    } catch (error) {
      status.textContent = error.message;
      verifyButton.disabled = false;
    }
  });

  document.querySelector('#back-button').addEventListener('click', () => {
    verifyForm.hidden = true;
    requestForm.hidden = false;
    tokenInput.value = '';
    status.textContent = '';
    emailInput.focus();
  });
}
