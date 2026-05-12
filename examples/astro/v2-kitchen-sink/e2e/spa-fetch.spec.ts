/**
 * Verifies the edit-mode detection fix for SPA-style fetches: when a
 * page rendered inside the iframe issues a same-origin fetch() (the
 * way Astro <ClientRouter />, Turbo, htmx, etc. retrieve the next
 * page), the middleware must splice in the [data-tina-form] payloads
 * and the bridge script — Sec-Fetch-Dest is `empty` on those, not
 * `iframe`, so the original check would short-circuit.
 *
 * Run via the standard `pnpm test:e2e` after the file sits under e2e/.
 * Temporary scaffold; can be deleted once we have a full admin/iframe
 * harness.
 */
import { expect, test } from '@playwright/test';

test.describe('SPA fetch edit-mode detection', () => {
  test('a same-origin fetch from inside the iframe gets the bridge wiring', async ({
    page,
    context,
  }) => {
    // Get into edit mode the explicit way so we don't need to script
    // the admin postMessage handshake. ?tina-edit=1 ALSO sets the
    // __tina_edit cookie via the middleware's response.
    await page.goto('/?tina-edit=1', { waitUntil: 'load' });

    const cookies = await context.cookies();
    const editCookie = cookies.find((c) => c.name === '__tina_edit');
    expect(editCookie?.value).toBe('1');

    // Issuing a fetch() from inside the now-edit-mode page mirrors what
    // a SPA router does. Sec-Fetch-Dest: empty, Sec-Fetch-Site:
    // same-origin, cookie carried automatically.
    const fetched = await page.evaluate(async () => {
      const r = await fetch('/blog');
      const html = await r.text();
      return {
        status: r.status,
        formCount: (html.match(/data-tina-form/g) || []).length,
        bridgeCount: (html.match(/\/_tina\/bridge\.js/g) || []).length,
      };
    });

    expect(fetched.status).toBe(200);
    expect(fetched.formCount).toBeGreaterThan(0);
    expect(fetched.bridgeCount).toBeGreaterThan(0);
  });

  test('a fetch without the cookie does NOT trip edit mode', async ({
    page,
    context,
  }) => {
    // Start from a page rendered without ?tina-edit=1 so no cookie
    // is ever set on this context.
    await context.clearCookies();
    await page.goto('/', { waitUntil: 'load' });

    const fetched = await page.evaluate(async () => {
      const r = await fetch('/blog');
      const html = await r.text();
      return {
        status: r.status,
        formCount: (html.match(/data-tina-form/g) || []).length,
      };
    });

    expect(fetched.status).toBe(200);
    expect(fetched.formCount).toBe(0);
  });
});
