import { type Page, expect, test } from '@playwright/test';

const HELLO = 'content/posts/hello-world.mdx';
const PHONE = { width: 390, height: 844 };
const TABLET = { width: 768, height: 1024 };
const DESKTOP = { width: 1440, height: 900 };

const documentHash = (flag = '') =>
  `/collections/post/${encodeURIComponent(HELLO)}${flag}`;
const adminUrl = (hash: string, preview = `/declared.html?post=${HELLO}`) =>
  `/?preview=${encodeURIComponent(preview)}#${hash}`;

const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');
const title = (page: Page) => page.locator('#title');
const rail = (page: Page, name: string) =>
  page.locator(`[data-rail-row][aria-label="${name}"]`);

const open = async (
  page: Page,
  size: { width: number; height: number },
  hash = documentHash()
) => {
  await page.setViewportSize(size);
  await page.goto(adminUrl(hash));
  await expect(frame(page).getByTestId('post-title')).toBeAttached({
    timeout: 30_000,
  });
};

/** Counts load events on the preview iframe from now on. */
const countLoads = async (page: Page) => {
  await page.evaluate(() => {
    const target = window as unknown as { __loads: number };
    target.__loads = 0;
    document
      .querySelector('iframe[title="Preview"]')
      ?.addEventListener('load', () => {
        target.__loads += 1;
      });
  });
  return () =>
    page.evaluate(() => (window as unknown as { __loads: number }).__loads);
};

test.describe('side nav below desktop', () => {
  for (const size of [PHONE, TABLET]) {
    test(`at ${size.width}px it takes no width and opens as a sheet under the top bar`, async ({
      page,
    }) => {
      await open(page, size);
      const head = page.locator('[data-form-part=head]');
      expect((await head.boundingBox())?.x).toBe(0);
      const toggle = page.getByRole('button', { name: 'Open side nav' });
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      const close = page.getByRole('button', { name: 'Close side nav' });
      await expect(close).toHaveAttribute('aria-expanded', 'true');
      const sheet = page.getByRole('navigation', { name: 'Content' });
      await expect(sheet).toBeVisible();
      expect((await sheet.boundingBox())?.y).toBe(56);
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
      await expect(
        page.getByRole('button', { name: 'Open side nav' })
      ).toBeFocused();
    });
  }

  test('choosing an entry navigates and closes it', async ({ page }) => {
    await open(page, PHONE);
    await page.getByRole('button', { name: 'Open side nav' }).click();
    await rail(page, 'Media').click();
    await expect(
      page.getByRole('navigation', { name: 'Content' })
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Close' }).first()
    ).toBeVisible();
  });

  test('at desktop the side nav stays in the page', async ({ page }) => {
    await open(page, DESKTOP);
    const box = await page
      .getByRole('navigation', { name: 'Content' })
      .boundingBox();
    expect(box?.x).toBe(0);
    expect(box?.width).toBeGreaterThan(40);
    await expect(
      page.getByRole('button', { name: 'Toggle Sidebar' })
    ).toBeVisible();
  });
});

test.describe('phone document', () => {
  test('one view at a time, the preview never reloads, Save stays in both', async ({
    page,
  }) => {
    await open(page, PHONE);
    const loads = await countLoads(page);
    const view = page.getByRole('group', { name: 'View', exact: true });
    await expect(view).toBeVisible();
    await expect(title(page)).toBeVisible();
    await expect(page.locator('iframe[title="Preview"]')).toBeHidden();

    await title(page).fill('Edited on a phone');
    await view.getByRole('button', { name: 'Preview' }).click();
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible();
    await expect(title(page)).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('contentinfo', { name: 'Status bar' })
    ).toContainText('Unsaved');

    await view.getByRole('button', { name: 'Form' }).click();
    await expect(title(page)).toHaveValue('Edited on a phone');
    expect(await loads()).toBe(0);
  });

  test('nothing scrolls sideways', async ({ page }) => {
    await open(page, { width: 375, height: 812 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(375);
  });

  test('the page route shows the page with a foot bar', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto(adminUrl('/page', '/plain.html'));
    const bar = page.locator('[data-slot=nothing-to-edit-bar]');
    await expect(bar).toContainText('Nothing to edit here');
    await bar.getByRole('button', { name: 'Open Collections' }).click();
    await expect(page).toHaveURL(/#\/collections$/);
  });

  test('Collections over a document closes back to the form with edits kept', async ({
    page,
  }) => {
    await open(page, PHONE);
    await title(page).fill('Kept through Collections');
    await page.getByRole('button', { name: 'Open side nav' }).click();
    await rail(page, 'Collections').click();
    await expect(page).toHaveURL(/\?nav$/);
    await expect(
      page.getByRole('complementary', { name: 'Navigator' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Maximise' })).toHaveCount(0);
    await page
      .getByRole('complementary', { name: 'Navigator' })
      .getByRole('button', { name: 'Close' })
      .click();
    await expect(page).not.toHaveURL(/\?nav/);
    await expect(title(page)).toHaveValue('Kept through Collections');
  });
});

test.describe('tablet document', () => {
  test('the form and the preview sit side by side and the form drags between 320 and 480', async ({
    page,
  }) => {
    await open(page, TABLET);
    const form = page.getByRole('complementary', { name: 'Document form' });
    expect((await form.boundingBox())?.width).toBe(360);
    const handle = page.getByRole('separator', {
      name: 'Resize the form column',
    });
    const box = await handle.boundingBox();
    if (!box) throw new Error('no handle');
    await page.mouse.move(box.x + 4, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + 600, box.y + 100);
    await page.mouse.up();
    expect((await form.boundingBox())?.width).toBe(480);
    await handle.focus();
    await page.keyboard.press('Home');
    expect((await form.boundingBox())?.width).toBe(360);
  });

  test('a tablet width does not change the desktop width', async ({ page }) => {
    await open(page, TABLET);
    await page
      .getByRole('separator', { name: 'Resize the form column' })
      .focus();
    await page.keyboard.press('ArrowRight');
    await page.setViewportSize(DESKTOP);
    const form = page.getByRole('complementary', { name: 'Document form' });
    expect((await form.boundingBox())?.width).toBe(352);
  });

  test('Maximise preview enters one view and Escape restores it', async ({
    page,
  }) => {
    await open(page, TABLET);
    const loads = await countLoads(page);
    await page.getByRole('button', { name: 'Maximise preview' }).click();
    await expect(
      page.getByRole('group', { name: 'View', exact: true })
    ).toBeVisible();
    await expect(title(page)).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(title(page)).toBeVisible();
    await expect(
      page.getByRole('group', { name: 'View', exact: true })
    ).toHaveCount(0);
    expect(await loads()).toBe(0);
  });

  test('Maximise form starts on the form, and Restore form returns to the split', async ({
    page,
  }) => {
    await open(page, TABLET);
    await page.getByRole('button', { name: 'Maximise form' }).click();
    await expect(page.locator('iframe[title="Preview"]')).toBeHidden();
    await page.getByRole('button', { name: 'Restore form' }).click();
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible();
  });

  test('Collections opens a column beside the preview and keeps the form mounted', async ({
    page,
  }) => {
    await open(page, TABLET);
    const loads = await countLoads(page);
    await title(page).fill('Kept on a tablet');
    await page.getByRole('button', { name: 'Open side nav' }).click();
    await rail(page, 'Collections').click();
    await expect(page).toHaveURL(/\?nav$/);
    const navigator = page.getByRole('complementary', { name: 'Navigator' });
    await expect(navigator).toBeVisible();
    expect((await navigator.boundingBox())?.width).toBe(440);
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible();
    await navigator.getByRole('button', { name: 'Close' }).click();
    await expect(title(page)).toHaveValue('Kept on a tablet');
    expect(await loads()).toBe(0);
  });

  test('Media fills the space with Close and no Maximise', async ({ page }) => {
    await open(page, TABLET);
    await page.getByRole('button', { name: 'Open side nav' }).click();
    await rail(page, 'Media').click();
    await expect(
      page.getByRole('button', { name: 'Close' }).first()
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Maximise' })).toHaveCount(0);
  });
});

test('crossing breakpoints keeps the edits and never reloads the preview', async ({
  page,
}) => {
  await open(page, PHONE);
  const loads = await countLoads(page);
  await title(page).fill('Across sizes');
  for (const size of [TABLET, DESKTOP, PHONE]) {
    await page.setViewportSize(size);
    await page.waitForTimeout(200);
  }
  await expect(title(page)).toHaveValue('Across sizes');
  expect(await loads()).toBe(0);
});

test.describe('touch', () => {
  test.describe('with a finger', () => {
    test.use({ hasTouch: true });

    test('top bar buttons and the form bar are at least 40px tall', async ({
      page,
    }) => {
      await open(page, PHONE);
      const heights = await page
        .locator('[data-slot=top-bar] button, [data-slot=form-bar] button')
        .evaluateAll((buttons) =>
          buttons.map((button) => button.getBoundingClientRect().height)
        );
      expect(heights.length).toBeGreaterThan(3);
      for (const height of heights) expect(height).toBeGreaterThanOrEqual(40);
    });

    test('a field keeps 14px words', async ({ page }) => {
      await open(page, PHONE);
      expect(
        await title(page).evaluate((field) => getComputedStyle(field).fontSize)
      ).toBe('14px');
    });

    test('a tooltip does not open on a tap', async ({ page }) => {
      await open(page, DESKTOP);
      await rail(page, 'Collections').tap();
      await page.waitForTimeout(700);
      await expect(page.getByRole('tooltip')).toHaveCount(0);
    });

    test('a tablet held sideways uses the tablet layout with touch sizes', async ({
      page,
    }) => {
      await open(page, { width: 844, height: 390 });
      await expect(
        page.getByRole('button', { name: 'Open side nav' })
      ).toBeVisible();
      expect(
        (
          await page
            .getByRole('button', { name: 'Open side nav' })
            .boundingBox()
        )?.height
      ).toBeGreaterThanOrEqual(40);
    });
  });

  test('without a finger the controls keep their mouse sizes', async ({
    page,
  }) => {
    await open(page, DESKTOP);
    const box = await page
      .locator('[data-slot=form-bar] button')
      .first()
      .boundingBox();
    expect(box?.height).toBeLessThan(40);
  });
});
