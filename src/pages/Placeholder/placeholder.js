import { renderShell } from '../../layout/AdminShell.js';

export async function renderPlaceholder(title) {
  await renderShell(() => `
    <h1 class="page-title">${title}</h1>
    <p class="page-subtitle">This administrative module is reserved for its verified KTMS API workflow.</p>
    <section class="surface panel">
      <p class="muted">UI implementation will be connected after the corresponding backend contract is verified.</p>
    </section>
  `, title);
}
