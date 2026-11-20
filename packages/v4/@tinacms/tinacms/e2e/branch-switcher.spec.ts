import { expect, test } from '@playwright/test';

const DESKTOP = { width: 1280, height: 800 };
const TABLET = { width: 768, height: 900 };
const URL = '/branches.html?docs=1&create=slow#/';

test.describe('branch switcher pop-up', () => {
  test('opens under the button with no scrim and returns focus on Escape', async ({
    page,
  }) => {
    await page.setViewportSize(TABLET);
    await page.goto(URL);
    const button = page.getByRole('button', { name: /^Branch:/ });
    await button.click();
    const popup = page.getByRole('dialog', { name: 'Branches' });
    await expect(popup).toBeVisible();
    await expect(
      page.getByRole('searchbox', { name: 'Search branches' })
    ).toBeFocused();
    await page.waitForTimeout(300);
    const trigger = await button.boundingBox();
    const box = await popup.boundingBox();
    if (!trigger || !box) throw new Error('no boxes');
    expect(box.y - (trigger.y + trigger.height)).toBeLessThanOrEqual(12);
    expect(box.y).toBeGreaterThanOrEqual(trigger.y + trigger.height);
    expect(Math.abs(box.x - trigger.x)).toBeLessThanOrEqual(1);
    expect(box.x + box.width).toBeLessThanOrEqual(TABLET.width);
    await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('closes on an outside click', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(URL);
    await page.getByRole('button', { name: /^Branch:/ }).click();
    const popup = page.getByRole('dialog', { name: 'Branches' });
    await expect(popup).toBeVisible();
    await page.mouse.click(DESKTOP.width - 20, DESKTOP.height / 2);
    await expect(popup).toBeHidden();
  });

  test('maximises between the Top bar and the Status bar and restores with the search kept', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(URL);
    const button = page.getByRole('button', { name: /^Branch:/ });
    await button.click();
    await page.getByRole('searchbox', { name: 'Search branches' }).fill('feat');
    await page.getByRole('button', { name: 'Maximise' }).click();
    const view = page.locator('[data-slot="branch-maximised"]');
    await expect(view).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    const top = await page.getByRole('banner').boundingBox();
    const status = await page
      .getByRole('contentinfo', { name: 'Status bar' })
      .boundingBox();
    const box = await view.boundingBox();
    if (!top || !status || !box) throw new Error('no boxes');
    expect(Math.abs(box.y - (top.y + top.height))).toBeLessThanOrEqual(1);
    expect(Math.abs(box.y + box.height - status.y)).toBeLessThanOrEqual(1);
    await expect(page.getByRole('button', { name: 'Restore' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(
      page.getByRole('searchbox', { name: 'Search branches' })
    ).toHaveValue('feat');
    await page.getByRole('button', { name: 'Restore' }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    await expect(
      page.getByRole('searchbox', { name: 'Search branches' })
    ).toHaveValue('feat');
    await page.getByRole('button', { name: 'Maximise' }).click();
    await page.keyboard.press('Escape');
    await expect(view).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('keeps the pop-up open when Start from is changed', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&branch=feature/news&create=ok#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: /^main/ }).click();
    await page.getByRole('button', { name: /^Branch: main/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await page
      .getByRole('group', { name: 'Start from' })
      .getByRole('button', { name: 'feature/news' })
      .click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
  });

  test('makes a branch and lands on it', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(URL);
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await page.getByRole('button', { name: 'Create branch' }).click();
    await expect(page.getByRole('button', { name: 'Creating' })).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Branch: cms/x' })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
  });

  test('shows Local files in local mode', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');
    const badge = page.getByRole('banner').getByText('Local files');
    await expect(badge).toBeVisible();
    await expect(
      page.getByRole('banner').getByRole('button', { name: /Local files/ })
    ).toHaveCount(0);
  });

  test('keeps the foot sheet on a phone with no Maximise button', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(URL);
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Maximise' })).toHaveCount(0);
  });

  for (const width of [479, 320]) {
    test(`shows the Local files badge as an icon with its name at ${width}px without overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const badge = page.getByRole('banner').getByText('Local files');
      await expect(badge).toBeAttached();
      await expect
        .poll(async () => (await badge.boundingBox())?.width ?? 0)
        .toBeLessThanOrEqual(1);
      await expect(
        page.getByRole('banner').getByRole('button', { name: /Search/ })
      ).toBeVisible();
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
