import { expect, type Page, test } from '@playwright/test';

const DOCUMENT = '/#/collections/post/content%2Fposts%2Fhello-world.mdx';

const rects = (page: Page) =>
  page.evaluate(() => {
    const box = (element: Element | null) => {
      const r = element?.getBoundingClientRect();
      return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
    };
    const bar = document.querySelector('[data-slot=form-bar]');
    return {
      bar: box(bar),
      tag: box(bar?.querySelector('[role=status]') ?? null),
      menu: box(bar?.querySelector('[aria-label="Document actions"]') ?? null),
      save: box(
        [...(bar?.querySelectorAll('button') ?? [])].find(
          (button) => button.textContent?.trim().startsWith('Save') ?? false
        ) ?? null
      ),
      alerts: bar?.querySelectorAll('[role=alert]').length ?? 0,
    };
  });

// The Unsaved tag animates in, so measure once two reads 250ms apart agree.
const settled = async (page: Page) => {
  let last = await rects(page);
  await expect
    .poll(async () => {
      await page.waitForTimeout(250);
      const now = await rects(page);
      const same = JSON.stringify(now) === JSON.stringify(last);
      last = now;
      return same;
    })
    .toBe(true);
  return last;
};

const dirty = async (page: Page) => {
  await page.goto(DOCUMENT);
  const title = page.getByRole('textbox', { name: /^Title/ });
  await title.click();
  await title.pressSequentially('!');
  // Fonts load late and move the tag by a fraction of a pixel, which is not the
  // failure under test.
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.locator('[data-slot=form-bar] [role=status]')
  ).toBeVisible();
};

// The write fails with a body the editor must never read.
const failWrites = (page: Page, message: string) =>
  page.route('**/api/tina/**', (route) =>
    route.request().postData()?.includes('"op":"update"')
      ? route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: { code: 'op-failed', message } }),
        })
      : route.continue()
  );

test.describe('form bar at 1440px', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('measures like the Storybook form bar (AC50), Save at its 164px minimum', async ({
    page,
  }) => {
    await dirty(page);
    const { bar, menu, save } = await settled(page);
    if (!bar || !menu || !save) throw new Error('the form bar has no boxes');
    expect(bar.height).toBeGreaterThanOrEqual(56);
    expect(bar.height).toBeLessThanOrEqual(57);
    expect(menu.width).toBe(32);
    expect(menu.height).toBe(32);
    expect(save.width).toBe(164);
    expect(save.height).toBe(36);
    // 12px of padding on each side.
    expect(bar.x + bar.width - (save.x + save.width)).toBe(12);
    // Parts are centred in the bar.
    const middle = bar.y + bar.height / 2;
    expect(Math.abs(save.y + save.height / 2 - middle)).toBeLessThanOrEqual(1);
    expect(Math.abs(menu.y + menu.height / 2 - middle)).toBeLessThanOrEqual(1);
  });
});

for (const { name, width, height } of [
  { name: '1440px', width: 1440, height: 900 },
  { name: '390px', width: 390, height: 844 },
]) {
  for (const [kind, message] of [
    ['a one-line message', 'Operation failed.'],
    ['a 300-character message', 'x'.repeat(300)],
  ]) {
    test(`a failed Save leaves every box of the form bar where it was, with ${kind}, at ${name} (AC51, AC52)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await failWrites(page, message);
      await dirty(page);
      const before = await settled(page);
      await page.getByRole('button', { name: 'Save' }).click();
      const toast = page.locator(
        '[data-sonner-toast][role=alert], [role=alert][data-slot=toast]'
      );
      await expect(toast.first()).toContainText(
        "Couldn't save. Something went wrong."
      );
      await expect(toast.first()).not.toContainText(/500|op-failed|xxxx/);
      expect(await rects(page)).toEqual(before);
      expect((await rects(page)).alerts).toBe(0);
      await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
      // The toast clears the bar, so Save stays reachable.
      await page.getByRole('button', { name: 'Save' }).hover({ timeout: 4000 });
    });
  }
}
