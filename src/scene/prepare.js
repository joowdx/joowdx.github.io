import * as THREE from 'three';
import { yieldToBrowser } from './schedule.js';

/** Compile and upload in small batches while the canvas is still transparent. */
export async function prepareScene(renderer, scene, camera) {
  if (typeof document === 'undefined') {
    // Worker preparation cannot block page input; avoid redundant warm-up draws there.
    await renderer.compileAsync(scene, camera);
    return;
  }
  const objects = [];
  const lights = [];
  scene.traverse((object) => {
    if (object.material) objects.push({ object, mask: object.layers.mask, culled: object.frustumCulled });
    if (object.isLight) lights.push({ object, mask: object.layers.mask });
  });

  const cameraMask = camera.layers.mask;
  const viewport = renderer.getViewport(new THREE.Vector4());
  const batch = new THREE.Group();
  const uploadLayer = 31;
  for (const { object } of objects) object.layers.disable(uploadLayer);
  for (const { object } of lights) object.layers.enable(uploadLayer);

  try {
    camera.layers.set(uploadLayer);
    renderer.setViewport(0, 0, 1, 1);
    for (let i = 0; i < objects.length; i += 16) {
      const slice = objects.slice(i, i + 16);
      batch.clear();
      for (const { object } of slice) {
        // Clones share geometry/materials; the live hierarchy stays intact.
        batch.add(object.clone(false));
        object.layers.enable(uploadLayer);
        object.frustumCulled = false;
      }
      await renderer.compileAsync(batch, camera, scene);
      await yieldToBrowser();
      // A tiny hidden render also prepares uniforms, textures, and geometry buffers.
      renderer.render(scene, camera);
      for (const { object } of slice) object.layers.disable(uploadLayer);
      await yieldToBrowser();
    }
  } finally {
    for (const { object, mask, culled } of objects) {
      object.layers.mask = mask;
      object.frustumCulled = culled;
    }
    for (const { object, mask } of lights) object.layers.mask = mask;
    camera.layers.mask = cameraMask;
    renderer.setViewport(viewport);
  }
}
