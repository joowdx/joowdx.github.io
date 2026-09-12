/** Keep DOM controls on the page and expensive graphics in a dedicated worker. */
export async function startScene(options) {
  const { hero, hint, trickButton, pauseButton, rideStatus } = options;
  let { canvas } = options;
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const size = () => ({ width: hero.clientWidth, height: hero.clientHeight });
  const config = () => ({ ...size(), coarse, pixelRatio: devicePixelRatio, reducedMotion: motionQuery.matches });
  let paused = motionQuery.matches;

  function receive(data) {
    if (data.type === 'controls') {
      paused = data.paused;
      const { nextTrick } = data;
      if (hint) hint.textContent = paused ? 'A little pause between sessions.' : 'Good things happen after hours.';
      if (trickButton) {
        trickButton.querySelector('span').textContent = `Try a ${nextTrick}`;
        trickButton.setAttribute('aria-label', `${paused ? 'Preview' : 'Queue'} a ${nextTrick}`);
      }
      canvas.setAttribute('aria-label', `A calico cat skating through a neon-lit street. ${paused ? 'Preview' : 'Queue'} a ${nextTrick}.`);
      if (pauseButton) {
        pauseButton.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation');
        pauseButton.setAttribute('aria-pressed', String(paused));
        pauseButton.dataset.paused = String(paused);
      }
      hero.classList.toggle('scene-paused', paused);
    } else if (data.type === 'status' && rideStatus) rideStatus.textContent = data.text;
    else if (data.type === 'air') hero.classList.toggle('in-air', data.inAir);
    else if (data.type === 'horizon') hero.style.setProperty('--horizon', data.value);
    else if (data.type === 'error') {
      console.warn('[hero] Graphics worker stopped.', data.message);
      hero.classList.add('no-3d');
      canvas.remove();
      if (rideStatus) rideStatus.textContent = 'Taking a breather';
    }
  }

  let client;
  if (typeof Worker !== 'undefined' && canvas.transferControlToOffscreen) {
    try {
      client = await startWorker(canvas, config(), receive);
    } catch (error) {
      console.warn('[hero] Using main-thread graphics fallback.', error);
      // A transferred canvas cannot acquire a main-thread context; use a fresh element.
      const replacement = canvas.cloneNode(false);
      canvas.replaceWith(replacement);
      canvas = replacement;
      options.canvas = canvas;
    }
  }
  if (!client) {
    const { createScene } = await import('./core.js');
    const engine = await createScene({ ...config(), canvas }, receive);
    client = { mode: 'main', send: (data) => engine[data.type](data), inspect: () => Promise.resolve(engine.inspect()) };
  }

  let onScreen = false;
  const visibility = () => client.send({ type: 'visibility', visible: onScreen && !document.hidden });
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    visibility();
  }).observe(hero);
  document.addEventListener('visibilitychange', visibility);
  new ResizeObserver(() => client.send({ type: 'resize', ...size() })).observe(hero);
  motionQuery.addEventListener('change', () => client.send({ type: 'motion', reducedMotion: motionQuery.matches }));
  // Preferences may have changed while the worker was starting.
  if (paused !== motionQuery.matches) client.send({ type: 'motion', reducedMotion: motionQuery.matches });

  const doTrick = () => client.send({ type: 'trick' });
  canvas.addEventListener('click', doTrick);
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      doTrick();
    }
  });
  trickButton?.addEventListener('click', doTrick);
  pauseButton?.addEventListener('click', () => client.send({ type: 'pause' }));
  if (!coarse) {
    hero.addEventListener(
      'pointermove',
      (event) => {
        if (paused || motionQuery.matches) return;
        const rect = hero.getBoundingClientRect();
        client.send({ type: 'pointer', x: (event.clientX - rect.left) / rect.width - 0.5, y: 0.5 - (event.clientY - rect.top) / rect.height });
      },
      { passive: true },
    );
    hero.addEventListener('pointerleave', () => client.send({ type: 'pointer', x: 0, y: 0 }));
  }
  canvas.classList.add('ready');
  canvas.removeAttribute('aria-busy');
  if (import.meta.env.DEV) window.__scene = { mode: client.mode, inspect: client.inspect };
  return canvas;
}

function startWorker(canvas, config, receive) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    let ready = false;
    let requestId = 0;
    const inspections = new Map();
    const fail = (error) => {
      worker.terminate();
      if (ready) receive({ type: 'error', message: error.message });
      else reject(error);
    };
    worker.onerror = (event) => {
      event.preventDefault();
      fail(new Error(event.message || 'Graphics worker failed'));
    };
    worker.onmessage = ({ data }) => {
      if (data.type === 'error') fail(new Error(data.message));
      else if (data.type === 'ready') {
        ready = true;
        resolve({
          mode: 'worker',
          send: (message) => worker.postMessage(message),
          inspect: () =>
            new Promise((done) => {
              const id = ++requestId;
              inspections.set(id, done);
              worker.postMessage({ type: 'inspect', id });
            }),
        });
      } else if (data.type === 'inspection') {
        inspections.get(data.id)?.(data.value);
        inspections.delete(data.id);
      } else receive(data);
    };
    try {
      const offscreen = canvas.transferControlToOffscreen();
      worker.postMessage({ type: 'init', config: { ...config, canvas: offscreen } }, [offscreen]);
    } catch (error) {
      fail(error);
    }
  });
}
