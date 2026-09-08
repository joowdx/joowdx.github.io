import { projects } from '../data/projects.js';
import { chips, external, icon } from './bits.js';

const host = (url) => new URL(url).hostname;
const repoPath = (url) => new URL(url).pathname.replace(/^\//, '').replace('/', ' / ');

const media = (p) =>
  p.image
    ? `<img class="shot" src="${p.image.src}" alt="${p.image.alt}" width="${p.image.width}" height="${p.image.height}" loading="lazy">`
    : `<div class="repo-plate">${icon('i-github')}<p class="path">${repoPath(p.source)}</p><p class="kind">${p.kind ?? 'project'}</p></div>`;

const actions = (p) => {
  const parts = [];
  if (p.url) {
    parts.push(`
      <span class="status" data-state="checking" data-url="${p.url}">
        <a class="btn btn-primary btn-sm" href="${p.url}" target="_blank" rel="noopener noreferrer"><span class="live-label"></span>${icon('i-out')}</a>
        <i aria-hidden="true"></i><span class="status-text">checking</span>
      </span>`);
  }
  if (p.source) parts.push(external(p.source, 'Source', 'btn-ghost btn-sm'));
  return parts.join('');
};

export function renderProjects(el) {
  if (!el) return;
  el.innerHTML = projects
    .map(
      (p, i) => `
      <div class="reveal" style="--i:${i}">
        <article class="card tilt">
          <div class="card-media">${media(p)}</div>
          <div class="card-body">
            <div class="card-top"><h3>${p.title}</h3><span class="card-meta">${p.url ? host(p.url) : p.year ?? ''}</span></div>
            <p>${p.description}</p>
            ${chips(p.technologies)}
            <div class="card-actions">${actions(p)}</div>
          </div>
        </article>
      </div>`,
    )
    .join('');
}
