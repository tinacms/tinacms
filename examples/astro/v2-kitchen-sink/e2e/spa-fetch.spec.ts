import { expect, test } from '@playwright/test';

test.describe('SPA fetch edit-mode detection', () => {
  test('same-origin fetch from inside the iframe gets the bridge wiring', async ({
    page,
    context,
  }) => {
    await page.goto('/?tina-edit=1', { waitUntil: 'load' });

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === '__tina_edit')?.value).toBe('1');

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

  test('fetch without the cookie does NOT trip edit mode', async ({
    page,
    context,
  }) => {
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
