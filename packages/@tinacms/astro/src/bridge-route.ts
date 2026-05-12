/**
 * Astro endpoint injected by the `tina()` integration. Serves the bridge
 * as a single self-contained ESM bundle at `/_tina/bridge.js`. Loaded by
 * the inline `<script type="module">` the middleware (SSR pages) or
 * `<TinaIsland>` (static pages) splices in — production visitors never
 * reach this URL.
 *
 * `@tinacms/bridge`'s build already emits a fully bundled `dist/index.js`
 * (no relative imports remain), and the bytes never vary by request, so
 * this is a prerendered route: it's emitted as a static file at build
 * time. That keeps it working on a fully static deployment (`output:
 * 'static'`), where an on-demand route would need a serverless function
 * the static host doesn't deploy.
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

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(loadBridge(), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
