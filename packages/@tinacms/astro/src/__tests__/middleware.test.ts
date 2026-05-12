import type { APIContext, MiddlewareNext } from 'astro';
import { describe, expect, it, vi } from 'vitest';
import { onRequest } from '../middleware';

function makeContext(
  overrides: Partial<APIContext> & { request?: unknown }
): APIContext {
  return {
    locals: {},
    request: new Request('https://example.com/'),
    isPrerendered: false,
    ...overrides,
  } as unknown as APIContext;
}

const passThrough: MiddlewareNext = () =>
  Promise.resolve(
    new Response('<html><head></head><body>ok</body></html>', {
      headers: { 'content-type': 'text/html' },
    })
  );

describe('onRequest', () => {
  it('short-circuits prerendered routes without touching request headers', async () => {
    // A synthetic build-time Request whose header access would emit Astro's
    // `Astro.request.headers` warning — modeled here as a throw.
    const request = {
      url: 'https://example.com/',
      headers: {
        get() {
          throw new Error('request headers must not be read while prerendering');
        },
      },
    };
    const context = makeContext({ isPrerendered: true, request });
    const next = vi.fn(passThrough);

    const response = await onRequest(context, next);

    expect(next).toHaveBeenCalledOnce();
    expect((context.locals as { tinaEdit?: boolean }).tinaEdit).toBe(false);
    expect(await response.text()).toContain('ok');
  });

  it('resolves edit mode for non-prerendered requests', async () => {
    const context = makeContext({ isPrerendered: false });
    const next = vi.fn(passThrough);

    await onRequest(context, next);

    expect(next).toHaveBeenCalledOnce();
    // Plain request — no iframe Sec-Fetch-Dest, no cookie — so not editing.
    expect((context.locals as { tinaEdit?: boolean }).tinaEdit).toBe(false);
  });
});
