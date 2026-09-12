/** The content is usable before Three.js is downloaded or the scene is built. */
export function loadSceneWhenVisible(options) {
  const { hero, canvas, trickButton, pauseButton, rideStatus } = options;
  if (!hero || !canvas) return;
  let visible = false,
    scheduled = false,
    loading = false;

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  observer.observe(hero);
  document.addEventListener('visibilitychange', schedule);

  async function load() {
    scheduled = false;
    if (loading || !visible || document.hidden) return;
    loading = true;
    observer.disconnect();
    document.removeEventListener('visibilitychange', schedule);
    canvas.setAttribute('aria-busy', 'true');
    if (rideStatus) rideStatus.textContent = 'Warming up';
    try {
      const { startScene } = await import('../scene/index.js');
      const activeCanvas = await startScene(options);
      if (activeCanvas?.isConnected) activeCanvas.tabIndex = 0;
      if (trickButton) trickButton.disabled = false;
      if (pauseButton) pauseButton.disabled = false;
    } catch (error) {
      console.warn('[hero] Could not load the skate scene.', error);
      hero.classList.add('no-3d');
      options.canvas.remove();
      if (rideStatus) rideStatus.textContent = 'Taking a breather';
      if (options.hint) options.hint.textContent = 'Explore the work below.';
    } finally {
      canvas.removeAttribute('aria-busy');
    }
  }

  function schedule() {
    if (scheduled || loading || !visible || document.hidden) return;
    scheduled = true;
    // Give the browser a paint before scheduling optional graphics work.
    requestAnimationFrame(() => {
      if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 1000 });
      else setTimeout(load, 0);
    });
  }
}
