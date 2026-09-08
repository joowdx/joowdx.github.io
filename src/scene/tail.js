import * as THREE from 'three';
import { COLORS, put, SPH } from './materials.js';

/**
 * The tail is a simulated chain (springs toward a rest curve, with inertia and damping, so it lags and
 * whips with the body) skinned every frame as one tapered tube. Simulation runs in rig space so the
 * jump moves it; the mesh lives in torso space, so points are transformed back before skinning.
 */
export function createTail({ torso, M, C = COLORS }) {
  const TN = 18, // rings along the tail
    TR = 10, // vertices per ring
    SEG = 0.062, // distance between rings
    ROOT_R = 0.086;
  const ROOT = new THREE.Vector3(-0.46, 0.04, 0);

  // geometry: fixed indices, positions rewritten each frame
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array((TN * TR + 1) * 3);
  const col = new Float32Array((TN * TR + 1) * 3);
  const idx = [];
  for (let i = 0; i < TN - 1; i++) {
    for (let j = 0; j < TR; j++) {
      const a = i * TR + j,
        b = i * TR + ((j + 1) % TR),
        c = (i + 1) * TR + j,
        d = (i + 1) * TR + ((j + 1) % TR);
      idx.push(a, c, b, b, c, d);
    }
  }
  const tipV = TN * TR;
  for (let j = 0; j < TR; j++) idx.push((TN - 1) * TR + j, tipV, (TN - 1) * TR + ((j + 1) % TR));
  const ringColor = (i) => new THREE.Color(i < 7 ? C.orange : i < 10 ? C.black : i < 15 ? C.orange : C.cream);
  for (let i = 0; i <= TN; i++) {
    const c = ringColor(Math.min(i, TN - 1));
    for (let j = 0; j < (i === TN ? 1 : TR); j++) {
      const k = (i * TR + j) * 3;
      col[k] = c.r;
      col[k + 1] = c.g;
      col[k + 2] = c.b;
    }
  }
  geo.setIndex(idx);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mesh = put(geo, M.tail, torso);
  mesh.frustumCulled = false;
  put(SPH(ROOT_R, 16, 12), M.orange, torso, { p: ROOT.toArray() }); // root cap: no open ring where it meets the body

  // simulation state
  const P = Array.from({ length: TN }, () => new THREE.Vector3());
  const V = Array.from({ length: TN }, () => new THREE.Vector3());
  const R = Array.from({ length: TN }, () => new THREE.Vector3());
  let ready = false;
  const tmp = new THREE.Vector3(),
    T = new THREE.Vector3(),
    N = new THREE.Vector3(),
    B = new THREE.Vector3(),
    P0 = new THREE.Vector3(),
    P1 = new THREE.Vector3(),
    Pi = new THREE.Vector3();
  const toRig = (v, torsoPos, lean) => {
    const c = Math.cos(lean),
      s = Math.sin(lean);
    return v.set(v.x * c - v.y * s + torsoPos.x, v.x * s + v.y * c + torsoPos.y, v.z + torsoPos.z);
  };

  function update(dt, t, torsoPos, lean, squat, inAir, manual) {
    // rest pose (torso-local): mostly straight back, a gentle S, hooking up toward the tip; raised in the air
    let a = Math.PI * 0.88 + 0.1 * Math.sin(t * 1.4) - squat * 0.3 + inAir * 0.5 + manual * 0.4;
    let px = ROOT.x,
      py = ROOT.y;
    for (let i = 0; i < TN; i++) {
      R[i].set(px, py, 0.05 * (i / TN) * Math.sin(t * 1.1 + i * 0.3));
      toRig(R[i], torsoPos, lean);
      a += (i < 6 ? -0.015 : 0.075) + 0.03 * Math.sin(t * 2.1 - i * 0.45);
      px += Math.cos(a) * SEG;
      py += Math.sin(a) * SEG;
    }
    if (!ready) {
      for (let i = 0; i < TN; i++) {
        P[i].copy(R[i]);
        V[i].set(0, 0, 0);
      }
      ready = true;
    }
    P[0].copy(R[0]);
    const steps = 2,
      h = Math.min(dt, 1 / 30) / steps;
    for (let s = 0; s < steps; s++) {
      for (let i = 1; i < TN; i++) {
        const u = i / (TN - 1),
          k = 70 * (1 - u) + 14; // stiff near the root, loose at the tip
        tmp.subVectors(R[i], P[i]).multiplyScalar(k * h);
        V[i].add(tmp);
        V[i].y -= 3.2 * u * h; // the tip droops a little
        V[i].multiplyScalar(Math.exp(-6 * h));
        P[i].addScaledVector(V[i], h);
      }
      for (let it = 0; it < 2; it++) {
        for (let i = 1; i < TN; i++) {
          tmp.subVectors(P[i], P[i - 1]);
          const L = tmp.length() || 1e-6;
          P[i].copy(P[i - 1]).addScaledVector(tmp, SEG / L); // keep segment lengths
        }
      }
    }
    // skin: back to torso-local, rings via parallel-transport frames
    const c = Math.cos(-lean),
      sn = Math.sin(-lean);
    const loc = (i, out) => {
      const x = P[i].x - torsoPos.x,
        y = P[i].y - torsoPos.y;
      return out.set(x * c - y * sn, x * sn + y * c, P[i].z - torsoPos.z);
    };
    N.set(0, 0, 1);
    for (let i = 0; i < TN; i++) {
      loc(Math.max(0, i - 1), P0);
      loc(Math.min(TN - 1, i + 1), P1);
      loc(i, Pi);
      T.subVectors(P1, P0).normalize();
      N.addScaledVector(T, -N.dot(T)).normalize();
      B.crossVectors(T, N);
      const u = i / (TN - 1),
        r = ROOT_R * (1 - u * 0.8) + 0.01;
      for (let j = 0; j < TR; j++) {
        const th = (j / TR) * Math.PI * 2,
          cx = Math.cos(th) * r,
          sx = Math.sin(th) * r,
          k = (i * TR + j) * 3;
        pos[k] = Pi.x + N.x * cx + B.x * sx;
        pos[k + 1] = Pi.y + N.y * cx + B.y * sx;
        pos[k + 2] = Pi.z + N.z * cx + B.z * sx;
      }
    }
    const k = tipV * 3;
    pos[k] = Pi.x + T.x * 0.045;
    pos[k + 1] = Pi.y + T.y * 0.045;
    pos[k + 2] = Pi.z + T.z * 0.045;
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  }

  return { update };
}
