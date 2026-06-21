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

function runConfigSetup(options?: Parameters<typeof tina>[0]) {
  const addMiddleware = vi.fn();
  const updateConfig = vi.fn();
  const logger = { warn: vi.fn(), info: vi.fn() };
  const integration = tina(options);
  (
    integration.hooks['astro:config:setup'] as NonNullable<
      Hooks['astro:config:setup']
    >
  )({ addMiddleware, updateConfig, logger } as unknown as ConfigSetupArg);

  const plugins: VitePlugin[] =
    updateConfig.mock.calls[0]?.[0]?.vite?.plugins ?? [];
  return { integration, addMiddleware, updateConfig, logger, plugins };
}

// Drive the astro:config:done hook with a chosen adapter so the integration can
// resolve whether the Cloudflare workaround should apply.
function runConfigDone(integration: AstroIntegration, adapterName?: string) {
  (
    integration.hooks['astro:config:done'] as NonNullable<
      Hooks['astro:config:done']
    >
  )({
    config: {
      build: { client: pathToFileURL('/tmp/tina-client/') },
      adapter: adapterName ? { name: adapterName, hooks: {} } : undefined,
    },
  } as unknown as ConfigDoneArg);
}

const cfPlugin = (plugins: VitePlugin[]) =>
  plugins.find(
    (p) => p.name === '@tinacms/astro:cloudflare-import-meta-url'
  ) as VitePlugin;

// Invoke a plugin's `configEnvironment` hook (a function in our plugin) without
// a real Vite environment — it only branches on the environment name.
function runConfigEnvironment(plugin: VitePlugin, name: string) {
  const hook = plugin.configEnvironment as any;
  const fn = typeof hook === 'function' ? hook : hook?.handler;
  return fn?.call({}, name, {}, {});
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

// A minimal dev server exposing the Vite environment hot channels and a file
// watcher, so we can drive the content-invalidation plugin and capture both the
// HMR signals it sends and the watcher handlers it registers.
function makeDevServer(opts: { environments?: boolean } = {}) {
  const ssrSend = vi.fn();
  const clientSend = vi.fn();
  const handlers: Record<string, (file: string) => void> = {};
  const watcher = {
    on(event: string, cb: (file: string) => void) {
      handlers[event] = cb;
      return watcher;
    },
  };
  const server: Record<string, unknown> = { watcher };
  if (opts.environments !== false) {
    server.environments = {
      ssr: { hot: { send: ssrSend } },
      client: { hot: { send: clientSend } },
    };
  }
  return { server, ssrSend, clientSend, handlers };
}

const invalidationPlugin = (plugins: VitePlugin[]) =>
  plugins.find(
    (p) => p.name === '@tinacms/astro:dev-content-invalidation'
  ) as VitePlugin;

describe('tina() integration - astro:config:setup', () => {
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

describe('tina() integration - bridge dev plugin', () => {
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

describe('tina() integration - cloudflare import.meta.url plugin', () => {
  const EXPECTED = JSON.stringify('file:///worker.mjs');

  it('injects a valid import.meta.url define for the workerd server envs under the cloudflare adapter', () => {
    const { integration, plugins } = runConfigSetup();
    runConfigDone(integration, '@astrojs/cloudflare');
    const plugin = cfPlugin(plugins);
    expect(plugin).toBeDefined();

    for (const env of ['ssr', 'astro']) {
      const result = runConfigEnvironment(plugin, env);
      expect(result?.define?.['import.meta.url']).toBe(EXPECTED);
      // The placeholder must itself be a valid absolute URL.
      expect(
        () => new URL(JSON.parse(result.define['import.meta.url']))
      ).not.toThrow();
    }
  });

  it('never injects the define into the client or prerender envs', () => {
    const { integration, plugins } = runConfigSetup();
    runConfigDone(integration, '@astrojs/cloudflare');
    const plugin = cfPlugin(plugins);
    // `client` keeps the real import.meta.url; `prerender` may run in Node.
    expect(runConfigEnvironment(plugin, 'client')).toBeUndefined();
    expect(runConfigEnvironment(plugin, 'prerender')).toBeUndefined();
  });

  it('does not inject the define for non-cloudflare adapters', () => {
    for (const adapter of ['@astrojs/node', '@astrojs/vercel']) {
      const { integration, plugins } = runConfigSetup();
      runConfigDone(integration, adapter);
      const plugin = cfPlugin(plugins);
      for (const env of ['ssr', 'prerender', 'astro', 'client']) {
        expect(runConfigEnvironment(plugin, env)).toBeUndefined();
      }
    }
  });

  it('does not inject the define when no adapter is configured', () => {
    const { integration, plugins } = runConfigSetup();
    runConfigDone(integration);
    expect(runConfigEnvironment(cfPlugin(plugins), 'ssr')).toBeUndefined();
  });

  it('reads the adapter flag lazily, after config:done', () => {
    const { integration, plugins } = runConfigSetup();
    const plugin = cfPlugin(plugins);
    // Before config:done the flag is false, so the plugin is inert.
    expect(runConfigEnvironment(plugin, 'ssr')).toBeUndefined();
    // The same plugin instance picks up the adapter once config:done runs.
    runConfigDone(integration, '@astrojs/cloudflare');
    expect(
      runConfigEnvironment(plugin, 'ssr')?.define?.['import.meta.url']
    ).toBe(EXPECTED);
  });

  it('honours the cloudflareWorkers option override', () => {
    // Force on, even with a Node adapter.
    const forcedOn = runConfigSetup({ cloudflareWorkers: true });
    runConfigDone(forcedOn.integration, '@astrojs/node');
    expect(
      runConfigEnvironment(cfPlugin(forcedOn.plugins), 'ssr')?.define?.[
        'import.meta.url'
      ]
    ).toBe(EXPECTED);

    // Force off, even with the Cloudflare adapter.
    const forcedOff = runConfigSetup({ cloudflareWorkers: false });
    runConfigDone(forcedOff.integration, '@astrojs/cloudflare');
    expect(
      runConfigEnvironment(cfPlugin(forcedOff.plugins), 'ssr')
    ).toBeUndefined();
  });
});

describe('tina() integration - dev content invalidation plugin', () => {
  it('is a dev-only plugin', () => {
    const { plugins } = runConfigSetup();
    const plugin = invalidationPlugin(plugins);
    expect(plugin).toBeDefined();
    expect(plugin.apply).toBe('serve');
  });

  it('clears the route cache and reloads when a content file is added', () => {
    vi.useFakeTimers();
    try {
      const { plugins } = runConfigSetup();
      const { server, ssrSend, clientSend, handlers } = makeDevServer();
      (invalidationPlugin(plugins).configureServer as any)(server);

      handlers.add('/project/src/content/blog/new-post.mdx');
      // Debounced, so nothing fires synchronously.
      expect(ssrSend).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(ssrSend).toHaveBeenCalledWith('astro:content-changed', {});
      expect(clientSend).toHaveBeenCalledWith({
        type: 'full-reload',
        path: '*',
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('also reacts to content files being removed', () => {
    vi.useFakeTimers();
    try {
      const { plugins } = runConfigSetup();
      const { server, ssrSend, handlers } = makeDevServer();
      (invalidationPlugin(plugins).configureServer as any)(server);

      handlers.unlink('/project/content/posts/gone.md');
      vi.advanceTimersByTime(50);
      expect(ssrSend).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('treats markdown as content anywhere, but structured data only inside a content dir', () => {
    vi.useFakeTimers();
    try {
      const { plugins } = runConfigSetup();
      const { server, ssrSend, handlers } = makeDevServer();
      (invalidationPlugin(plugins).configureServer as any)(server);

      // Reacts to: markdown anywhere, and json/yaml inside a content dir.
      for (const file of [
        '/project/src/pages/inline.mdx',
        '/project/content/tags/tag.json',
        '/project/content/global/site.yaml',
      ]) {
        handlers.add(file);
        vi.advanceTimersByTime(50);
        expect(ssrSend).toHaveBeenCalled();
        ssrSend.mockClear();
      }

      // Ignores: config json outside a content dir, source code, and anything
      // inside ignored directories.
      for (const file of [
        '/project/package.json',
        '/project/tsconfig.json',
        '/project/src/lib/data.ts',
        '/project/node_modules/pkg/content/x.md',
        '/project/dist/content/x.md',
      ]) {
        handlers.add(file);
        vi.advanceTimersByTime(50);
        expect(ssrSend).not.toHaveBeenCalled();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it('coalesces a burst of changes into a single reload', () => {
    vi.useFakeTimers();
    try {
      const { plugins } = runConfigSetup();
      const { server, ssrSend, clientSend, handlers } = makeDevServer();
      (invalidationPlugin(plugins).configureServer as any)(server);

      handlers.add('/project/content/a.md');
      handlers.add('/project/content/b.md');
      handlers.unlink('/project/content/c.md');
      vi.advanceTimersByTime(50);

      expect(ssrSend).toHaveBeenCalledOnce();
      expect(clientSend).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not arm on Astro 5, whose runtime has no astro:content-changed listener', () => {
    // The integration reads the installed Astro major from `astro`'s
    // package.json via JSON.parse; force it to 5.x for this call only. Astro 5
    // ships Vite 6, so the environment API is present either way; the version
    // gate, not an API sniff, is what keeps the plugin from arming here.
    const parse = vi
      .spyOn(JSON, 'parse')
      .mockReturnValue({ version: '5.18.1' });
    try {
      const { plugins } = runConfigSetup();
      const { server, ssrSend, clientSend, handlers } = makeDevServer();
      (invalidationPlugin(plugins).configureServer as any)(server);

      // Gate trips before any watcher is wired or HMR signal is sent.
      expect(Object.keys(handlers)).toHaveLength(0);
      expect(ssrSend).not.toHaveBeenCalled();
      expect(clientSend).not.toHaveBeenCalled();
    } finally {
      parse.mockRestore();
    }
  });

  it('no-ops without throwing when the environment API is unavailable', () => {
    const { plugins } = runConfigSetup();
    const { server, handlers } = makeDevServer({ environments: false });
    expect(() =>
      (invalidationPlugin(plugins).configureServer as any)(server)
    ).not.toThrow();
    // Defensive secondary guard: past the version check but with the hot
    // channels absent, register no handlers rather than guess at the channel.
    expect(Object.keys(handlers)).toHaveLength(0);
  });
});

describe('tina() integration - astro:build:done', () => {
  it('emits bridge.js into the client output dir', () => {
    const clientDir = mkdtempSync(join(tmpdir(), 'tina-client-'));
    const { integration } = runConfigSetup();
    const logger = { warn: vi.fn(), info: vi.fn() };

    (
      integration.hooks['astro:config:done'] as NonNullable<
        Hooks['astro:config:done']
      >
    )({
      config: { build: { client: pathToFileURL(clientDir + sep) } },
    } as unknown as ConfigDoneArg);

    (
      integration.hooks['astro:build:done'] as NonNullable<
        Hooks['astro:build:done']
      >
    )({ logger } as unknown as BuildDoneArg);

    const bridgePath = join(clientDir, 'admin', 'bridge.js');
    expect(existsSync(bridgePath)).toBe(true);
    expect(readFileSync(bridgePath, 'utf-8').length).toBeGreaterThan(0);
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
