import type { PluginContext, ViteDevServer } from 'vite';
import { describe, expect, it, vi } from 'vitest';
import { tinaVitePlugin } from '../vite';

type Handler = (req: { url?: string }, res: any, next: () => void) => void;

function registerHandler(): Handler {
  const plugin = tinaVitePlugin();
  let handler: Handler | undefined;
  const server = {
    middlewares: { use: (middleware: Handler) => (handler = middleware) },
  } as unknown as ViteDevServer;
  plugin.configureServer?.(server);
  if (!handler) throw new Error('plugin did not register a middleware');
  return handler;
}

function makeResponse() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as Buffer | string | undefined,
    setHeader(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body?: Buffer | string) {
      this.body = body;
    },
  };
}

describe('tinaVitePlugin', () => {
  it('serves the bridge at its public URL in development', () => {
    const handler = registerHandler();
    const response = makeResponse();
    const next = vi.fn();

    handler({ url: '/admin/bridge.js?import' }, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.headers['content-type']).toBe('text/javascript');
    expect(response.headers['cache-control']).toBe('no-cache');
    expect(Buffer.from(response.body ?? '').length).toBeGreaterThan(0);
  });

  it('passes unrelated requests through', () => {
    const handler = registerHandler();
    const response = makeResponse();
    const next = vi.fn();

    handler({ url: '/posts/hello' }, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.body).toBeUndefined();
  });

  it('emits the bridge in the client build', () => {
    const plugin = tinaVitePlugin();
    const emitFile = vi.fn();
    plugin.configResolved?.({ command: 'build' } as any);

    plugin.buildStart?.call({ emitFile } as unknown as PluginContext);

    expect(emitFile).toHaveBeenCalledOnce();
    expect(emitFile.mock.calls[0][0]).toMatchObject({
      type: 'asset',
      fileName: 'admin/bridge.js',
    });
    expect(
      Buffer.from(emitFile.mock.calls[0][0].source).length
    ).toBeGreaterThan(0);
  });
});
