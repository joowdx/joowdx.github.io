import { site } from '../data/site.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function clock() {
  const el = document.getElementById('localtime');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-PH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: site.timeZone });
  const tick = () => {
    el.textContent = fmt.format(new Date()) + ' PHT';
  };
  tick();
  setInterval(tick, 20000);
}

function stars() {
  const el = document.getElementById('stars');
  if (!el) return;
  let seed = 42;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // deterministic layout
  const frag = document.createDocumentFragment();
  const groups = new Map();
  for (let i = 0; i < 110; i++) {
    const x = (rnd() * 100).toFixed(2);
    const y = (rnd() * 100).toFixed(2);
    const duration = (2.2 + rnd() * 3.4).toFixed(2);
    const delay = (-rnd() * 5).toFixed(2);
    const size = rnd() > 0.82 ? 3 : 2;
    const key = `${size}/${i % 6}`;
    if (!groups.has(key)) groups.set(key, { size, duration, delay, positions: [] });
    groups.get(key).positions.push(`${x}vw ${y}vh var(--cream)`);
  }
  // Keep the same star field with twelve animated layers instead of 110.
  for (const { size, duration, delay, positions } of groups.values()) {
    const s = document.createElement('i');
    s.style.width = s.style.height = size + 'px';
    s.style.setProperty('--d', duration + 's');
    s.style.setProperty('--dl', delay + 's');
    s.style.boxShadow = positions.join(',');
    frag.appendChild(s);
  }
  el.appendChild(frag);
}

function scroll() {
  const root = document.documentElement;
  const nav = document.getElementById('nav');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      root.style.setProperty('--sy', String(Math.min(y, window.innerHeight)));
      nav?.classList.toggle('scrolled', y > 24);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function menu() {
  const panel = document.getElementById('menu');
  const btn = document.getElementById('menuBtn');
  if (!panel || !btn) return;
  const set = (open) => {
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => set(!panel.classList.contains('open')));
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') set(false);
  });
}

function reveal() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
}

function tilt() {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches || reduce) return;
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', ((0.5 - py) * 7).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((px - 0.5) * 9).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

export function initPage() {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
  clock();
  stars();
  scroll();
  menu();
  reveal();
  tilt();
}
