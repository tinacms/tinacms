/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The field gallery tests need no Tina server, so this config skips the
// local data layer plugin that vite.config.ts loads.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: ['tina/**/*.test.{ts,tsx}'],
  },
});
