// Adds `fonts-ready` to <html> once the display fonts are usable, or after a short grace period,
// so the hero copy animates in already set in Urbanist instead of swapping mid-animation (FOUT).
const FACES = ['800 1em Urbanist', '400 1em Urbanist', '400 1em "DM Mono"'];

export function gateOnFonts(graceMs = 1500) {
  const done = () => document.documentElement.classList.add('fonts-ready');
  if (!document.fonts?.load) return done();
  const timer = setTimeout(done, graceMs);
  Promise.all(FACES.map((f) => document.fonts.load(f)))
    .catch(() => {})
    .finally(() => {
      clearTimeout(timer);
      done();
    });
}
