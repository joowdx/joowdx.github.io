import * as THREE from 'three';
import { buildCity } from './city.js';
import { COLORS, createMaterials, createTextures } from './materials.js';
import { createRng } from './math.js';
import { buildSkater } from './skater.js';
import { pose, TRICK_NAMES, TRICKS } from './tricks.js';

/* Tweak these first. Everything else derives from them. */
export const TUNING = {
  loopSeconds: 2.7, // one full ollie cycle
  jumpHeight: 1.3, // apex height of the board (board is 2 units long)
  popAngle: 0.62, // radians of nose-up at the pop (~35°)
  groundSpeed: 3.4, // how fast the street scrolls under the wheels
  autoTrickEvery: 3, // every Nth loop plays a random trick on its own
};

/**
 * Mounts the hero scene on `canvas`, sized to `hero`. Renders only while visible and only when the
 * tab is shown; honours prefers-reduced-motion with a single still frame.
 */
export function startScene({ hero, canvas, hint }) {
  if (!hero || !canvas) return;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    // no WebGL (old browser, privacy extension, GPU acceleration off): keep the hero, drop the cat, say why
    console.warn('[hero] 3D scene disabled: no WebGL context.', err);
    hero.classList.add('no-3d');
    canvas.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 2 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NoToneMapping; // keeps the fog colour identical to the CSS horizon
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COLORS.fog, 10, 62);

  // camera is fixed: no follow, no bob, no parallax (the jump reads against a still city)
  const CAM_DIST = 6.3;
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
  const target = new THREE.Vector3(0, 1.15, 0);

  // lights: warm streetlight key from upper left, cool moonlight from behind and the right
  scene.add(new THREE.HemisphereLight(0x1c1c3c, 0x08080f, 0.9));
  const key = new THREE.DirectionalLight(0xffc9a0, 2.4);
  key.position.set(-6, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
  Object.assign(key.shadow.camera, { near: 1, far: 30, left: -4.5, right: 5.5, top: 5.5, bottom: -3 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x6f7cff, 1.2);
  rim.position.set(2, 2.5, -8);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x4050a0, 0.5);
  fill.position.set(6, 3, 2);
  scene.add(fill);

  // world
  const rnd = createRng(7);
  const tex = createTextures(rnd);
  const M = createMaterials();
  const stage = new THREE.Group(); // the street, turned a little toward the camera
  stage.rotation.y = -0.3;
  scene.add(stage);
  const far = new THREE.Group(); // frontal skyline
  scene.add(far);
  const city = buildCity({ stage, far, M, C: COLORS, tex, rnd });
  const skater = buildSkater({ stage, M, C: COLORS, tex, rnd });

  // state
  const clock = new THREE.Clock();
  let elapsed = 0,
    prevT = 0,
    loops = 0;
  let trick = null,
    queued = null,
    nextTrick = 'kickflip';
  const setHint = () => {
    if (hint) hint.textContent = `tap the cat · next: ${nextTrick}`;
  };

  function update(dt) {
    elapsed += dt;
    const t = (elapsed / TUNING.loopSeconds) % 1;
    if (t < prevT) {
      // a new loop begins
      loops++;
      trick = queued ?? (loops % TUNING.autoTrickEvery === 0 ? rnd.pick(TRICK_NAMES) : null);
      queued = null;
    }
    const def = trick ? TRICKS[trick] : null;
    if (!def?.manual) {
      if (prevT < 0.47 && t >= 0.47) skater.puff(-0.9, 0, 3); // pop
      if (prevT < 0.855 && t >= 0.855) skater.puff(0, 0, 7); // landing
    }
    prevT = t;
    const P = pose(t, def, TUNING);
    skater.update(dt, elapsed, t, P, def, TUNING.groundSpeed);
    city.update(dt, elapsed, TUNING.groundSpeed);
  }

  // sizing: keep the board a constant on-screen width; report the horizon to CSS
  const farPoint = new THREE.Vector3();
  function resize() {
    const w = hero.clientWidth,
      h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    const aspect = w / h,
      mobile = aspect < 0.85;
    camera.aspect = aspect;
    camera.fov = Math.max(36, (2 * Math.atan(2.45 / (CAM_DIST * aspect)) * 180) / Math.PI);
    camera.position.set(0, mobile ? 1.95 : 1.7, CAM_DIST);
    target.set(0, mobile ? 0.35 : 1.15, 0);
    stage.position.x = mobile ? 0 : 1.15; // leave the left third to the copy on wide screens
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    farPoint.set(0, 0, -1500).project(camera);
    hero.style.setProperty('--horizon', (((1 - farPoint.y) / 2) * h).toFixed(1) + 'px');
  }

  // run loop (only while visible)
  let running = false,
    onScreen = true,
    ready = false;
  const frame = () => {
    if (!running) return;
    update(Math.min(clock.getDelta(), 0.05));
    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      canvas.classList.add('ready');
    }
    requestAnimationFrame(frame);
  };
  const sync = () => {
    const should = onScreen && !document.hidden && !reduceMotion;
    if (should && !running) {
      running = true;
      clock.getDelta();
      requestAnimationFrame(frame);
    }
    if (!should) running = false;
  };
  const still = () => {
    // one good frame near the apex, no loop
    const keep = elapsed;
    elapsed = TUNING.loopSeconds * 0.655;
    prevT = 0.6;
    for (let i = 0; i < 6; i++) update(1 / 60); // let the tail settle
    renderer.render(scene, camera);
    elapsed = reduceMotion ? elapsed : keep;
    canvas.classList.add('ready');
  };
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

  resize();
  if (reduceMotion) still();
  else sync();
  setHint();

  // interaction: tap (or Enter/Space) queues the next trick
  const doTrick = () => {
    queued = nextTrick;
    const t = (elapsed / TUNING.loopSeconds) % 1;
    if (t < 0.26) {
      trick = queued;
      queued = null;
    }
    nextTrick = TRICK_NAMES[(TRICK_NAMES.indexOf(nextTrick) + 1) % TRICK_NAMES.length];
    setHint();
  };
  canvas.addEventListener('click', doTrick);
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      doTrick();
    }
  });

  if (import.meta.env.DEV) window.__scene = { renderer, scene, camera, still, TUNING };
}
