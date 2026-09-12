import * as THREE from 'three';
import { buildCity } from './city.js';
import { buildEffects } from './effects.js';
import { COLORS, createMaterials, createTextures } from './materials.js';
import { createRng } from './math.js';
import { buildSkater } from './skater.js';
import { pose, TRICK_NAMES, TRICKS } from './tricks.js';

/* Tweak these first. Everything else derives from them. */
export const TUNING = {
  loopSeconds: 3.2,
  jumpHeight: 1.18,
  popAngle: 0.62,
  groundSpeed: 3.6,
  autoTrickEvery: 2,
};

/** Mount the scene, suspending work when hidden, paused, or outside the viewport. */
export function startScene({ hero, canvas, hint, trickButton, pauseButton, rideStatus }) {
  if (!hero || !canvas) return;
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  let reduceMotion = motionQuery.matches;
  let paused = reduceMotion;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    console.warn('[hero] 3D scene disabled: no WebGL context.', err);
    hero.classList.add('no-3d');
    if (hint) hint.textContent = 'Taking a breather. Explore the work below.';
    if (rideStatus) rideStatus.textContent = 'Back on the board soon';
    if (trickButton) trickButton.hidden = true;
    if (pauseButton) pauseButton.hidden = true;
    canvas.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COLORS.fog, 8, 43);
  const CAM_DIST = 7.4;
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 160);
  const target = new THREE.Vector3();
  const cameraBase = new THREE.Vector3();
  const pointer = new THREE.Vector2();
  const drift = new THREE.Vector2();
  let mobile = false;

  scene.add(new THREE.HemisphereLight(0x9cbbda, 0x1f162b, 1.25));
  const key = new THREE.DirectionalLight(0xffc2a1, 2.6);
  key.position.set(-3, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(key.shadow.camera, { near: 1, far: 24, left: -4.5, right: 5.5, top: 5.5, bottom: -3 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.025;
  key.shadow.radius = 3;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x6edbdf, 2.7);
  rim.position.set(3, 3, -5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xa69df5, 0.75);
  fill.position.set(5, 2, 3);
  scene.add(fill);
  const streetBounce = new THREE.PointLight(0xff735a, 4, 7, 2);
  streetBounce.position.set(-1, 0.6, 1.5);
  scene.add(streetBounce);

  const rnd = createRng(7);
  const tex = createTextures(rnd);
  const M = createMaterials();
  const stage = new THREE.Group();
  stage.rotation.y = -0.43;
  scene.add(stage);
  const far = new THREE.Group();
  scene.add(far);
  const city = buildCity({ stage, far, M, C: COLORS, tex, rnd });
  const skater = buildSkater({ stage, M, C: COLORS, tex, rnd });
  const effects = buildEffects({ stage, tex, rnd });

  const clock = new THREE.Clock();
  let elapsed = 0,
    prevT = 0,
    loops = 0;
  let trick = null,
    queued = null,
    nextTrick = 'kickflip';
  let lastStatus = '';
  const setHint = () => {
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
  };
  function status(text) {
    if (lastStatus === text) return;
    lastStatus = text;
    if (rideStatus) rideStatus.textContent = text;
  }

  function update(dt) {
    elapsed += dt;
    const t = (elapsed / TUNING.loopSeconds) % 1;
    if (t < prevT) {
      loops++;
      trick = queued ?? (loops % TUNING.autoTrickEvery === 0 ? rnd.pick(TRICK_NAMES) : null);
      queued = null;
    }
    const def = trick ? TRICKS[trick] : null;
    if (!def?.manual && dt > 0) {
      if (prevT < 0.47 && t >= 0.47) skater.puff(-0.9, 0, 3);
      if (prevT < 0.855 && t >= 0.855) {
        skater.puff(0, 0, 5);
        effects.land();
      }
    }
    prevT = t;
    const P = pose(t, def, TUNING);
    skater.update(dt, elapsed, t, P, def, TUNING.groundSpeed);
    city.update(dt, elapsed, TUNING.groundSpeed);
    effects.update(dt, P, TUNING.groundSpeed);
    drift.lerp(pointer, 1 - Math.exp(-dt * 3));
    camera.position.copy(cameraBase);
    if (!reduceMotion && !mobile) {
      camera.position.x += drift.x * 0.2 + Math.sin(elapsed * 0.23) * 0.055;
      camera.position.y += drift.y * 0.09;
    }
    camera.lookAt(target);
    status(queued ? `${queued} up next` : paused ? 'Taking it all in' : t > 0.46 && t < 0.9 ? trick || 'Ollie' : 'Just cruising');
    hero.classList.toggle('in-air', P.inAir > 0.5);
  }

  const farPoint = new THREE.Vector3();
  function resize() {
    const w = hero.clientWidth,
      h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    mobile = w <= 820;
    camera.aspect = aspect;
    camera.fov = Math.max(mobile ? 52 : 35, (2 * Math.atan(2.2 / (CAM_DIST * aspect)) * 180) / Math.PI);
    cameraBase.set(0, mobile ? 2.4 : 2.1, CAM_DIST);
    target.set(0, mobile ? 0.1 : 1.2, 0);
    stage.position.x = mobile ? 0.12 : Math.min(1.8, aspect * 1.02);
    camera.position.copy(cameraBase);
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    farPoint.set(0, 0, -1500).project(camera);
    hero.style.setProperty('--horizon', (((1 - farPoint.y) / 2) * h).toFixed(1) + 'px');
  }

  let running = false,
    onScreen = true,
    frameId = 0;
  function render() {
    renderer.render(scene, camera);
    canvas.classList.add('ready');
  }
  function frame() {
    if (!running) return;
    update(Math.min(clock.getDelta(), 0.05));
    render();
    frameId = requestAnimationFrame(frame);
  }
  function sync() {
    const should = onScreen && !document.hidden && !paused;
    if (should === running) return;
    running = should;
    if (running) {
      clock.getDelta();
      frameId = requestAnimationFrame(frame);
    } else cancelAnimationFrame(frameId);
  }
  function still() {
    update(0);
    render();
  }
  new IntersectionObserver(
    ([e]) => {
      onScreen = e.isIntersecting;
      sync();
    },
    { threshold: 0 },
  ).observe(canvas);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(() => {
    resize();
    if (!running) still();
  }).observe(hero);
  motionQuery.addEventListener('change', (event) => {
    reduceMotion = event.matches;
    paused = reduceMotion;
    pointer.set(0, 0);
    drift.set(0, 0);
    setHint();
    sync();
    if (paused) still();
  });

  const doTrick = () => {
    const selected = nextTrick;
    if (paused) {
      trick = selected;
      queued = null;
      elapsed = TUNING.loopSeconds * (TRICKS[selected].manual ? 0.6 : 0.66);
      prevT = 0.66;
      effects.reset();
      skater.resetMotion();
      still();
      status(`${selected} · still frame`);
    } else {
      queued = selected;
      if ((elapsed / TUNING.loopSeconds) % 1 < 0.26) {
        trick = queued;
        queued = null;
      }
    }
    nextTrick = TRICK_NAMES[(TRICK_NAMES.indexOf(selected) + 1) % TRICK_NAMES.length];
    setHint();
  };
  canvas.addEventListener('click', doTrick);
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      doTrick();
    }
  });
  trickButton?.addEventListener('click', doTrick);
  pauseButton?.addEventListener('click', () => {
    paused = !paused;
    setHint();
    sync();
    if (paused) still();
  });
  if (!coarse) {
    hero.addEventListener(
      'pointermove',
      (e) => {
        if (reduceMotion || paused) return;
        const rect = hero.getBoundingClientRect();
        pointer.set((e.clientX - rect.left) / rect.width - 0.5, 0.5 - (e.clientY - rect.top) / rect.height);
      },
      { passive: true },
    );
    hero.addEventListener('pointerleave', () => pointer.set(0, 0));
  }

  resize();
  setHint();
  still();
  sync();
  if (import.meta.env.DEV) window.__scene = { renderer, scene, camera, still, TUNING };
}
