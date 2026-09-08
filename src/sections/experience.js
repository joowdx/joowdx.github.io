import { experience } from '../data/experience.js';
import { chips } from './bits.js';

export function renderExperience(el) {
  if (!el) return;
  el.innerHTML = experience
    .map(
      (x) => `
      <article class="xp-item${x.current ? ' now-role' : ''} reveal">
        <p class="xp-period">${x.period}</p>
        <div class="xp-rail" aria-hidden="true"><i></i></div>
        <div class="xp-body">
          <h3>${x.company}</h3>
          <p class="xp-role">${x.title}</p>
          <p>${x.description}</p>
          ${chips(x.technologies)}
        </div>
      </article>`,
    )
    .join('');
}
