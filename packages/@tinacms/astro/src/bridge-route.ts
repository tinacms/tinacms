/**
 * Astro endpoint injected by the `tina()` integration. Serves the bridge
 * as a single self-contained ESM bundle at `/_tina/bridge.js`. Loaded by
 * the inline `<script type="module">` the middleware splices into edit-
 * mode pages — production visitors never reach this URL.
 *
 * `@tinacms/bridge`'s build already emits a fully bundled `dist/index.js`
 * (no relative imports remain), so we stream it back as-is and let the
 * browser cache it immutably.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { APIRoute } from 'astro';

const require = createRequire(import.meta.url);
let cached: string | undefined;

function loadBridge(): string {
  if (cached !== undefined) return cached;
  const bridgePath = require.resolve('@tinacms/bridge');
  cached = readFileSync(bridgePath, 'utf-8');
  return cached;
}

export const prerender = false;

export const GET: APIRoute = () =>
  new Response(loadBridge(), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
