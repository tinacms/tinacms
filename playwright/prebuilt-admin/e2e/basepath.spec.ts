import { expect, test } from '@playwright/test';
import { waitForAdminShell } from './utils/admin-helpers';

// `build.basePath: 'my-site'` must serve a bootable admin at BOTH the
// trailing-slash and bare forms. The bare form is the spike's trap: without
// a trailing slash, `document.baseURI` drops the last segment and every
// relative asset 404s. Assets are absolute in the production build, so the
// bare form must still boot — this locks that in.
for (const path of ['/my-site/admin/', '/my-site/admin']) {
  test(`admin boots at "${path}"`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await waitForAdminShell(page);

    // The shell mounted into #root (assets resolved).
    const rootChildren = await page.evaluate(
      () => document.getElementById('root')?.childElementCount ?? 0
    );
    expect(rootChildren).toBeGreaterThan(0);

    // The build's inline asset-load guard never fired.
    expect(consoleErrors.join('\n')).not.toContain('Failed to load assets');
  });
}
