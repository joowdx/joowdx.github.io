import * as THREE from 'three';
import { BOX, canvasTex, COLORS, CONE, CYL, mk, put, SPH } from './materials.js';
import { buildPalm } from './palm.js';
import { batchStatic, createProps } from './props.js';
import { createStorefronts } from './storefronts.js';

/**
 * The street (in `stage`, which is rotated a little toward the camera) and the skyline (in `far`,
 * frontal). Everything on a belt scrolls along -x and wraps, so the cat rides in place forever.
 */
export function buildCity({ stage, far, M, C = COLORS, tex, rnd }) {
  const belts = [];
  const blinkers = [];
  const belt = (obj, speed, loop) => belts.push({ obj, speed, loop });
  const props = createProps(M);
  const storefronts = createStorefronts({ M, props });
  const reflectionGeo = new THREE.PlaneGeometry(1, 1);
  const reflect = (parent, color, x, z, width, length, opacity = 0.4) => {
    const m = new THREE.Mesh(
      reflectionGeo,
      new THREE.MeshBasicMaterial({
        map: tex.reflection,
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.018, z);
    m.scale.set(width, length, 1);
    parent.add(m);
    return m;
  };

  // ── the street ──
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), M.asphalt);
  const paving = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#a7afb0';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#737e81';
    g.lineWidth = 2;
    g.strokeRect(1, 1, w - 2, h - 2);
    g.beginPath();
    g.moveTo(0, h / 2);
    g.lineTo(w, h / 2);
    g.stroke();
    g.beginPath();
    g.moveTo(w / 2, 0);
    g.lineTo(w / 2, h / 2);
    g.stroke();
  });
  paving.wrapS = paving.wrapT = THREE.RepeatWrapping;
  paving.repeat.set(200, 2.35);
  M.curb.map = paving;
  M.asphalt.map = tex.asphalt;
  M.asphalt.bumpMap = tex.asphalt;
  M.asphalt.bumpScale = 0.025;
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  stage.add(ground);
  const DASH_LOOP = 42,
    dashGeo = BOX(1.3, 0.01, 0.08);
  for (let i = 0; i < 14; i++)
    belt(put(dashGeo, M.paint, stage, { p: [-DASH_LOOP / 2 + i * 3, 0.006, -1.5], shadow: false, receive: true }), 1, DASH_LOOP);
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
  {
    const cover = new THREE.Group();
    put(CYL(0.4, 0.4, 0.012, 32), M.manhole, cover, { p: [0, 0.008, 0], shadow: false });
    for (const radius of [0.3, 0.405]) {
      put(new THREE.TorusGeometry(radius, 0.009, 4, 32), M.metal, cover, { p: [0, 0.017, 0], r: [-Math.PI / 2, 0, 0], shadow: false });
    }
    for (let z = -0.24; z <= 0.24; z += 0.08) {
      put(BOX(0.49, 0.006, 0.012), M.pole, cover, { p: [0, 0.018, z], shadow: false });
    }
    batchStatic(cover);
    cover.position.set(-8, 0, 0.85);
    stage.add(cover);
    belt(cover, 1, 50);
  }
  // Curb joints and drain grates pass at street speed.
  const curbDetails = new THREE.Group();
  for (let i = 0; i < 32; i++) {
    put(BOX(0.02, 0.12, 0.06), M.pole, curbDetails, { p: [-22 + i * 1.375, 0.075, -2.595], shadow: false });
  }
  for (const x of [-12, 10]) {
    put(BOX(0.64, 0.009, 0.28), M.manhole, curbDetails, { p: [x, 0.012, -2.39], shadow: false });
    for (let i = 0; i < 8; i++) put(BOX(0.025, 0.012, 0.25), M.metal, curbDetails, { p: [x - 0.27 + i * 0.077, 0.017, -2.39], shadow: false });
  }
  batchStatic(curbDetails);
  const curbBelt = new THREE.Group();
  for (const x of [-44, 0, 44]) {
    const strip = curbDetails.clone();
    strip.position.x = x;
    curbBelt.add(strip);
  }
  stage.add(curbBelt);
  belt(curbBelt, 1, 44);

  // An alternating row of small businesses, with four distinct facade designs.
  const SHOP_LOOP = 44;
  for (let sx = -SHOP_LOOP / 2, k = 0; sx < SHOP_LOOP / 2 - 0.01; k++) {
    let w = 2.8 + rnd() * 1.4;
    if (sx + w > SHOP_LOOP / 2 - 1.6) w = SHOP_LOOP / 2 - sx;
    const h = 2.05 + (k % 3) * 0.12;
    const g = storefronts.build(w, h, k);
    reflect(g, C.neon[k % 4], -w * 0.1, 6.8, w * 1.2, 8, 0.14);
    g.position.set(sx + w / 2, 0, -7.6);
    stage.add(g);
    belt(g, 1, SHOP_LOOP);
    sx += w;
  }

  // streetlights, each with a light pool on the road
  const poolGeo = new THREE.PlaneGeometry(5, 6);
  const streetlight = () => {
    const g = new THREE.Group();
    put(CYL(0.04, 0.06, 2.8, 8), M.pole, g, { p: [0, 1.4, 0], shadow: false });
    put(CYL(0.028, 0.028, 0.8, 6), M.pole, g, { p: [0, 2.74, 0.4], r: [Math.PI / 2, 0, 0], shadow: false });
    put(BOX(0.24, 0.08, 0.42), M.pole, g, { p: [0, 2.72, 0.82], shadow: false });
    put(BOX(0.17, 0.03, 0.3), M.lamp, g, { p: [0, 2.665, 0.82], shadow: false });
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex.glowTex,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    );
    glow.position.set(0, 2.6, 0.82);
    glow.scale.setScalar(1.2);
    g.add(glow);
    const pool = new THREE.Mesh(
      poolGeo,
      new THREE.MeshBasicMaterial({ map: tex.glowTex, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, -0.14, 1.5);
    g.add(pool);
    // A soft cone gives the lamp a volume without another shadow-casting light.
    const beam = put(
      new THREE.ConeGeometry(1.1, 2.5, 24, 1, true),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'varying vec2 vUv; void main() { float a = pow(vUv.y, 3.0) * (1.0 - vUv.y) * 0.16; gl_FragColor = vec4(1.0, 0.67, 0.4, a); }',
      }),
      g,
      { p: [0, 1.36, 0.82], shadow: false },
    );
    beam.renderOrder = 1;
    return g;
  };
  const LAMP_LOOP = 44;
  for (let i = 0; i < 4; i++) {
    const l = streetlight();
    l.position.set(-LAMP_LOOP / 2 + i * 11 + 2, 0.16, -3.4);
    stage.add(l);
    belt(l, 1, LAMP_LOOP);
  }

  // Feathered coconut palms with a gentle breeze, kept behind the skater.
  const palms = [];
  for (let i = 0; i < 2; i++) {
    const palm = buildPalm({ height: 2.85 + i * 0.3, rnd, M, C });
    palm.group.position.set(-14.5 + i * 22, 0.16, -5.9);
    stage.add(palm.group);
    belt(palm.group, 1, LAMP_LOOP);
    palms.push(palm);
  }

  // A short strand of warm café lights, suspended on a sagging cable.
  const festoon = new THREE.Group();
  const cable = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-3.2, 2.63, 0), new THREE.Vector3(0, 1.95, 0), new THREE.Vector3(3.2, 2.63, 0));
  put(new THREE.TubeGeometry(cable, 24, 0.01, 4, false), M.pole, festoon, { shadow: false });
  for (let i = 0; i <= 10; i++) {
    const p = cable.getPoint(i / 10);
    put(CYL(0.01, 0.01, 0.08, 5), M.pole, festoon, { p: [p.x, p.y - 0.04, p.z], shadow: false });
    put(SPH(0.031, 8, 6), M.lamp, festoon, { p: [p.x, p.y - 0.095, p.z], shadow: false });
  }
  batchStatic(festoon);
  festoon.position.set(-3.5, 0, -6.35);
  stage.add(festoon);
  belt(festoon, 1, SHOP_LOOP);

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
    const g = props.bench();
    g.position.set(-6, 0.16, -3.85);
    stage.add(g);
    belt(g, 1, 66);
  }
  {
    const g = new THREE.Group(); // vented street bin
    put(CYL(0.19, 0.17, 0.55, 16), M.bin, g, { p: [0, 0.28, 0], shadow: false });
    put(CYL(0.215, 0.215, 0.055, 16), M.pole, g, { p: [0, 0.58, 0], shadow: false });
    put(CYL(0.13, 0.13, 0.009, 16), M.dark, g, { p: [0, 0.612, 0], shadow: false });
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      put(BOX(0.016, 0.4, 0.016), M.pole, g, { p: [Math.cos(a) * 0.185, 0.29, Math.sin(a) * 0.185], shadow: false });
    }
    batchStatic(g);
    g.position.set(12, 0.16, -3.5);
    stage.add(g);
    belt(g, 1, 52);
  }

  // Compact hatchbacks with sloped glass, shaped panels, mirrors and alloy wheels.
  for (let i = 0; i < 2; i++) {
    const c = props.car(C.cars[i], i === 0 ? 1 : -1);
    c.position.set(-16 + i * 26, 0, -2.25);
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
      put(BOX(w * 0.65 + 0.05, w * 0.2 + 0.05, 0.08), M.pole, g, { p: [0, h + 0.48, 0], shadow: false });
      put(new THREE.PlaneGeometry(w * 0.65, w * 0.2), storefronts.signs[ni], g, { p: [0, h + 0.48, 0.045], shadow: false });
      for (const x2 of [-w * 0.22, w * 0.22]) put(BOX(0.04, 0.3, 0.04), M.pole, g, { p: [x2, h + 0.15, 0], shadow: false });
    }
    if (rnd() < 0.5) put(CYL(0.22, 0.22, 0.42, 10), M.pole, g, { p: [(rnd() - 0.5) * w * 0.5, top + 0.21, (rnd() - 0.5) * d * 0.4], shadow: false });
    if (rnd() < 0.45) {
      const ax = (rnd() - 0.5) * w * 0.5;
      put(CYL(0.02, 0.02, 1.1, 5), M.pole, g, { p: [ax, top + 0.55, 0], shadow: false });
      blinkers.push({ m: put(SPH(0.05, 8, 6), M.beacon.clone(), g, { p: [ax, top + 1.1, 0], shadow: false }), phase: rnd() * 6 });
    }
    props.roof(g, w, top, d, nb);
    // Floor ledges and vertical facade pilasters give the midground real depth.
    for (let y = 0.85; y < h; y += 0.85) put(BOX(w + 0.06, 0.045, 0.12), M.trim, g, { p: [0, y, d / 2 + 0.025], shadow: false });
    for (const edge of [-1, 1]) put(BOX(0.07, h, 0.08), M.curb, g, { p: [edge * w * 0.48, h / 2, d / 2 + 0.04], shadow: false });
    batchStatic(g);
    g.position.set(x + w / 2, 0, -11.4 - rnd() * 1.2);
    far.add(g);
    belt(g, 0.5, MID_LOOP);
    x += w + 1 + rnd() * 2.6;
  }
  const FAR_LOOP = 96;
  for (let x = -FAR_LOOP / 2, i = 0; x < FAR_LOOP / 2 - 2; i++) {
    const w = 1.8 + rnd() * 3,
      h = 2.5 + rnd() * 4.7,
      d = 2.2;
    const g = new THREE.Group();
    building(w, h, d, C.buildingFar, 0.5, g);
    if (i % 3 === 0) {
      building(w * 0.68, 0.55, d * 0.78, C.buildingFar, 0.35, g).position.set(0, h + 0.275, 0);
      put(BOX(w * 0.75, 0.065, d * 0.85), M.trim, g, { p: [0, h + 0.58, 0], shadow: false });
    } else if (i % 3 === 1) {
      for (const edge of [-1, 1]) put(BOX(0.07, h + 0.16, 0.1), M.trim, g, { p: [edge * w * 0.43, h / 2, d / 2], shadow: false });
    }
    if (h > 6) {
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
    for (const palm of palms) palm.update(elapsed);
    tex.asphalt.offset.x = ((elapsed * v) / 4) % 1;
    paving.offset.x = ((elapsed * v) / 2) % 1;
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
