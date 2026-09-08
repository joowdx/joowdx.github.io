import { capabilities } from '../data/capabilities.js';
import { chips } from './bits.js';

export function renderCapabilities(el) {
  if (!el) return;
  el.innerHTML = capabilities
    .map(
      (c, i) => `
      <div class="reveal" style="--i:${i}">
        <article class="cap">
          <svg viewBox="0 0 24 24" aria-hidden="true">${c.icon}</svg>
          <h3>${c.title}</h3>
          <p class="lead">${c.lead}</p>
          <p>${c.body}</p>
          ${chips(c.tags)}
        </article>
      </div>`,
    )
    .join('');
}
