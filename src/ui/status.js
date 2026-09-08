// Live/offline badges for deployed projects. A no-cors HEAD resolves for any reachable host;
// on a network error we fall back to loading the site's favicon as an image.
const probe = async (url) => {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 5000);
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: c.signal });
    clearTimeout(t);
    return 'online';
  } catch {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => res('online');
      img.onerror = () => res('offline');
      try {
        img.src = new URL('/favicon.ico', url).href + '?_=' + Date.now();
      } catch {
        res('offline');
      }
    });
  }
};

export function watchStatuses(intervalMs = 120000) {
  const els = [...document.querySelectorAll('.status[data-url]')];
  if (!els.length) return;
  const check = () =>
    els.forEach(async (el) => {
      const state = await probe(el.dataset.url);
      el.dataset.state = state;
      const text = el.querySelector('.status-text');
      if (text) text.textContent = state;
    });
  check();
  setInterval(() => {
    if (document.visibilityState === 'visible') check();
  }, intervalMs);
}
