import * as THREE from 'three';

/** Lightweight light trails and contact effects; no full-screen postprocessing. */
export function buildEffects({ stage, tex, rnd }) {
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(2.9, 1.7),
    new THREE.MeshBasicMaterial({
      map: tex.softDot,
      color: 0x02050a,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.022;
  stage.add(contact);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 1.6),
    new THREE.MeshBasicMaterial({
      map: tex.softDot,
      color: 0x61dfd2,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.026;
  stage.add(glow);

  const count = 42;
  const vertexPoint = [0, 1, 0, 0, 1, 1];
  const vertexEdge = [-1, -1, 1, 1, -1, 1];
  const trails = [-0.31, 0.31].map((z, side) => {
    const points = Array.from({ length: count }, () => ({ x: -0.62, y: 0.12, z, age: 1 }));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((count - 1) * 18), 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array((count - 1) * 18), 3).setUsage(THREE.DynamicDrawUsage));
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    mesh.frustumCulled = false;
    stage.add(mesh);
    return { points, geometry, z, color: new THREE.Color(side ? 0xff865f : 0x79eee0) };
  });
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.82, 1, 48),
    new THREE.MeshBasicMaterial({
      color: 0x8ce8df,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  stage.add(ring);
  let ringAge = 1;

  const sparks = Array.from({ length: 16 }, () => {
    const mesh = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex.softDot,
        color: 0xffc88f,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    mesh.scale.setScalar(0.065);
    mesh.visible = false;
    stage.add(mesh);
    return { mesh, vx: 0, vy: 0, vz: 0, age: 1 };
  });

  function land() {
    ringAge = 0;
    ring.position.x = 0;
    for (const spark of sparks) {
      spark.age = 0;
      spark.mesh.visible = true;
      spark.mesh.position.set((rnd() - 0.5) * 1.4, 0.1, (rnd() - 0.5) * 0.6);
      spark.vx = -0.8 - rnd() * 2;
      spark.vy = 0.7 + rnd() * 1.2;
      spark.vz = (rnd() - 0.5) * 1.6;
    }
  }

  function update(dt, P, speed) {
    contact.scale.setScalar(1 + P.height * 0.2);
    contact.material.opacity = 0.7 / (1 + P.height * 1.5);
    glow.material.opacity = 0.24 / (1 + P.height * 2);
    if (dt === 0) return;
    for (const { points, geometry, z, color } of trails) {
      const recycled = points.pop();
      for (const p of points) {
        p.x -= speed * dt;
        p.age = Math.min(1, p.age + dt / 0.48);
      }
      Object.assign(recycled, { x: -0.62, y: P.height + 0.12, z, age: 0 });
      points.unshift(recycled);
      const pos = geometry.attributes.position;
      const colors = geometry.attributes.color;
      for (let i = 0; i < count - 1; i++) {
        for (let j = 0; j < 6; j++) {
          const p = points[i + vertexPoint[j]];
          const fade = (1 - p.age) ** 2;
          pos.setXYZ(i * 6 + j, p.x, p.y + vertexEdge[j] * 0.018 * fade, p.z);
          colors.setXYZ(i * 6 + j, color.r * fade, color.g * fade, color.b * fade);
        }
      }
      pos.needsUpdate = colors.needsUpdate = true;
    }
    ringAge = Math.min(1, ringAge + dt / 0.55);
    ring.scale.set(0.5 + ringAge * 2, (0.5 + ringAge * 2) * 0.6, 1);
    ring.material.opacity = (1 - ringAge) ** 2 * 0.32;
    ring.position.x -= speed * dt * 0.5;
    for (const spark of sparks) {
      if (spark.age >= 1) continue;
      spark.age = Math.min(1, spark.age + dt / 0.6);
      spark.vy -= dt * 4;
      spark.mesh.position.x += spark.vx * dt;
      spark.mesh.position.y = Math.max(0.025, spark.mesh.position.y + spark.vy * dt);
      spark.mesh.position.z += spark.vz * dt;
      spark.mesh.material.opacity = (1 - spark.age) ** 2 * 0.85;
      spark.mesh.visible = spark.age < 1;
    }
  }
  function reset() {
    for (const { points, geometry } of trails) {
      for (const point of points) point.age = 1;
      geometry.attributes.color.array.fill(0);
      geometry.attributes.color.needsUpdate = true;
    }
    ringAge = 1;
    ring.material.opacity = 0;
    for (const spark of sparks) {
      spark.age = 1;
      spark.mesh.visible = false;
    }
  }
  return { update, land, reset };
}
