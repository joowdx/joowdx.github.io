import * as THREE from 'three';
import { BOX, canvasTex, CAP, COLORS, CONE, CYL, paint, put, SPH } from './materials.js';
import { smooth } from './math.js';
import { createTail } from './tail.js';

/** Skateboard + calico cat. `update` poses everything from a pose() result. */
export function buildSkater({ stage, M, C = COLORS, tex, rnd }) {
  // ── skateboard ──
  const rig = new THREE.Group(); // y = height above ground
  const pitchG = new THREE.Group(); // z = nose up/down
  const flipG = new THREE.Group(); // x = kickflip / heelflip, y = shove-its
  rig.add(pitchG);
  pitchG.add(flipG);
  stage.add(rig);

  const R = 0.11,
    DECK_Y = 0.24,
    DECK_T = 0.06;
  const kick = (x) => {
    const ax = Math.abs(x);
    return ax > 0.68 ? ((ax - 0.68) / 0.32) ** 2 * 0.14 : 0;
  };
  const deckGeo = (len, th, wid) => {
    const g = new THREE.BoxGeometry(len, th, wid, 56, 1, 6);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        ax = Math.abs(x);
      const w = ax > 0.7 ? Math.sqrt(Math.max(0, 1 - ((ax - 0.7) / 0.3) ** 2)) : 1; // pill ends
      pos.setZ(i, pos.getZ(i) * w);
      pos.setY(i, pos.getY(i) + kick(x));
    }
    g.computeVertexNormals();
    return g;
  };
  put(deckGeo(2, DECK_T, 0.6), M.deck, flipG, { p: [0, DECK_Y, 0] });
  put(deckGeo(1.99, 0.012, 0.595), M.cream, flipG, { p: [0, DECK_Y + 0.015, 0] });
  put(deckGeo(1.94, 0.012, 0.55), M.grip, flipG, { p: [0, DECK_Y + DECK_T / 2 + 0.006, 0] });
  const graphic = canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#ff6b57';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff3e4';
    g.font = '900 90px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('AFTER HOURS', w / 2, h / 2 + 5, w - 28);
  });
  put(new THREE.PlaneGeometry(1.3, 0.42), new THREE.MeshBasicMaterial({ map: graphic }), flipG, {
    p: [0, DECK_Y - DECK_T / 2 - 0.001, 0],
    r: [Math.PI / 2, 0, 0],
    shadow: false,
  });
  for (const tx of [-0.62, 0.62])
    for (const tz of [-0.13, 0.13]) {
      put(CYL(0.018, 0.018, 0.012, 8), M.metal, flipG, { p: [tx, DECK_Y + 0.045, tz], shadow: false });
    }
  const wheels = [];
  const wheelGeo = CYL(R, R, 0.08, 22);
  wheelGeo.rotateX(Math.PI / 2);
  const hubGeo = CYL(0.05, 0.05, 0.09, 12);
  hubGeo.rotateX(Math.PI / 2);
  for (const tx of [-0.62, 0.62]) {
    put(BOX(0.16, 0.02, 0.22), M.metal, flipG, { p: [tx, DECK_Y - DECK_T / 2 - 0.01, 0] });
    put(BOX(0.1, 0.06, 0.42), M.metal, flipG, { p: [tx, 0.155, 0] });
    put(CYL(0.018, 0.018, 0.66, 8), M.metal, flipG, { p: [tx, R, 0], r: [Math.PI / 2, 0, 0] });
    for (const tz of [-0.31, 0.31]) {
      const w = new THREE.Group();
      w.position.set(tx, R, tz);
      put(wheelGeo, M.wheel, w);
      put(hubGeo, M.hub, w);
      flipG.add(w);
      wheels.push(w);
    }
  }
  const DECK_TOP = DECK_Y + DECK_T / 2 + 0.012;

  // ── cat (calico: cream base, orange + black patches) ──
  const cat = new THREE.Group();
  rig.add(cat);
  const torso = new THREE.Group();
  cat.add(torso);
  const LEG_LEN = 0.44,
    BODY_R = 0.25,
    BODY_BASE = DECK_TOP + LEG_LEN + 0.1;

  const bodyGeo = CAP(BODY_R, 0.58, 8, 26);
  bodyGeo.rotateZ(Math.PI / 2); // lies along x, nose = +x
  paint(bodyGeo, C.cream, [
    [[-0.26, 0.2, 0.06], 0.31, C.orange],
    [[0.16, 0.14, -0.2], 0.21, C.black],
    [[0.0, -0.02, 0.25], 0.18, C.orange],
    [[-0.45, 0.06, -0.1], 0.14, C.black],
  ]);
  put(bodyGeo, M.patch, torso, { p: [-0.02, 0, 0] });

  const head = new THREE.Group();
  head.position.set(0.56, 0.24, 0);
  torso.add(head);
  const headGeo = SPH(0.27, 32, 22);
  paint(headGeo, C.cream, [
    [[0.06, 0.16, -0.18], 0.2, C.orange],
    [[-0.06, 0.18, 0.16], 0.16, C.black],
  ]);
  put(headGeo, M.patch, head, { s: [1.04, 0.96, 1.04] });
  put(SPH(0.13, 16, 12), M.cream, head, { p: [0.21, -0.08, 0], s: [1, 0.8, 1.15] });
  put(SPH(0.034, 10, 8), M.pink, head, { p: [0.33, -0.04, 0] });
  const ears = [];
  for (const side of [-1, 1]) {
    const e = new THREE.Group();
    e.position.set(-0.02, 0.24, side * 0.16);
    e.rotation.set(-side * 0.38, 0, -0.12);
    head.add(e);
    ears.push(e);
    put(CONE(0.09, 0.22, 10), side < 0 ? M.orange : M.black, e, { p: [0, 0.09, 0] }); // right ear orange, left ear black
    put(CONE(0.05, 0.13, 8), M.pink, e, { p: [0.02, 0.085, 0] });
  }
  const whiskGeo = CYL(0.006, 0.004, 0.34, 5);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      put(whiskGeo, M.cream, head, {
        p: [0.22, -0.05 + (i - 1) * 0.035, side * 0.28],
        r: [Math.PI / 2 + (i - 1) * 0.18, side * (Math.PI / 2 - 0.6), 0],
        shadow: false,
      });
    }
  }
  // sunglasses + cap, like the photo
  const shades = new THREE.Group();
  head.add(shades);
  for (const side of [-1, 1]) {
    put(BOX(0.05, 0.1, 0.14), M.shade, shades, { p: [0.25, 0.04, side * 0.11], r: [0, -side * 0.42, 0] });
    put(BOX(0.006, 0.018, 0.11), M.lens, shades, { p: [0.279, 0.061, side * 0.11], r: [0, -side * 0.42, 0], shadow: false });
    put(BOX(0.02, 0.02, 0.3), M.shade, shades, { p: [0.05, 0.06, side * 0.27], r: [0, side * 0.06, 0], shadow: false });
  }
  put(BOX(0.02, 0.02, 0.07), M.shade, shades, { p: [0.28, 0.06, 0], shadow: false });
  const cap = new THREE.Group();
  cap.position.set(-0.02, 0.06, 0);
  cap.rotation.z = 0.22;
  head.add(cap);
  put(new THREE.SphereGeometry(0.285, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.46), M.dark, cap);
  put(BOX(0.28, 0.025, 0.32), M.dark, cap, { p: [0.25, 0.05, 0] });
  put(SPH(0.032, 8, 6), M.hub, cap, { p: [0, 0.28, 0] });
  put(BOX(0.026, 0.09, 0.025), M.cream, cap, { p: [0.258, 0.15, 0.06], r: [0, 0, -0.3], shadow: false });
  put(BOX(0.026, 0.025, 0.08), M.cream, cap, { p: [0.258, 0.15, 0.06], r: [0, 0, -0.3], shadow: false });

  // A mint bandana and a loose end that catches the slipstream.
  put(CYL(0.2, 0.22, 0.12, 20), M.scarf, torso, { p: [0.4, 0.07, 0], r: [0, 0, Math.PI / 2] });
  const scarfGeo = new THREE.PlaneGeometry(0.66, 0.19, 12, 1);
  put(scarfGeo, M.scarf, torso, { p: [0.1, 0.08, 0.24], shadow: false });
  const scarfBase = Float32Array.from(scarfGeo.attributes.position.array);

  // legs: limb scales from the paw upward; paws stay glued to the deck (tiny IK in update)
  const legs = [];
  const limbGeo = CAP(0.07, LEG_LEN - 0.14, 4, 10);
  limbGeo.translate(0, LEG_LEN / 2, 0);
  const pawGeo = SPH(0.09, 14, 10);
  for (const [lx, lz, mat] of [
    [0.4, -0.14, M.cream],
    [0.4, 0.14, M.cream],
    [-0.48, -0.14, M.cream],
    [-0.48, 0.14, M.orange],
  ]) {
    const g = new THREE.Group();
    cat.add(g);
    const limb = put(limbGeo, mat, g);
    put(pawGeo, M.cream, g, { p: [0, 0.065, 0], s: [1.1, 0.8, 1.1] });
    legs.push({ g, limb, lx, lz });
  }

  const tail = createTail({ torso, M, C });

  // landing puffs (sprite pool)
  const puffs = [];
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.puffTex, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    s.visible = false;
    s.userData.age = 1;
    stage.add(s);
    puffs.push(s);
  }
  const puff = (x, z, n = 5) => {
    let k = 0;
    for (const s of puffs) {
      if (s.userData.age < 1 || k >= n) continue;
      s.visible = true;
      s.userData.age = 0;
      s.position.set(x + (rnd() - 0.5) * 0.8, 0.05, z + (rnd() - 0.5) * 0.5);
      s.userData.vx = (rnd() - 0.5) * 1.4;
      s.userData.vy = 0.6 + rnd() * 0.6;
      k++;
    }
  };

  let spin = 0;
  const torsoPos = new THREE.Vector3();

  /** pose board and cat for this frame. t = loop phase, P = pose(), def = active trick, v = ground speed */
  function update(dt, elapsed, t, P, def, v) {
    rig.position.y = P.height;
    cat.position.y = def?.flipX || def?.spinY ? P.tuck * 0.18 : 0;
    pitchG.rotation.z = P.pitch;
    const fe = smooth((t - 0.5) / 0.34);
    flipG.rotation.x = def?.flipX ? def.flipX * Math.PI * 2 * fe : 0;
    flipG.rotation.y = def?.spinY ? def.spinY * Math.PI * 2 * fe : 0;
    spin -= ((v * (1 - 0.6 * P.inAir)) / R) * dt;
    for (const w of wheels) w.rotation.z = spin;

    const squat = Math.max(P.crouch, P.absorb * 0.85, P.tuck * 0.55);
    const lean = P.manual ? P.pitch * 0.9 : P.pitch * 0.55 - P.crouch * 0.1 + P.tuck * 0.06;
    const bodyY = BODY_BASE - 0.3 * squat;
    torso.position.set(-0.12 * P.manual, bodyY, 0);
    torso.rotation.z = lean;
    const cp = Math.cos(P.pitch),
      sp = Math.sin(P.pitch),
      cl = Math.cos(lean),
      sl = Math.sin(lean);
    for (const { g, limb, lx, lz } of legs) {
      const pawX = lx * cp - DECK_TOP * sp,
        pawY = DECK_TOP * cp + lx * sp; // point on the tilted deck
      const hx = lx - 0.12 * P.manual;
      const ax = hx * cl + 0.1 * sl,
        ay = bodyY + hx * sl - 0.1 * cl; // hip socket on the leaning torso
      const dx = ax - pawX,
        dy = ay - pawY,
        len = Math.max(0.14, Math.hypot(dx, dy));
      g.position.set(pawX, pawY, lz);
      g.rotation.z = Math.atan2(-dx, dy);
      limb.scale.y = len / LEG_LEN;
    }
    for (const e of ears) e.rotation.z = -0.12 - P.inAir * 0.3;
    head.rotation.y = -0.12 + Math.sin(elapsed * 0.65) * 0.1;
    head.rotation.z = -P.crouch * 0.1 + P.tuck * 0.12;
    const cloth = scarfGeo.attributes.position;
    for (let i = 0; i < cloth.count; i++) {
      const x = scarfBase[i * 3];
      const loose = (0.33 - x) / 0.66;
      cloth.setY(i, scarfBase[i * 3 + 1] * (1 - loose * 0.75) + Math.sin(elapsed * 12 + loose * 6) * loose * 0.055 + P.inAir * loose * 0.11);
      cloth.setZ(i, Math.sin(elapsed * 9 + loose * 5) * loose * 0.045);
    }
    cloth.needsUpdate = true;
    scarfGeo.computeVertexNormals();
    torsoPos.set(torso.position.x, torso.position.y + P.height + cat.position.y, 0); // rig space includes the jump
    tail.update(dt, elapsed, torsoPos, lean, squat, P.inAir, P.manual);

    for (const s of puffs) {
      if (s.userData.age >= 1) continue;
      s.userData.age = Math.min(1, s.userData.age + dt / 0.7);
      const k = s.userData.age;
      s.position.x += (s.userData.vx - v * 0.5) * dt;
      s.position.y += s.userData.vy * dt * (1 - k);
      s.scale.setScalar(0.25 + k * 0.9);
      s.material.opacity = 0.55 * (1 - k) * (1 - k);
      if (k >= 1) s.visible = false;
    }
  }

  return { update, puff, resetMotion: tail.reset };
}
