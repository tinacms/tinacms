import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AstroIntegration } from 'astro';
import type { Plugin as VitePlugin } from 'vite';
import { describe, expect, it, vi } from 'vitest';
import tina from '../integration';

type Hooks = AstroIntegration['hooks'];
type ConfigSetupArg = Parameters<NonNullable<Hooks['astro:config:setup']>>[0];
type ConfigDoneArg = Parameters<NonNullable<Hooks['astro:config:done']>>[0];
type BuildDoneArg = Parameters<NonNullable<Hooks['astro:build:done']>>[0];

function runConfigSetup() {
  const addMiddleware = vi.fn();
  const updateConfig = vi.fn();
  const logger = { warn: vi.fn(), info: vi.fn() };
  const integration = tina();
  (integration.hooks['astro:config:setup'] as NonNullable<
    Hooks['astro:config:setup']
  >)({ addMiddleware, updateConfig, logger } as unknown as ConfigSetupArg);

  const plugins: VitePlugin[] =
    updateConfig.mock.calls[0]?.[0]?.vite?.plugins ?? [];
  return { integration, addMiddleware, updateConfig, logger, plugins };
}

// Drive a Vite plugin's `configureServer` and capture the request handler it
// registers, so we can exercise it without a real dev server.
function devHandler(plugin: VitePlugin) {
  let handler: ((req: any, res: any, next: () => void) => void) | undefined;
  const server = { middlewares: { use: (h: any) => (handler = h) } };
  (plugin.configureServer as any)(server);
  if (!handler) throw new Error('plugin registered no middleware');
  return handler;
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as Buffer | string | undefined,
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
    },
    end(chunk?: Buffer | string) {
      this.body = chunk;
    },
  };
}

describe('tina() integration — astro:config:setup', () => {
  it('wires the middleware without writing to the source tree', () => {
    const { addMiddleware, plugins } = runConfigSetup();

    expect(addMiddleware).toHaveBeenCalledWith({
      entrypoint: '@tinacms/astro/middleware',
      order: 'pre',
    });
    // A dev-only Vite plugin handles the bridge; nothing is staged on disk.
    const plugin = plugins.find((p) => p.name === '@tinacms/astro:bridge-dev');
    expect(plugin).toBeDefined();
    expect(plugin?.apply).toBe('serve');
  });
});

describe('tina() integration — bridge dev plugin', () => {
  it('serves the bridge bundle at /admin/bridge.js', () => {
    const { plugins } = runConfigSetup();
    const plugin = plugins.find((p) => p.name === '@tinacms/astro:bridge-dev')!;
    const handler = devHandler(plugin);

    const res = makeRes();
    const next = vi.fn();
    handler({ url: '/admin/bridge.js' }, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.headers['content-type']).toBe('text/javascript');
    expect((res.body as Buffer).length).toBeGreaterThan(0);
  });

  it('passes other requests through', () => {
    const { plugins } = runConfigSetup();
    const plugin = plugins.find((p) => p.name === '@tinacms/astro:bridge-dev')!;
    const handler = devHandler(plugin);

    const res = makeRes();
    const next = vi.fn();
    handler({ url: '/some/page' }, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.body).toBeUndefined();
  });
});

describe('tina() integration — astro:build:done', () => {
  it('emits bridge.js into the client output dir', () => {
    const clientDir = mkdtempSync(join(tmpdir(), 'tina-client-'));
    const { integration } = runConfigSetup();
    const logger = { warn: vi.fn(), info: vi.fn() };

    (integration.hooks['astro:config:done'] as NonNullable<
      Hooks['astro:config:done']
    >)({
      config: { build: { client: pathToFileURL(clientDir + sep) } },
    } as unknown as ConfigDoneArg);

    (integration.hooks['astro:build:done'] as NonNullable<
      Hooks['astro:build:done']
    >)({ logger } as unknown as BuildDoneArg);

    const bridgePath = join(clientDir, 'admin', 'bridge.js');
    expect(existsSync(bridgePath)).toBe(true);
    expect(readFileSync(bridgePath, 'utf-8').length).toBeGreaterThan(0);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
