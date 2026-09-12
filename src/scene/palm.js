import * as THREE from 'three';
import { mk, put } from './materials.js';

/** Curved trunk and feathered fronds, with each frond batched into a single mesh. */
export function buildPalm({ height, rnd, M, C }) {
  const group = new THREE.Group();
  group.name = 'street-palm';
  const lean = 0.22 + rnd() * 0.18;
  const bend = (t) => lean * t * t;
  const trunkGeo = new THREE.CylinderGeometry(0.065, 0.135, height, 10, 48);
  const trunkPos = trunkGeo.attributes.position;
  const trunkColors = new Float32Array(trunkPos.count * 3);
  const bark = new THREE.Color(0x655c4c);
  const color = new THREE.Color();
  for (let i = 0; i < trunkPos.count; i++) {
    const t = (trunkPos.getY(i) + height / 2) / height;
    trunkPos.setX(i, trunkPos.getX(i) + bend(t));
    trunkPos.setY(i, t * height);
    // Subtle growth rings follow the trunk instead of separate stacked cylinders.
    const ring = Math.round(t * 48) % 3 === 0 ? 0.65 : 0.95;
    color.copy(bark).multiplyScalar(ring * (0.8 + t * 0.2));
    color.toArray(trunkColors, i * 3);
  }
  trunkGeo.setAttribute('color', new THREE.BufferAttribute(trunkColors, 3));
  trunkGeo.computeVertexNormals();
  put(trunkGeo, mk(0xffffff, { vc: true, rough: 0.95 }), group, { shadow: false });

  const crown = new THREE.Group();
  crown.position.set(bend(1), height, 0);
  group.add(crown);
  put(new THREE.CylinderGeometry(0.055, 0.1, 0.28, 8), mk(C.palm), crown, { p: [0, -0.05, 0], shadow: false });

  const fronds = [];
  const leafColor = new THREE.Color(C.palm);
  for (let f = 0; f < 10; f++) {
    const length = 1.25 + rnd() * 0.55;
    const rise = f > 7 ? 0.82 : 0.35 + rnd() * 0.25;
    const droop = f > 7 ? 0.32 : 0.65 + rnd() * 0.4;
    const positions = [],
      colors = [];
    const spine = (t) => new THREE.Vector3(length * t, rise * Math.sin(Math.PI * t * 0.85) - droop * t * t, 0);
    const triangle = (a, b, c, shade) => {
      positions.push(...a.toArray(), ...b.toArray(), ...c.toArray());
      color.copy(leafColor).multiplyScalar(shade);
      for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b);
    };
    // A tapering central rib, visible between the individual leaflets.
    for (let s = 0; s < 18; s++) {
      const a = spine(s / 18),
        b = spine((s + 1) / 18);
      const width = 0.018 * (1 - s / 18) + 0.003;
      const al = a.clone().add(new THREE.Vector3(0, 0, -width));
      const ar = a.clone().add(new THREE.Vector3(0, 0, width));
      const bl = b.clone().add(new THREE.Vector3(0, 0, -width * 0.9));
      const br = b.clone().add(new THREE.Vector3(0, 0, width * 0.9));
      triangle(al, bl, ar, 1.3);
      triangle(ar, bl, br, 1.3);
    }
    for (let s = 0; s < 17; s++) {
      const t = 0.1 + (s / 17) * 0.86;
      for (const side of [-1, 1]) {
        const root = spine(t + (side > 0 ? 0.012 : 0));
        const reach = (0.12 + Math.sin(Math.PI * t) * 0.32) * (0.9 + rnd() * 0.2);
        const sweep = 0.1 + t * 0.14;
        const width = 0.024 + Math.sin(Math.PI * t) * 0.018;
        const mid = root.clone().add(new THREE.Vector3(sweep * 0.5, 0.03 - reach * 0.22, side * reach * 0.48));
        const tip = root.clone().add(new THREE.Vector3(sweep, -reach * 0.62, side * reach));
        const left = mid.clone().add(new THREE.Vector3(-width, -0.018, 0));
        const right = mid.clone().add(new THREE.Vector3(width, -0.018, 0));
        // The raised midrib catches moonlight; the edge folds down to a fine point.
        const shade = 0.78 + rnd() * 0.4;
        triangle(root, left, mid, shade);
        triangle(root, mid, right, shade * 1.12);
        triangle(left, tip, mid, shade);
        triangle(mid, tip, right, shade * 1.12);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const mesh = put(geometry, M.palm, crown, { shadow: false });
    mesh.rotation.y = (f / 8) * Math.PI * 2 + rnd() * 0.3;
    mesh.rotation.x = (rnd() - 0.5) * 0.16;
    fronds.push({ mesh, rest: mesh.rotation.x, phase: rnd() * Math.PI * 2 });
  }
  const phase = rnd() * Math.PI * 2;
  function update(elapsed) {
    crown.rotation.z = Math.sin(elapsed * 0.65 + phase) * 0.018;
    for (const f of fronds) f.mesh.rotation.x = f.rest + Math.sin(elapsed * 1.15 + f.phase) * 0.028;
  }
  return { group, update };
}
