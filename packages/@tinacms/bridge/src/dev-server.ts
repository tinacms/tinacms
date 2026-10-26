/**
 * Node-only helpers for adapters that serve the bridge bundle themselves:
 * the dev server answers `/admin/bridge.js` from the installed package, and
 * builds copy it next to the admin SPA.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

/** Where pages import the bridge bundle from. */
export const BRIDGE_ROUTE = '/admin/bridge.js';

/** Absolute path of the installed bridge bundle (this package's `.` export). */
export function bridgeBundlePath(): string {
  return createRequire(import.meta.url).resolve('@tinacms/bridge');
}

export function readBridgeBundle(): Uint8Array {
  return readFileSync(bridgeBundlePath());
}

interface DevServerRequest {
  url?: string;
}

interface DevServerResponse {
  statusCode: number;
  setHeader(name: string, value: string): unknown;
  end(body?: string | Uint8Array): unknown;
}

/** Connect-style middleware (Vite's `server.middlewares`) that serves `BRIDGE_ROUTE`. */
export function serveBridge(
  req: DevServerRequest,
  res: DevServerResponse,
  next: () => void
): void {
  if ((req.url ?? '').split('?')[0] !== BRIDGE_ROUTE) {
    next();
    return;
  }
  try {
    const body = readBridgeBundle();
    res.setHeader('Content-Type', 'text/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.end(body);
  } catch {
    res.statusCode = 500;
    res.end('/* @tinacms/bridge: bundle unavailable */');
  }
}
