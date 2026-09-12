import * as THREE from 'three';

export const COLORS = {
  cream: 0xfff3e4,
  orange: 0xf0954a,
  black: 0x2b2437,
  pink: 0xf47f8f,
  dark: 0x1b1930,
  deck: 0xff6b57,
  grip: 0x1b1930,
  hub: 0xff6b57,
  metal: 0x8f8aa8,
  asphalt: 0x0c1420,
  paint: 0x797c82,
  curb: 0x172330,
  pole: 0x15142a,
  trim: 0x1f1d36,
  building: 0x122332,
  buildingFar: 0x1a2639,
  shop: 0x17242d,
  glass: 0x16233a,
  lamp: 0xffe2bd,
  shopLight: 0xffdcb0,
  beacon: 0xff5a4a,
  cone: 0xff6b57,
  palm: 0x2c5648,
  cars: [0x1f4a5a, 0x5a1f2a, 0x2a2a3a],
  neon: [0xff6b57, 0x7ee8c7, 0xffc857, 0x6f9bff],
  fog: 0x192536, // must equal --plum in styles.css so the horizon has no seam
};

/** MeshStandardMaterial with the handful of options this scene uses */
export const mk = (color, { rough = 0.8, metal = 0, vc = false, em = null, emMap = null, ei = 1, ds = false } = {}) => {
  const o = { color, roughness: rough, metalness: metal, vertexColors: vc, side: ds ? THREE.DoubleSide : THREE.FrontSide };
  if (em !== null) Object.assign(o, { emissive: em, emissiveIntensity: ei });
  if (emMap) Object.assign(o, { emissive: 0xffffff, emissiveMap: emMap, emissiveIntensity: ei });
  return new THREE.MeshStandardMaterial(o);
};

export const SPH = (r, ws = 28, hs = 20) => new THREE.SphereGeometry(r, ws, hs);
export const CAP = (r, l, cs = 6, rs = 18) => new THREE.CapsuleGeometry(r, l, cs, rs);
export const CYL = (rt, rb, h, n = 16) => new THREE.CylinderGeometry(rt, rb, h, n);
export const CONE = (r, h, n = 10) => new THREE.ConeGeometry(r, h, n);
export const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);

/** make a mesh, place it, parent it */
export const put = (geo, mat, parent, { p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1], shadow = true, receive = false } = {}) => {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...p);
  m.rotation.set(...r);
  m.scale.set(...s);
  m.castShadow = shadow;
  m.receiveShadow = receive;
  parent.add(m);
  return m;
};

const _v = new THREE.Vector3();
const _c = new THREE.Color();
/** calico patches as vertex colours: one mesh, one material, organic edges. patches = [[center, radius, color], ...] */
export const paint = (geo, base, patches) => {
  const pos = geo.attributes.position;
  const n = pos.count;
  const col = new Float32Array(n * 3);
  const P = patches.map(([c, r, color]) => ({ c: new THREE.Vector3(...c), r, color: new THREE.Color(color) }));
  const B = new THREE.Color(base);
  for (let i = 0; i < n; i++) {
    _v.fromBufferAttribute(pos, i);
    _c.copy(B);
    for (const p of P) if (_v.distanceTo(p.c) < p.r) _c.copy(p.color);
    col[i * 3] = _c.r;
    col[i * 3 + 1] = _c.g;
    col[i * 3 + 2] = _c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
};

export const canvasTex = (w, h, draw) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const radial = (size, stops) =>
  canvasTex(size, size, (g) => {
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [o, col] of stops) grad.addColorStop(o, col);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  });

/** procedural textures: puffs, dust, lamp glow, and lit-window sheets for the buildings */
export function createTextures(rnd) {
  const asphalt = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#9198a0';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14000; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.18)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  });
  asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping;
  asphalt.repeat.set(100, 100);
  const reflection = canvasTex(128, 256, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h / 2);
    grad.addColorStop(0, 'rgba(255,255,255,.65)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 130; i++) {
      g.fillStyle = `rgba(0,0,0,${0.2 + rnd() * 0.7})`;
      g.fillRect(0, rnd() * h, w, 1 + rnd() * 3);
    }
  });
  const puffTex = radial(64, [
    [0, 'rgba(255,220,190,1)'],
    [1, 'rgba(255,220,190,0)'],
  ]);
  const softDot = radial(32, [
    [0, 'rgba(255,255,255,1)'],
    [0.5, 'rgba(255,255,255,.35)'],
    [1, 'rgba(255,255,255,0)'],
  ]);
  const glowTex = radial(64, [
    [0, 'rgba(255,214,170,.95)'],
    [0.35, 'rgba(255,190,140,.4)'],
    [1, 'rgba(255,190,140,0)'],
  ]);
  // black sheet with a grid of warm (and a few cool) squares; some floors are dark
  const windowTex = (lit) => {
    const cols = 8,
      rows = 8,
      cell = 12;
    const t = canvasTex(cols * cell, rows * cell, (g, w, h) => {
      g.fillStyle = '#000';
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < rows; y++) {
        const floorDark = rnd() < 0.22;
        for (let x = 0; x < cols; x++) {
          if (floorDark || rnd() > lit) continue;
          g.fillStyle = rnd() < 0.8 ? '#ffd8ae' : rnd() < 0.5 ? '#bcd3ff' : '#9ee8d2';
          g.globalAlpha = 0.25 + rnd() * 0.55;
          g.fillRect(x * cell + 4, y * cell + 3, 4, 5);
        }
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  const windowSheets = [windowTex(0.38), windowTex(0.26), windowTex(0.5), windowTex(0.18)];
  const sheet = (w, h) => {
    const t = rnd.pick(windowSheets).clone();
    t.repeat.set(Math.max(1, Math.round(w * 0.32)), Math.max(1, Math.round(h * 0.32)));
    t.offset.set(rnd(), rnd());
    t.needsUpdate = true;
    return t;
  };
  return { puffTex, softDot, glowTex, sheet, asphalt, reflection };
}

/** the shared material set */
export function createMaterials(C = COLORS) {
  return {
    cream: mk(C.cream, { rough: 0.85 }),
    orange: mk(C.orange),
    black: mk(C.black, { rough: 0.7 }),
    pink: mk(C.pink, { rough: 0.9 }),
    dark: mk(C.dark, { rough: 0.6 }),
    shade: mk(C.dark, { rough: 0.18 }),
    scarf: mk(0x7ee8c7, { rough: 0.75, ds: true }),
    lens: mk(0x84ddd9, { rough: 0.12, metal: 0.45, em: 0x347d89, ei: 0.25 }),
    patch: mk(0xffffff, { vc: true, rough: 0.82 }),
    tail: mk(0xffffff, { vc: true, rough: 0.82, ds: true }),
    deck: mk(C.deck, { rough: 0.45 }),
    grip: mk(C.grip, { rough: 1 }),
    wheel: mk(C.cream, { rough: 0.5 }),
    hub: mk(C.hub, { rough: 0.4 }),
    metal: mk(C.metal, { rough: 0.35, metal: 0.6 }),
    asphalt: mk(C.asphalt, { rough: 0.36, metal: 0.22 }),
    paint: mk(C.paint, { rough: 1 }),
    curb: mk(C.curb, { rough: 1 }),
    pole: mk(C.pole, { rough: 0.6 }),
    trim: mk(C.trim, { rough: 1 }),
    lamp: mk(C.lamp, { em: C.lamp, ei: 1.8 }),
    beacon: mk(C.beacon, { em: C.beacon, ei: 2 }),
    shopLight: mk(C.shopLight, { em: C.shopLight, ei: 0.55 }),
    glass: mk(C.glass, { rough: 0.1, metal: 0.4, em: 0x22395a, ei: 0.35 }),
    head: mk(0xfff1c8, { em: 0xfff1c8, ei: 1.3 }),
    tailLight: mk(0xff3b3b, { em: 0xff3b3b, ei: 1.2 }),
    cone: mk(C.cone, { rough: 0.7 }),
    palm: mk(0xffffff, { rough: 0.9, vc: true, ds: true }),
    bldg: mk(C.building, { rough: 1 }),
    manhole: mk(0x0e0d17, { rough: 0.9 }),
    bin: mk(0x232236, { rough: 0.8 }),
    neon: C.neon.map((n) => mk(n, { em: n, ei: 1.6 })),
    neonSolid: C.neon.map((n) => mk(n, { rough: 0.9 })),
  };
}
