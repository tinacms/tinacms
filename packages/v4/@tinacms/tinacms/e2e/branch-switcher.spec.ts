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

  for (const how of [
    'Close branches',
    'Escape',
    'the branch button',
    'Restore, then Close branches',
  ]) {
    test(`opens again after the maximised view is closed with ${how}`, async ({
      page,
    }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto(URL);
      const button = page.getByRole('button', { name: /^Branch:/ });
      await button.click();
      await page.getByRole('button', { name: 'Maximise' }).click();
      const view = page.locator('[data-slot="branch-maximised"]');
      await expect(view).toBeVisible();
      await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
      if (how === 'Close branches')
        await view.getByRole('button', { name: 'Close branches' }).click();
      else if (how === 'Escape') await page.keyboard.press('Escape');
      else if (how === 'the branch button') await button.click();
      else {
        await page.getByRole('button', { name: 'Restore' }).click();
        await page
          .getByRole('dialog', { name: 'Branches' })
          .getByRole('button', { name: 'Close branches' })
          .click();
      }
      await expect(view).toBeHidden();
      await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
      await button.click();
      await expect(
        page.getByRole('dialog', { name: 'Branches' })
      ).toBeVisible();
    });
  }

  const states = [
    { name: 'the pop-up', create: false, maximise: false, form: false },
    { name: 'the maximised view', create: false, maximise: true, form: false },
    { name: 'the New branch form', create: false, maximise: false, form: true },
    {
      name: 'the New branch form with a pending create',
      create: true,
      maximise: false,
      form: true,
    },
    {
      name: 'the maximised form with a pending create',
      create: true,
      maximise: true,
      form: true,
    },
  ];
  for (const state of states) {
    test(`leaves no scrim after ${state.name} is open while the window shrinks to a phone`, async ({
      page,
    }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto('/branches.html?docs=1&create=slow#/');
      const button = page.getByRole('button', { name: /^Branch:/ });
      await button.click();
      if (state.form) {
        await page.getByRole('button', { name: 'New branch' }).click();
        await page
          .getByRole('searchbox', { name: 'New branch name' })
          .fill('cms/x');
        if (state.create)
          await page.getByRole('button', { name: 'Create branch' }).click();
      }
      if (state.maximise)
        await page.getByRole('button', { name: 'Maximise' }).click();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(600);
      await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
      const blocked = await page.evaluate(() => {
        const at = document.elementFromPoint(195, 400);
        return (
          at?.closest(
            '[data-slot="foot-sheet-scrim"], [data-slot="dialog-overlay"]'
          ) !== null
        );
      });
      expect(blocked).toBe(false);
      await button.click();
      const sheet = page.getByRole('dialog', { name: 'Branches' });
      await expect(sheet).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(sheet).toBeHidden();
      await button.click();
      await expect(sheet).toBeVisible();
    });
  }

  test('keeps the header and search in view while a long list scrolls', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await page.goto('/branches.html?docs=1&many=40&create=ok#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    const popup = page.getByRole('dialog', { name: 'Branches' });
    await expect(popup).toBeVisible();
    await popup
      .getByRole('button', { name: 'many/branch-40' })
      .scrollIntoViewIfNeeded();
    await expect(
      popup.getByRole('button', { name: 'Maximise' })
    ).toBeInViewport();
    await expect(
      popup.getByRole('searchbox', { name: 'Search branches' })
    ).toBeInViewport();
    await expect(
      popup.getByRole('button', { name: 'New branch' })
    ).toBeInViewport();
    await popup.getByRole('button', { name: 'New branch' }).click();
    await expect(
      popup.getByRole('searchbox', { name: 'New branch name' })
    ).toBeFocused();
    await expect(
      popup.getByRole('button', { name: 'Create branch' })
    ).toBeInViewport();
  });

  for (const size of [
    { width: 1280, height: 380 },
    { width: 390, height: 330 },
  ]) {
    test(`keeps Create branch reachable on a ${size.width}x${size.height} screen`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.goto('/branches.html?docs=1&many=40&create=slow#/');
      await page.getByRole('button', { name: /^Branch:/ }).click();
      await page.getByRole('button', { name: 'New branch' }).click();
      await page
        .getByRole('searchbox', { name: 'New branch name' })
        .fill('cms/x');
      const create = page.getByRole('button', { name: 'Create branch' });
      await page.getByRole('searchbox', { name: 'New branch name' }).hover();
      const fits = () =>
        page.evaluate(() => {
          const button = [...document.querySelectorAll('button')].find(
            (b) => b.textContent === 'Create branch'
          );
          const box = button?.closest('[role="dialog"]');
          if (!button || !box) return false;
          const b = button.getBoundingClientRect();
          const c = box.getBoundingClientRect();
          return (
            b.bottom <= c.bottom + 1 &&
            b.top >= c.top - 1 &&
            b.bottom <= window.innerHeight
          );
        });
      for (let at = 0; at < 12 && !(await fits()); at += 1) {
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(100);
      }
      expect(await fits()).toBe(true);
      await create.click();
      await expect(
        page.getByRole('button', { name: 'Creating' })
      ).toBeVisible();
    });
  }

  test('keeps a long base-branch name inside its Start from segment', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(
      '/branches.html?docs=1&branch=feature/a-very-long-default-branch-name-for-start-from-check&create=ok#/'
    );
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: /^main/ }).click();
    await page.getByRole('button', { name: /^Branch: main/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    const spills = await page.evaluate(() => {
      const group = document.querySelector('[aria-label="Start from"]');
      const popup = group?.closest('[role="dialog"]');
      if (!group || !popup) return ['missing'];
      const p = popup.getBoundingClientRect();
      return [...group.querySelectorAll('button')].flatMap((b) => {
        const r = b.getBoundingClientRect();
        const out: string[] = [];
        if (
          b.scrollHeight > b.clientHeight + 1 ||
          b.scrollWidth > b.clientWidth + 1
        )
          out.push('text spills ' + b.textContent);
        if (r.right > p.right + 1)
          out.push('segment past the pop-up ' + b.textContent);
        return out;
      });
    });
    expect(spills).toEqual([]);
  });

  test('scrolls Retry into view when a create fails on a short screen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto('/branches.html?docs=1&many=30&create=fail#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await page.getByRole('button', { name: 'Create branch' }).click();
    const retry = page.getByRole('button', { name: 'Retry' });
    await expect(retry).toBeVisible();
    await page.waitForTimeout(400);
    const inside = await page.evaluate(() => {
      const button = [...document.querySelectorAll('button')].find(
        (b) => b.textContent === 'Retry'
      );
      const box = button?.closest('[role="dialog"]');
      if (!button || !box) return false;
      const b = button.getBoundingClientRect();
      const c = box.getBoundingClientRect();
      return (
        b.bottom <= c.bottom + 1 &&
        b.top >= c.top - 1 &&
        b.bottom <= window.innerHeight
      );
    });
    expect(inside).toBe(true);
  });

  test('keeps focus in the fields after Clear and Back in the maximised view', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=ok#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'Maximise' }).click();
    const view = page.locator('[data-slot="branch-maximised"]');
    await expect(view).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    const search = view.getByRole('searchbox', { name: 'Search branches' });
    await search.fill('feat');
    await view.getByRole('button', { name: 'Clear search' }).click();
    await expect(search).toBeFocused();
    await view.getByRole('button', { name: 'New branch' }).click();
    const name = view.getByRole('searchbox', { name: 'New branch name' });
    await name.fill('cms/x');
    await view.getByRole('button', { name: 'Clear name' }).click();
    await expect(name).toBeFocused();
    await view.getByRole('button', { name: 'Back to branches' }).click();
    await expect(search).toBeFocused();
  });

  test('keeps the current segment readable beside a long base-branch name', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(
      '/branches.html?docs=1&many=2&branch=feature/a-very-long-default-branch-name-for-start-from-check&create=ok#/'
    );
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: /many\/branch-1/ }).click();
    await page.getByRole('button', { name: /^Branch: many\/branch-1/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    const broken = await page.evaluate(() => {
      const group = document.querySelector('[aria-label="Start from"]');
      if (!group) return ['missing'];
      return [...group.querySelectorAll('button')]
        .filter((b) => b.getBoundingClientRect().width < 120)
        .map((b) => b.textContent);
    });
    expect(broken).toEqual([]);
  });

  test('lays short Start from options in one row with soft corners, and moves between them with the arrow keys', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&many=2&create=ok#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: /many\/branch-1/ }).click();
    await page.getByRole('button', { name: /^Branch: many\/branch-1/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    const group = page.getByRole('group', { name: 'Start from' });
    const options = group.getByRole('button');
    await expect(options).toHaveCount(2);
    const [a, b] = await Promise.all([
      options.nth(0).boundingBox(),
      options.nth(1).boundingBox(),
    ]);
    expect(Math.abs((a?.y ?? 0) - (b?.y ?? 99))).toBeLessThanOrEqual(1);
    const radius = await group.evaluate((el) =>
      parseFloat(getComputedStyle(el).borderTopLeftRadius)
    );
    expect(radius).toBeLessThan(40);
    await options.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(options.nth(1)).toBeFocused();
  });
});
