// Small shared markup helpers for the data-driven sections.
export const icon = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#${id}"/></svg>`;

export const chips = (tags) => `<ul class="tags">${tags.map((t) => `<li class="chip">${t}</li>`).join('')}</ul>`;

export const external = (href, label, cls) =>
  `<a class="btn ${cls}" href="${href}" target="_blank" rel="noopener noreferrer">${label} ${icon('i-out')}</a>`;
