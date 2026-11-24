import { defineConfig } from 'vite';
import { tinaLocalDataLayerVitePlugin } from '../local-data-layer.vite';

export default defineConfig({
  plugins: [tinaLocalDataLayerVitePlugin({ rootDir: '.', collections: [] })],
});
