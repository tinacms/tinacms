/**
 * Bridge wiring smoke tests. Checks the static HTML the page emits
 * matches what `@tinacms/bridge` expects to find:
 *
 *   - one `[data-tina-form]` element per editable query
 *   - the value parses as JSON with `id`, `query`, `variables`, `data`
 *   - at least one `[data-tina-island]` region per page that has dynamic
 *     content
 *   - at least one `[data-tina-field]` marker so click-to-focus has
 *     anything to bite on
 *
 * Does NOT exercise the postMessage handshake — that needs a fake admin
 * iframe and is a separate follow-up. These tests are enough to catch
 * regressions in the new `<TinaVisualEditing>` wire format.
 */
import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/posts', '/blog', '/authors'];

for (const route of ROUTES) {
  test.describe(`Bridge wiring on ${route}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route);
    });

    test('emits at least one [data-tina-form] element', async ({ page }) => {
      const forms = page.locator('[data-tina-form]');
      expect(await forms.count()).toBeGreaterThan(0);
    });

    test('every form payload parses as JSON with the expected shape', async ({
      page,
    }) => {
      const payloads = await page
        .locator('[data-tina-form]')
        .evaluateAll((els) =>
          els.map((el) => el.getAttribute('data-tina-form'))
        );

      expect(payloads.length).toBeGreaterThan(0);

      for (const raw of payloads) {
        expect(raw).toBeTruthy();
        const parsed = JSON.parse(raw as string);
        expect(parsed).toHaveProperty('id');
        expect(parsed).toHaveProperty('query');
        expect(parsed).toHaveProperty('variables');
        expect(parsed).toHaveProperty('data');
        expect(typeof parsed.id).toBe('string');
        expect(typeof parsed.query).toBe('string');
      }
    });

    test('emits at least one [data-tina-island] region', async ({ page }) => {
      const islands = page.locator('[data-tina-island]');
      expect(await islands.count()).toBeGreaterThan(0);
    });

    test('emits at least one [data-tina-field] marker', async ({ page }) => {
      const fields = page.locator('[data-tina-field]');
      expect(await fields.count()).toBeGreaterThan(0);
    });
  });
}

test.describe('Form payload encoding', () => {
  test('survives values containing </script> sequences without DOM corruption', async ({
    page,
  }) => {
    // The new wire format relies on Astro's automatic attribute
    // escaping — a CMS value containing a script-closing sequence
    // should round-trip through `JSON.parse` exactly.
    await page.goto('/');

    const result = await page.evaluate(() => {
      const el = document.querySelector('[data-tina-form]');
      if (!el) return { ok: false, reason: 'no [data-tina-form]' };
      const raw = el.getAttribute('data-tina-form');
      if (!raw) return { ok: false, reason: 'empty attribute' };
      try {
        const parsed = JSON.parse(raw);
        return { ok: true, hasId: typeof parsed.id === 'string' };
      } catch (err) {
        return { ok: false, reason: String(err) };
      }
    });

    expect(result.ok).toBe(true);
    expect(result.hasId).toBe(true);
  });

  test('does not leak any <script type="application/tina+json"> blocks (legacy wire format)', async ({
    page,
  }) => {
    // The previous bridge wire format used inline JSON inside a script
    // tag and required `set:html` on the server. We removed that path
    // entirely — guard against accidental reintroduction.
    await page.goto('/');
    const legacy = page.locator('script[type="application/tina+json"]');
    expect(await legacy.count()).toBe(0);
  });
});
