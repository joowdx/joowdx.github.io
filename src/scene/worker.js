import { createScene } from './core.js';

let engine;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'init') {
      engine = await createScene(data.config, (message) => self.postMessage(message));
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'inspect') {
      self.postMessage({ type: 'inspection', id: data.id, value: engine.inspect() });
    } else engine?.[data.type]?.(data);
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
