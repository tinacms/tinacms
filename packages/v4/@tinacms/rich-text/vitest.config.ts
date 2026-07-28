/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// Node, not a DOM: what is testable here without a browser is the value contract
// and the package boundary. The editor itself needs real layout and real
// beforeinput events, so its coverage lives in the host's Playwright suite
// (packages/v4/@tinacms/tinacms/e2e) rather than in a simulated DOM here.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
