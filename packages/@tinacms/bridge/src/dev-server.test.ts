// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
  BRIDGE_ROUTE,
  bridgeBundlePath,
  readBridgeBundle,
  serveBridge,
} from './dev-server';

function mockResponse() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as string | Uint8Array | undefined,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    end(body?: string | Uint8Array) {
      this.body = body;
    },
  };
}

describe('bridgeBundlePath', () => {
  it("resolves this package's built client bundle", () => {
    expect(bridgeBundlePath()).toMatch(/[\\/]bridge[\\/]dist[\\/]index\.js$/);
    expect(readBridgeBundle()).toEqual(readFileSync(bridgeBundlePath()));
  });
});

describe('serveBridge', () => {
  it('serves the bundle at the bridge route, ignoring the query', () => {
    const res = mockResponse();
    const next = vi.fn();
    serveBridge({ url: `${BRIDGE_ROUTE}?v=1` }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.headers).toEqual({
      'Content-Type': 'text/javascript',
      'Cache-Control': 'no-cache',
    });
    expect(res.body).toEqual(readBridgeBundle());
  });

  it('passes every other path through', () => {
    const res = mockResponse();
    const next = vi.fn();
    serveBridge({ url: '/admin/bridge.js.map' }, res, next);
    serveBridge({}, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.body).toBeUndefined();
  });
});
