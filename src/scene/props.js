import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BOX, CYL, mk, put, SPH } from './materials.js';

/** Combine fixed details by material so richer scenery stays inexpensive to draw. */
export function batchStatic(group) {
  group.updateMatrixWorld(true);
  const inverse = group.matrixWorld.clone().invert();
  const batches = new Map();
  group.traverse((mesh) => {
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    const key = `${mesh.material.uuid}/${mesh.castShadow}/${mesh.receiveShadow}`;
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(mesh);
  });
  for (const meshes of batches.values()) {
    if (meshes.length < 2) continue;
    const geometries = meshes.map((mesh) => {
      // Copy buffers directly: subclass.clone() needlessly rebuilds rounded geometry first.
      const g = mesh.geometry.index ? mesh.geometry.toNonIndexed() : new THREE.BufferGeometry().copy(mesh.geometry);
      return g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld));
    });
    const geometry = mergeGeometries(geometries);
    for (const g of geometries) g.dispose();
    if (!geometry) continue;
    const first = meshes[0];
    for (const mesh of meshes) mesh.removeFromParent();
    put(geometry, first.material, group, { shadow: first.castShadow, receive: first.receiveShadow });
  }
  // These children never move relative to this group; only their parent travels down the street.
  group.traverse((object) => {
    if (object === group) return;
    object.updateMatrix();
    object.matrixAutoUpdate = false;
  });
  return group;
}

export const rounded = (w, h, d, radius = 0.06) => new RoundedBoxGeometry(w, h, d, 2, radius);

export function createProps(M) {
  const rubber = mk(0x0a1018, { rough: 0.95 });
  const chrome = mk(0x788b98, { rough: 0.25, metal: 0.75 });
  const wood = mk(0x61463b, { rough: 0.9 });
  const terra = mk(0x715044, { rough: 0.95 });
  const leaves = mk(0x315d4d, { rough: 0.9 });

  function planter() {
    const group = new THREE.Group();
    put(CYL(0.21, 0.15, 0.3, 12), terra, group, { p: [0, 0.15, 0], shadow: false });
    put(CYL(0.225, 0.225, 0.04, 12), terra, group, { p: [0, 0.3, 0], shadow: false });
    put(CYL(0.19, 0.19, 0.012, 12), M.dark, group, { p: [0, 0.322, 0], shadow: false });
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4;
      put(SPH(1, 8, 6), leaves, group, {
        p: [Math.cos(a) * 0.13, 0.46 + (i % 3) * 0.055, Math.sin(a) * 0.13],
        s: [0.055, 0.23, 0.1],
        r: [Math.sin(a) * 0.65, -a, Math.cos(a) * 0.65],
        shadow: false,
      });
    }
    return batchStatic(group);
  }

  function bench() {
    const group = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      put(rounded(1.35, 0.045, 0.085, 0.012), wood, group, { p: [0, 0.43, -0.14 + i * 0.105], shadow: false });
    }
    for (let i = 0; i < 3; i++) {
      put(rounded(1.35, 0.075, 0.04, 0.012), wood, group, { p: [0, 0.58 + i * 0.105, -0.2 - i * 0.018], shadow: false });
    }
    for (const x of [-0.5, 0.5]) {
      for (const z of [-0.15, 0.18]) put(CYL(0.022, 0.022, 0.41, 8), M.pole, group, { p: [x, 0.205, z], shadow: false });
      put(BOX(0.035, 0.44, 0.035), M.pole, group, { p: [x, 0.58, -0.23], r: [-0.17, 0, 0], shadow: false });
      put(rounded(0.045, 0.035, 0.38, 0.015), chrome, group, { p: [x, 0.61, 0], shadow: false });
      put(BOX(0.025, 0.19, 0.025), M.pole, group, { p: [x, 0.51, 0.16], shadow: false });
    }
    return batchStatic(group);
  }

  function car(color, dir) {
    const group = new THREE.Group();
    group.name = 'parked-car';
    const body = mk(color, { rough: 0.32, metal: 0.35 });
    put(rounded(2.55, 0.44, 1.02, 0.13), body, group, { p: [0, 0.43, 0], shadow: false });
    put(rounded(2.25, 0.12, 0.97, 0.055), rubber, group, { p: [0, 0.24, 0], shadow: false });
    const cabin = new THREE.Shape();
    cabin.moveTo(-0.96, 0.61);
    cabin.lineTo(-0.7, 1.04);
    cabin.quadraticCurveTo(-0.64, 1.1, -0.5, 1.1);
    cabin.lineTo(0.36, 1.1);
    cabin.quadraticCurveTo(0.46, 1.1, 0.51, 1.02);
    cabin.lineTo(0.91, 0.61);
    cabin.closePath();
    const cabinGeo = new THREE.ExtrudeGeometry(cabin, {
      depth: 0.86,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    });
    cabinGeo.translate(0, 0, -0.43);
    put(cabinGeo, M.glass, group, { shadow: false });
    put(rounded(1.1, 0.055, 0.91, 0.02), body, group, { p: [-0.12, 1.11, 0], shadow: false });
    for (const side of [-1, 1]) {
      const z = side * 0.458;
      put(BOX(0.055, 0.47, 0.024), body, group, { p: [-0.045, 0.865, z], shadow: false });
      put(BOX(0.06, 0.5, 0.025), body, group, { p: [-0.83, 0.83, z], r: [0, 0, -0.55], shadow: false });
      put(BOX(0.055, 0.59, 0.025), body, group, { p: [0.7, 0.84, z], r: [0, 0, 0.71], shadow: false });
      put(BOX(1.78, 0.025, 0.025), chrome, group, { p: [-0.03, 0.635, z], shadow: false });
      for (const x of [-0.38, 0.43]) put(rounded(0.14, 0.025, 0.035, 0.01), chrome, group, { p: [x, 0.52, side * 0.519], shadow: false });
      put(rounded(0.13, 0.07, 0.13, 0.035), body, group, { p: [0.65, 0.71, side * 0.55], shadow: false });
      for (const x of [-0.82, 0.81]) {
        put(CYL(0.225, 0.225, 0.14, 20), rubber, group, { p: [x, 0.225, side * 0.49], r: [Math.PI / 2, 0, 0], shadow: false });
        put(CYL(0.135, 0.135, 0.012, 16), chrome, group, { p: [x, 0.225, side * 0.568], r: [Math.PI / 2, 0, 0], shadow: false });
        put(CYL(0.06, 0.06, 0.017, 10), rubber, group, { p: [x, 0.225, side * 0.578], r: [Math.PI / 2, 0, 0], shadow: false });
      }
    }
    for (const x of [-1.25, 1.25]) put(rounded(0.07, 0.07, 0.83, 0.025), chrome, group, { p: [x, 0.32, 0], shadow: false });
    for (const z of [-0.34, 0.34]) {
      put(rounded(0.04, 0.11, 0.2, 0.025), M.head, group, { p: [1.268, 0.51, z], shadow: false });
      put(rounded(0.04, 0.12, 0.2, 0.025), M.tailLight, group, { p: [-1.268, 0.51, z], shadow: false });
    }
    put(BOX(0.03, 0.08, 0.4), rubber, group, { p: [1.282, 0.42, 0], shadow: false });
    put(BOX(0.03, 0.075, 0.23), M.cream, group, { p: [-1.283, 0.4, 0], shadow: false });
    batchStatic(group);
    group.rotation.y = dir < 0 ? Math.PI : 0;
    group.scale.setScalar(0.9);
    return group;
  }

  function roof(parent, w, h, d, variant) {
    if (variant % 2 === 0) {
      // Railings and a small service enclosure break up the roof silhouette.
      put(BOX(w * 0.8, 0.025, 0.025), M.metal, parent, { p: [0, h + 0.35, d / 2], shadow: false });
      for (let x = -w * 0.4; x <= w * 0.4; x += 0.35) put(BOX(0.025, 0.32, 0.025), M.metal, parent, { p: [x, h + 0.18, d / 2], shadow: false });
      put(rounded(0.58, 0.28, 0.4, 0.035), M.curb, parent, { p: [-w * 0.2, h + 0.15, 0], shadow: false });
      for (let i = 0; i < 5; i++) put(BOX(0.4, 0.016, 0.025), M.pole, parent, { p: [-w * 0.2, h + 0.055 + i * 0.04, 0.212], shadow: false });
    }
    if (variant % 3 === 0) {
      const tank = new THREE.Group();
      for (const x of [-0.2, 0.2]) for (const z of [-0.2, 0.2]) put(BOX(0.025, 0.3, 0.025), M.pole, tank, { p: [x, 0.15, z], shadow: false });
      put(CYL(0.29, 0.29, 0.52, 16), M.bin, tank, { p: [0, 0.56, 0], shadow: false });
      for (const y of [0.36, 0.74]) put(CYL(0.3, 0.3, 0.027, 16), M.metal, tank, { p: [0, y, 0], shadow: false });
      put(new THREE.ConeGeometry(0.32, 0.13, 16), M.pole, tank, { p: [0, 0.88, 0], shadow: false });
      tank.position.set(w * 0.24, h, -0.3);
      parent.add(tank);
    }
  }
  return { planter, bench, car, roof, wood, chrome };
}
