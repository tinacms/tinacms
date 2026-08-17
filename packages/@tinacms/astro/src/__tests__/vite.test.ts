import type { ViteDevServer } from 'vite';
import { describe, expect, it, vi } from 'vitest';
import { tinaAdminDevRedirect } from '../vite';

type Handler = (req: any, res: any, next: () => void) => void;

function registerHandler(): Handler {
  const plugin = tinaAdminDevRedirect();
  let handler: Handler | undefined;
  const server = {
    middlewares: { use: (h: Handler) => (handler = h) },
  } as unknown as ViteDevServer;
  (plugin.configureServer as any)(server);
  if (!handler) throw new Error('plugin did not register a middleware');
  return handler;
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    ended: false,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    end() {
      this.ended = true;
    },
  };
}

describe('tinaAdminDevRedirect', () => {
  it('only applies to the dev server', () => {
    expect(tinaAdminDevRedirect().apply).toBe('serve');
  });

  it.each(['/admin', '/admin/', '/admin?foo=bar'])(
    'redirects %s to /admin/index.html',
    (url) => {
      const handler = registerHandler();
      const res = makeRes();
      const next = vi.fn();

      handler({ url }, res, next);

      expect(res.statusCode).toBe(302);
      expect(res.headers.Location).toBe('/admin/index.html');
      expect(res.ended).toBe(true);
      expect(next).not.toHaveBeenCalled();
    }
  );

  it.each(['/admin/index.html', '/admin/foo', '/admins', '/'])(
    'passes %s through untouched',
    (url) => {
      const handler = registerHandler();
      const res = makeRes();
      const next = vi.fn();

      handler({ url }, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.ended).toBe(false);
      expect(res.statusCode).toBe(200);
    }
  );
});
