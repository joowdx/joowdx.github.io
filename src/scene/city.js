import * as THREE from 'three';
import { BOX, COLORS, CONE, CYL, mk, put, SPH } from './materials.js';

/**
 * The street (in `stage`, which is rotated a little toward the camera) and the skyline (in `far`,
 * frontal). Everything on a belt scrolls along -x and wraps, so the cat rides in place forever.
 */
export function buildCity({ stage, far, M, C = COLORS, tex, rnd }) {
  const belts = [];
  const blinkers = [];
  const belt = (obj, speed, loop) => belts.push({ obj, speed, loop });

  // ── the street ──
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), M.asphalt);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  stage.add(ground);
  const DASH_LOOP = 42,
    dashGeo = BOX(1.3, 0.01, 0.08);
  for (let i = 0; i < 14; i++) belt(put(dashGeo, M.paint, stage, { p: [-DASH_LOOP / 2 + i * 3, 0.006, -1.5], shadow: false, receive: true }), 1, DASH_LOOP);
  put(BOX(400, 0.01, 0.08), M.paint, stage, { p: [0, 0.006, 2.45], shadow: false }); // edge line
  put(BOX(400, 0.16, 4.7), M.curb, stage, { p: [0, 0.08, -4.95], shadow: false, receive: true }); // sidewalk: a wide promenade up to the shopfronts
  {
    // crosswalk: bars parallel to traffic, laid across the street
    const g = new THREE.Group(),
      bar = BOX(2.4, 0.01, 0.42);
    for (let i = 0; i < 7; i++) put(bar, M.paint, g, { p: [0, 0.007, -2.25 + i * 0.72], shadow: false, receive: true });
    g.position.x = 20;
    stage.add(g);
    belt(g, 1, 70);
  }
  belt(put(CYL(0.42, 0.42, 0.014, 20), M.manhole, stage, { p: [-8, 0.009, 0.85], shadow: false }), 1, 50);

  // storefronts: a continuous ring of lit shops behind the promenade
  const SHOP_LOOP = 44;
  for (let sx = -SHOP_LOOP / 2, k = 0; sx < SHOP_LOOP / 2 - 0.01; k++) {
    let w = 2.4 + rnd() * 1.8;
    if (sx + w > SHOP_LOOP / 2 - 1.4) w = SHOP_LOOP / 2 - sx; // last one fills the ring exactly
    const h = 1.3 + rnd() * 0.4,
      d = 2,
      ni = k % 4;
    const g = new THREE.Group();
    put(BOX(w, h, d), mk(C.shop, { rough: 1 }), g, { p: [0, h / 2, 0], shadow: false });
    put(BOX(w + 0.06, 0.07, d + 0.06), M.trim, g, { p: [0, h + 0.03, 0], shadow: false }); // parapet
    for (const px of [-w * 0.3, -w * 0.02]) put(BOX(w * 0.24, 0.5, 0.04), M.shopLight, g, { p: [px, 0.52, d / 2 + 0.02], shadow: false }); // two lit panes
    put(BOX(0.4, 0.9, 0.04), M.dark, g, { p: [w * 0.34, 0.45, d / 2 + 0.02], shadow: false }); // door
    if (k % 3 !== 2) put(BOX(w * 0.46, 0.1, 0.05), M.neon[ni], g, { p: [-w * 0.12, h - 0.2, d / 2 + 0.03], shadow: false }); // sign
    if (rnd() < 0.6) {
      // awning with a lit edge
      put(BOX(w * 0.72, 0.04, 0.5), M.trim, g, { p: [-w * 0.12, 0.95, d / 2 + 0.24], r: [0.26, 0, 0], shadow: false });
      put(BOX(w * 0.72, 0.02, 0.03), M.neon[(ni + 2) % 4], g, { p: [-w * 0.12, 0.885, d / 2 + 0.47], shadow: false });
    }
    g.position.set(sx + w / 2, 0, -7.6);
    stage.add(g);
    belt(g, 1, SHOP_LOOP);
    sx += w;
  }

  // streetlights, each with a light pool on the road
  const poolGeo = new THREE.CircleGeometry(2.1, 24);
  const streetlight = () => {
    const g = new THREE.Group();
    put(CYL(0.04, 0.06, 2.8, 8), M.pole, g, { p: [0, 1.4, 0], shadow: false });
    put(CYL(0.028, 0.028, 0.8, 6), M.pole, g, { p: [0, 2.74, 0.4], r: [Math.PI / 2, 0, 0], shadow: false });
    put(BOX(0.24, 0.08, 0.42), M.pole, g, { p: [0, 2.72, 0.82], shadow: false });
    put(BOX(0.17, 0.03, 0.3), M.lamp, g, { p: [0, 2.665, 0.82], shadow: false });
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex.glowTex, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
    );
    glow.position.set(0, 2.6, 0.82);
    glow.scale.setScalar(1.9);
    g.add(glow);
    const pool = new THREE.Mesh(
      poolGeo,
      new THREE.MeshBasicMaterial({ map: tex.glowTex, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, 0.014, 1.5);
    g.add(pool);
    return g;
  };
  const LAMP_LOOP = 44;
  for (let i = 0; i < 4; i++) {
    const l = streetlight();
    l.position.set(-LAMP_LOOP / 2 + i * 11 + 2, 0.16, -3.4);
    stage.add(l);
    belt(l, 1, LAMP_LOOP);
  }

  // two palms on the promenade: a Davao street, not a generic one
  const frondGeo = new THREE.SphereGeometry(0.5, 7, 5);
  const palm = (h) => {
    const g = new THREE.Group(),
      lean = 0.05 + rnd() * 0.08;
    put(new THREE.CylinderGeometry(0.07, 0.13, h, 7), M.palm, g, { p: [0, h / 2, 0], r: [0, 0, lean], shadow: false });
    const crown = new THREE.Group();
    crown.position.set(-Math.sin(lean) * h, Math.cos(lean) * h, 0);
    for (let i = 0; i < 7; i++) {
      const f = new THREE.Mesh(frondGeo, M.palm);
      f.scale.set(2 + rnd() * 0.5, 0.16, 0.5);
      const a = (i / 7) * Math.PI * 2 + rnd() * 0.3;
      f.position.set(Math.cos(a) * 0.85, 0.05, Math.sin(a) * 0.85);
      f.rotation.set(0, -a, -0.35 - rnd() * 0.35);
      crown.add(f);
    }
    g.add(crown);
    return g;
  };
  for (let i = 0; i < 2; i++) {
    const p = palm(3.1 + i * 0.6);
    p.position.set(-14.5 + i * 22, 0.16, -5.6);
    stage.add(p);
    belt(p, 1, LAMP_LOOP);
  }

  // sidewalk furniture
  {
    const g = new THREE.Group(); // hydrant
    put(CYL(0.09, 0.1, 0.5, 10), M.cone, g, { p: [0, 0.25, 0] });
    put(SPH(0.1, 12, 8), M.cone, g, { p: [0, 0.52, 0] });
    put(BOX(0.32, 0.07, 0.07), M.cone, g, { p: [0, 0.34, 0] });
    g.position.set(4, 0.16, -3.35);
    stage.add(g);
    belt(g, 1, 58);
  }
  {
    const g = new THREE.Group(); // bench
    put(BOX(1.3, 0.06, 0.42), M.trim, g, { p: [0, 0.46, 0] });
    put(BOX(1.3, 0.36, 0.05), M.trim, g, { p: [0, 0.68, -0.2] });
    for (const x of [-0.55, 0.55]) put(BOX(0.06, 0.46, 0.4), M.pole, g, { p: [x, 0.23, 0], shadow: false });
    g.position.set(-6, 0.16, -3.7);
    stage.add(g);
    belt(g, 1, 66);
  }
  {
    const g = new THREE.Group(); // bin
    put(CYL(0.19, 0.17, 0.55, 12), M.bin, g, { p: [0, 0.28, 0] });
    put(CYL(0.2, 0.2, 0.04, 12), M.dark, g, { p: [0, 0.57, 0], shadow: false });
    g.position.set(12, 0.16, -3.3);
    stage.add(g);
    belt(g, 1, 52);
  }

  // parked cars along the curb
  const wheelCarGeo = CYL(0.19, 0.19, 0.16, 14);
  wheelCarGeo.rotateX(Math.PI / 2);
  const car = (color, dir) => {
    const g = new THREE.Group(),
      body = mk(color, { rough: 0.3, metal: 0.3 });
    put(BOX(2.6, 0.46, 1.0), body, g, { p: [0, 0.44, 0] });
    put(BOX(1.5, 0.4, 0.92), M.glass, g, { p: [-0.12 * dir, 0.85, 0] });
    put(BOX(1.3, 0.05, 0.88), body, g, { p: [-0.12 * dir, 1.07, 0] });
    for (const wx of [-0.85, 0.85]) for (const wz of [-0.52, 0.52]) put(wheelCarGeo, M.dark, g, { p: [wx, 0.19, wz], shadow: false });
    for (const wz of [-0.32, 0.32]) {
      put(BOX(0.05, 0.1, 0.26), M.head, g, { p: [1.31 * dir, 0.5, wz], shadow: false });
      put(BOX(0.05, 0.1, 0.26), M.tailLight, g, { p: [-1.31 * dir, 0.5, wz], shadow: false });
    }
    return g;
  };
  for (let i = 0; i < 2; i++) {
    const c = car(C.cars[i], i === 0 ? 1 : -1);
    c.position.set(-16 + i * 26, 0, -2.05);
    stage.add(c);
    belt(c, 1, 52);
  }
  // traffic cones on the dashed line
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    put(BOX(0.36, 0.03, 0.36), M.dark, g, { p: [0, 0.015, 0], shadow: false });
    put(CONE(0.15, 0.44, 12), M.cone, g, { p: [0, 0.25, 0] });
    put(CYL(0.1, 0.12, 0.06, 12), M.cream, g, { p: [0, 0.28, 0] });
    g.position.set(-18 + i * 24, 0, -1.55);
    stage.add(g);
    belt(g, 1, 48);
  }

  // ── buildings: mid layer (frontal, half speed) and far skyline (slow), both fading into the fog ──
  const building = (w, h, d, color, ei, parent) => {
    const front = mk(color, { rough: 1, emMap: tex.sheet(w, h), ei }),
      side = mk(color, { rough: 1, emMap: tex.sheet(d, h), ei }),
      top = mk(color, { rough: 1 });
    const m = new THREE.Mesh(BOX(w, h, d), [side, side, top, top, front, front]);
    m.position.y = h / 2;
    parent.add(m);
    return m;
  };
  const MID_LOOP = 76;
  for (let x = -MID_LOOP / 2, nb = 0; x < MID_LOOP / 2 - 2; nb++) {
    const tower = nb % 5 === 3;
    const w = tower ? 1.8 + rnd() * 0.8 : 2.2 + rnd() * 2.2,
      h = tower ? 3.4 + rnd() * 1.4 : 1.1 + rnd() * 1.7,
      d = 2 + rnd() * 1.2;
    const g = new THREE.Group();
    building(w, h, d, C.building, 1.1, g);
    put(BOX(w + 0.08, 0.08, d + 0.08), M.trim, g, { p: [0, h + 0.04, 0], shadow: false }); // parapet
    let top = h;
    if (!tower && rnd() < 0.5) {
      // setback storey
      const w2 = w * (0.5 + rnd() * 0.3),
        h2 = 0.5 + rnd() * 0.9;
      building(w2, h2, d * 0.8, C.building, 1, g).position.set((rnd() - 0.5) * (w - w2), h + h2 / 2, 0);
      top = h + h2;
    } else if (rnd() < 0.5) {
      // rooftop billboard
      const ni = Math.floor(rnd() * 4);
      put(BOX(w * 0.6, 0.42, 0.05), M.neon[ni], g, { p: [0, h + 0.45, 0], shadow: false });
      for (const x2 of [-w * 0.22, w * 0.22]) put(BOX(0.04, 0.3, 0.04), M.pole, g, { p: [x2, h + 0.15, 0], shadow: false });
    }
    if (rnd() < 0.5) put(CYL(0.22, 0.22, 0.42, 10), M.pole, g, { p: [(rnd() - 0.5) * w * 0.5, top + 0.21, (rnd() - 0.5) * d * 0.4], shadow: false });
    if (rnd() < 0.45) {
      const ax = (rnd() - 0.5) * w * 0.5;
      put(CYL(0.02, 0.02, 1.1, 5), M.pole, g, { p: [ax, top + 0.55, 0], shadow: false });
      blinkers.push({ m: put(SPH(0.05, 8, 6), M.beacon.clone(), g, { p: [ax, top + 1.1, 0], shadow: false }), phase: rnd() * 6 });
    }
    g.position.set(x + w / 2, 0, -11.4 - rnd() * 1.2);
    far.add(g);
    belt(g, 0.5, MID_LOOP);
    x += w + 1 + rnd() * 2.6;
  }
  const FAR_LOOP = 96;
  for (let x = -FAR_LOOP / 2; x < FAR_LOOP / 2 - 2; ) {
    const w = 1.8 + rnd() * 3,
      h = 3 + rnd() * 6,
      d = 2.2;
    const g = new THREE.Group();
    building(w, h, d, C.buildingFar, 0.75, g);
    if (h > 7) {
      put(CYL(0.02, 0.02, 1.4, 5), M.pole, g, { p: [0, h + 0.7, 0], shadow: false });
      blinkers.push({ m: put(SPH(0.07, 8, 6), M.beacon.clone(), g, { p: [0, h + 1.4, 0], shadow: false }), phase: rnd() * 6 });
    }
    g.position.set(x + w / 2, 0, -18.5 - rnd() * 4);
    far.add(g);
    belt(g, 0.12, FAR_LOOP);
    x += w + 0.3 + rnd() * 1.1;
  }

  // dust motes catching the lamp light
  const DUST = 120,
    dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (rnd() - 0.5) * 14;
    dustPos[i * 3 + 1] = 0.1 + rnd() * 4;
    dustPos[i * 3 + 2] = (rnd() - 0.5) * 6;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  stage.add(
    new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        map: tex.softDot,
        color: 0xffd7b5,
        size: 0.06,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    ),
  );

  /** scroll the belts, blink the beacons, drift the dust */
  function update(dt, elapsed, v) {
    for (const b of belts) {
      b.obj.position.x -= v * b.speed * dt;
      if (b.obj.position.x < -b.loop / 2) b.obj.position.x += b.loop;
    }
    for (const b of blinkers) b.m.material.emissiveIntensity = Math.sin(elapsed * 2.4 + b.phase) > 0.55 ? 2.2 : 0.05;
    const arr = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST; i++) {
      arr[i * 3] -= v * 0.12 * dt;
      arr[i * 3 + 1] += 0.14 * dt + Math.sin(elapsed * 1.3 + i) * 0.002;
      if (arr[i * 3] < -7) arr[i * 3] += 14;
      if (arr[i * 3 + 1] > 4.2) arr[i * 3 + 1] = 0.1;
    }
    dustGeo.attributes.position.needsUpdate = true;
  }

  return { update };
}
