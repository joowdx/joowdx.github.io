import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: path.resolve(import.meta.dirname, './src'),
  publicDir: path.resolve(import.meta.dirname, './public'),
  build: {
    outDir: path.resolve(import.meta.dirname, './dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // three is the one big dependency; keep it in its own long-cached chunk
        manualChunks: { three: ['three'] },
      },
    },
  },
});
