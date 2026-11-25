import { expect, test } from '@playwright/test';

const DESKTOP = { width: 1280, height: 800 };
const TABLET = { width: 768, height: 900 };
const URL = '/branches.html?docs=1&create=slow#/';

type Locator = import('@playwright/test').Locator;
/** Resolves once the element's box is the same on two polls in a row (animations done). */
const settled = async (locator: Locator) => {
  let last = '';
  await expect
    .poll(async () => {
      const now = JSON.stringify(await locator.boundingBox());
      const same = now === last;
      last = now;
      return same;
    })
    .toBe(true);
};
const nextFrames = (page: import('@playwright/test').Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );

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
    await settled(popup);
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

  test('closes the maximised view on Escape while the form create is busy', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=slow#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'Maximise' }).click();
    const view = page.locator('[data-slot="branch-maximised"]');
    await view.getByRole('button', { name: 'New branch' }).click();
    await view
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await view.getByRole('button', { name: 'Create branch' }).click();
    await page.keyboard.press('Escape');
    await expect(view).toBeHidden();
  });

  test('puts focus back on the branch button after picking a branch in the maximised view', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&many=3#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'Maximise' }).click();
    const view = page.locator('[data-slot="branch-maximised"]');
    await view.locator('[data-branch-row]:not([aria-current])').first().click();
    await expect(view).toBeHidden();
    await expect(page.getByRole('button', { name: /^Branch:/ })).toBeFocused();
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
    await page.getByRole('radio', { name: /^feature\/news/ }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    await expect(
      page.getByRole('radio', { name: /^feature\/news/ })
    ).toBeChecked();
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

  test('leaves focus on the control you clicked when you dismiss the pop-up by clicking outside', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(URL);
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    const outside = page.getByRole('button', { name: 'Toggle Sidebar' });
    await outside.click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    await expect(outside).toBeFocused();
  });

  test('still switches to the new branch when Tab is pressed during the create in the pop-up', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=slow#/');
    await openFrame(page, false);
    const view = frameOf(page, false);
    await view.getByRole('button', { name: 'New branch' }).click();
    await view
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await view.getByRole('button', { name: 'Create branch' }).click();
    await expect(view.getByRole('button', { name: 'Creating' })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'Branch: cms/x' })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('cms/x is ready')).toHaveCount(0);
  });

  test('returns focus to the branch button when crossing 768px closes the pop-up', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(URL);
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    await expect(page.getByRole('button', { name: /^Branch:/ })).toBeFocused();
  });

  test('closes the pop-up with one Escape from the Maximise button, tooltip and all', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto(URL);
    await page.getByRole('button', { name: /^Branch:/ }).click();
    const popup = page.getByRole('dialog', { name: 'Branches' });
    await expect(popup).toBeVisible();
    await expect(
      popup.getByRole('searchbox', { name: 'Search branches' })
    ).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(popup.getByRole('button', { name: 'Maximise' })).toBeFocused();
    await expect(
      page.locator('[data-slot="tooltip-content"]', { hasText: 'Maximise' })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();
  });

  test('keeps the ready note readable on a 375px phone with a long branch name', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto('/branches.html?docs=1&create=failonce#/');
    await openFrame(page, false);
    const sheet = frameOf(page, false);
    const long = 'cms/ready-later-with-a-long-name';
    await makeBranch(page, sheet, long);
    await page.keyboard.press('Escape');
    await expect(page.getByText(`Couldn't create ${long}`)).toBeVisible();
    await openFrame(page, false);
    const reopened = frameOf(page, false);
    const name = reopened.getByRole('searchbox', { name: 'New branch name' });
    await name.fill('cms/b');
    await reopened
      .locator('[data-slot="branch-outcome-note"]')
      .getByRole('button', { name: 'Retry' })
      .click();
    await expect(reopened.getByText('Creating', { exact: false })).toBeHidden({
      timeout: 8000,
    });
    await name.fill('');
    const text = reopened
      .locator('[data-slot="branch-outcome-note"] span')
      .first();
    await expect(text).toHaveText(`${long} is ready`);
    const box = await text.boundingBox();
    expect(box?.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(40);
  });

  test('wraps Tab inside the maximised view while Create branch is disabled', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=ok#/');
    await openFrame(page, true);
    const view = frameOf(page, true);
    await view.getByRole('button', { name: 'New branch' }).click();
    await view.getByRole('button', { name: 'Back to branches' }).focus();
    await page.keyboard.press('Tab');
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.activeElement?.closest(
              '[data-slot="branch-maximised"]'
            ) !== null
        )
      )
      .toBe(true);
  });

  test('keeps Tab inside the maximised view while a create runs', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=slow#/');
    await openFrame(page, true);
    const view = frameOf(page, true);
    await view.getByRole('button', { name: 'New branch' }).click();
    await view
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await view.getByRole('button', { name: 'Create branch' }).click();
    const busy = view.getByRole('button', { name: 'Creating' });
    await expect(busy).toBeVisible();
    await busy.focus();
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(
      () =>
        document.activeElement?.closest('[data-slot="branch-maximised"]') !==
        null
    );
    expect(inside).toBe(true);
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
      await expect
        .poll(async () => {
          if (await fits()) return true;
          await page.mouse.wheel(0, 300);
          return false;
        })
        .toBe(true);
      await create.click();
      await expect(
        page.getByRole('button', { name: 'Creating' })
      ).toBeVisible();
    });
  }

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
    await settled(retry);
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

  test('has the action row in view when New branch opens on a short screen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto('/branches.html?docs=1&many=30&create=ok#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await settled(page.getByRole('button', { name: 'Create branch' }));
    const inside = await page.evaluate(() => {
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
    expect(inside).toBe(true);
  });

  test('keeps focus in the form after Retry, and Escape still closes the maximised view', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=fail#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'Maximise' }).click();
    const view = page.locator('[data-slot="branch-maximised"]');
    await view.getByRole('button', { name: 'New branch' }).click();
    await view
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await view.getByRole('button', { name: 'Create branch' }).click();
    const retry = view.getByRole('button', { name: 'Retry' });
    await expect(retry).toBeVisible();
    await retry.click();
    await expect(view.getByRole('button', { name: 'Creating' })).toBeFocused();
    await expect(retry).toBeVisible();
    await expect(retry).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(view).toBeHidden();
  });

  for (const size of [
    { width: 1280, height: 400 },
    { width: 768, height: 400 },
  ]) {
    test(`keeps the action row clear of the Status bar after a failure in the maximised view at ${size.width}x${size.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.goto('/branches.html?docs=1&many=30&create=fail#/');
      await page.getByRole('button', { name: /^Branch:/ }).click();
      await page.getByRole('button', { name: 'Maximise' }).click();
      const view = page.locator('[data-slot="branch-maximised"]');
      await view.getByRole('button', { name: 'New branch' }).click();
      await view
        .getByRole('searchbox', { name: 'New branch name' })
        .fill('cms/x');
      await view.getByRole('button', { name: 'Create branch' }).click();
      const retry = view.getByRole('button', { name: 'Retry' });
      await expect(retry).toBeVisible();
      await settled(retry);
      const clear = await page.evaluate(() => {
        const button = [...document.querySelectorAll('button')].find(
          (b) => b.textContent === 'Retry'
        );
        const bar = document.querySelector('[aria-label="Status bar"]');
        if (!button || !bar) return false;
        const b = button.getBoundingClientRect();
        const hit = document.elementFromPoint(
          b.x + b.width / 2,
          b.y + b.height / 2
        );
        return (
          b.bottom <= bar.getBoundingClientRect().top + 1 &&
          button.contains(hit)
        );
      });
      expect(clear).toBe(true);
    });
  }

  test('has the action row in view after Maximise and after Restore with the form open', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto('/branches.html?docs=1&many=30&create=ok#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    const rowInView = () =>
      page.evaluate(() => {
        const button = [...document.querySelectorAll('button')].find(
          (b) => b.textContent === 'Create branch'
        );
        const bar = document.querySelector('[aria-label="Status bar"]');
        if (!button || !bar) return false;
        const b = button.getBoundingClientRect();
        const hit = document.elementFromPoint(
          b.x + b.width / 2,
          b.y + b.height / 2
        );
        return (
          b.bottom <= bar.getBoundingClientRect().top + 1 &&
          button.contains(hit)
        );
      });
    const view = page.locator('[data-slot="branch-maximised"]');
    await page.getByRole('button', { name: 'Maximise' }).click();
    await expect(view).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    await settled(view);
    expect(await rowInView()).toBe(true);
    await view.getByRole('button', { name: 'Restore' }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    await settled(page.getByRole('dialog', { name: 'Branches' }));
    expect(await rowInView()).toBe(true);
  });

  test('puts focus in the name field after Restore with the form open', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=ok#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    const view = page.locator('[data-slot="branch-maximised"]');
    await page.getByRole('button', { name: 'Maximise' }).click();
    await expect(view).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    await view.getByRole('button', { name: 'Restore' }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    await expect(
      page.getByRole('searchbox', { name: 'New branch name' })
    ).toBeFocused();
  });

  const LONG =
    'feature/a-very-long-branch-name-that-keeps-going-past-the-row-width-0123456789';
  const frames = [
    {
      name: '320px phone sheet',
      size: { width: 320, height: 640 },
      maximise: false,
    },
    {
      name: '768px pop-up',
      size: { width: 768, height: 900 },
      maximise: false,
    },
    {
      name: '768px maximised view',
      size: { width: 768, height: 900 },
      maximise: true,
    },
    {
      name: '1440px pop-up',
      size: { width: 1440, height: 900 },
      maximise: false,
    },
    {
      name: '1440px maximised view',
      size: { width: 1440, height: 900 },
      maximise: true,
    },
  ];

  const openStartFrom = async (
    page: import('@playwright/test').Page,
    maximise: boolean,
    branch?: string
  ) => {
    const query = branch ? '&branch=' + branch : '';
    await page.goto('/branches.html?docs=1&many=2' + query + '&create=slow#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: /^many\/branch-1/ }).click();
    await page.getByRole('button', { name: /^Branch: many\/branch-1/ }).click();
    if (maximise) {
      await page.getByRole('button', { name: 'Maximise' }).click();
      await expect(
        page.locator('[data-slot="branch-maximised"]')
      ).toBeVisible();
      await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    }
    await page.getByRole('button', { name: 'New branch' }).click();
  };

  const layout = (page: import('@playwright/test').Page) =>
    page.evaluate(() => {
      const group = document.querySelector(
        '[role="radiogroup"][aria-label="Start from"]'
      );
      if (!group) return { problems: ['no radiogroup'] };
      const rows = [...group.querySelectorAll('label')];
      const frame = group.closest(
        '[role="dialog"], [data-slot="branch-maximised"]'
      );
      let body: Element | null = group.parentElement;
      while (body && getComputedStyle(body).overflowY !== 'auto')
        body = body.parentElement;
      const listRow =
        document.querySelector('[data-branch-row]')?.parentElement;
      const listRadius = listRow
        ? getComputedStyle(listRow.firstElementChild as Element)
            .borderTopLeftRadius
        : '';
      const problems: string[] = [];
      if (rows.length !== 2) problems.push('rows ' + rows.length);
      const [a, b] = rows.map((row) => row.getBoundingClientRect());
      if (a && b) {
        if (b.top < a.bottom - 1) problems.push('second row not below first');
        if (Math.abs(a.left - b.left) > 1 || Math.abs(a.width - b.width) > 1)
          problems.push('rows differ in left or width');
      }
      const box = frame ? frame.getBoundingClientRect() : undefined;
      const padRight = frame
        ? parseFloat(getComputedStyle(frame).paddingRight)
        : 0;
      for (const row of rows) {
        if (row.scrollWidth > row.clientWidth) problems.push('row scrollWidth');
        if (row.scrollHeight > row.clientHeight)
          problems.push('row scrollHeight');
        const r = row.getBoundingClientRect();
        if (box && r.right > box.right - padRight + 1)
          problems.push('row past the frame content box');
        const radius = getComputedStyle(row).borderTopLeftRadius;
        if (listRadius && radius !== listRadius)
          problems.push('radius ' + radius + ' vs ' + listRadius);
      }
      if (body && body.scrollWidth > body.clientWidth)
        problems.push('body scrolls sideways');
      return { problems };
    });

  const arrows = async (page: import('@playwright/test').Page) => {
    const first = page.getByRole('radio').first();
    const second = page.getByRole('radio').nth(1);
    await expect(first).toBeChecked();
    await first.focus();
    await page.keyboard.press('ArrowDown');
    await expect(second).toBeChecked();
    await page.keyboard.press('ArrowUp');
    await expect(first).toBeChecked();
    await page.keyboard.press('ArrowRight');
    await expect(second).toBeChecked();
    await page.keyboard.press('ArrowLeft');
    await expect(first).toBeChecked();
    await page.keyboard.press('ArrowUp');
    await expect(second).toBeChecked();
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeChecked();
  };

  for (const frame of frames) {
    for (const names of ['a long default branch name', 'short names']) {
      test(
        'lays Start from out as full-width radio rows in the ' +
          frame.name +
          ' with ' +
          names,
        async ({ page }) => {
          await page.setViewportSize(frame.size);
          await openStartFrom(
            page,
            frame.maximise,
            names === 'short names' ? undefined : LONG
          );
          const group = page.getByRole('radiogroup', { name: 'Start from' });
          await expect(group.getByRole('radio')).toHaveCount(2);
          await expect(group.getByRole('radio').first()).toBeChecked();
          await expect(group.getByRole('radio').first()).toHaveAccessibleName(
            /\(current\)/
          );
          expect((await layout(page)).problems).toEqual([]);
          await arrows(page);
        }
      );
    }
  }

  test('keeps the Start from layout and arrow keys after Maximise then Restore', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await openStartFrom(page, false, LONG);
    expect((await layout(page)).problems).toEqual([]);
    await page.getByRole('button', { name: 'Maximise' }).click();
    const view = page.locator('[data-slot="branch-maximised"]');
    await expect(view).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    expect((await layout(page)).problems).toEqual([]);
    await view.getByRole('button', { name: 'Restore' }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    expect((await layout(page)).problems).toEqual([]);
    await arrows(page);
  });

  test('disables both Start from radios while a create is pending', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await openStartFrom(page, false, LONG);
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await page.getByRole('button', { name: 'Create branch' }).click();
    await expect(page.getByRole('button', { name: 'Creating' })).toBeVisible();
    for (const radio of await page.getByRole('radio').all()) {
      await expect(radio).toHaveAttribute('aria-disabled', 'true');
    }
  });

  type Page = import('@playwright/test').Page;
  const FRAMES = [
    { name: 'pop-up', size: DESKTOP, maximise: false },
    { name: 'maximised view', size: DESKTOP, maximise: true },
    { name: 'phone sheet', size: { width: 390, height: 844 }, maximise: false },
  ];
  const toastCount = (page: Page) =>
    page.locator('[data-sonner-toast]').count();
  const frameOf = (page: Page, maximise: boolean) =>
    maximise
      ? page.locator('[data-slot="branch-maximised"]')
      : page.getByRole('dialog', { name: 'Branches' });
  const openFrame = async (page: Page, maximise: boolean) => {
    await page.getByRole('button', { name: /^Branch:/ }).click();
    if (maximise) {
      await page.getByRole('button', { name: 'Maximise' }).click();
      await expect(frameOf(page, true)).toBeVisible();
    }
  };
  const makeBranch = async (
    page: Page,
    frame: ReturnType<typeof frameOf>,
    name = 'cms/x'
  ) => {
    await frame.getByRole('button', { name: 'New branch' }).click();
    await frame.getByRole('searchbox', { name: 'New branch name' }).fill(name);
    await frame.getByRole('button', { name: 'Create branch' }).click();
  };

  for (const frame of FRAMES) {
    test(`shows the not-ready note inside the ${frame.name}, with no toast`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=unready#/');
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await makeBranch(page, view);
      await expect(
        view.getByText(
          "cms/x isn't ready yet. It was made. You can switch to it after reloading the page."
        )
      ).toBeVisible();
      await expect(view.getByRole('button', { name: 'Dismiss' })).toBeVisible();
      expect(await toastCount(page)).toBe(0);
      await view.getByRole('button', { name: 'Dismiss' }).click();
      await expect(
        view.getByRole('searchbox', { name: 'Search branches' })
      ).toBeFocused();
    });

    test(`keeps an unready branch disabled, with no spinner, in the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=unready#/');
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await makeBranch(page, view);
      await view.getByRole('button', { name: 'Dismiss' }).click();
      const row = view.locator('[data-branch-row]', { hasText: 'cms/x' });
      await expect(row).toHaveCount(1);
      await expect(row).toHaveAttribute('aria-disabled', 'true');
      await expect(row).toContainText('Reload to switch');
      await expect(row).not.toContainText('Getting ready');
      await expect(row.locator('[class*="animate-spin"]')).toHaveCount(0);
      await row.click({ force: true });
      await expect(row).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(
        page.getByRole('button', { name: 'Branch: feature/news' })
      ).toBeVisible();
    });

    test(`keeps the New branch form free while the note's Retry runs in the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=fail#/');
      await openFrame(page, false);
      await makeBranch(page, frameOf(page, false));
      await page.keyboard.press('Escape');
      await expect(page.getByText("Couldn't create cms/x")).toBeVisible();
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      const note = view.locator('[data-slot="branch-outcome-note"]');
      const open = view.getByRole('button', { name: 'New branch' });
      if (await open.isVisible()) await open.click();
      const name = view.getByRole('searchbox', { name: 'New branch name' });
      await name.fill('cms/b');
      await note.getByRole('button', { name: 'Retry' }).click();
      await expect(view.getByText('Creating cms/x…')).toBeVisible();
      await expect(name).toBeEditable();
      await expect(name).toHaveValue('cms/b');
      await expect(
        view.getByRole('button', { name: 'Create branch' })
      ).toBeDisabled();
      await expect(
        view.getByText('Wait for cms/x to finish first')
      ).toBeVisible();
      await expect(view.getByText('Creating cms/x…')).toBeHidden({
        timeout: 5000,
      });
      await expect(name).toHaveValue('cms/b');
      await expect(
        view.getByRole('form', { name: 'New branch form' })
      ).toBeVisible();
      await expect(
        view.getByRole('button', { name: 'Create branch' })
      ).toBeEnabled();
    });

    test(`opens as the list again after the note's Retry switched with an empty form in the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=failonce#/');
      await openFrame(page, false);
      await makeBranch(page, frameOf(page, false));
      await page.keyboard.press('Escape');
      await expect(page.getByText("Couldn't create cms/x")).toBeVisible();
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      const open = view.getByRole('button', { name: 'New branch' });
      if (await open.isVisible()) await open.click();
      const name = view.getByRole('searchbox', { name: 'New branch name' });
      const retry = view
        .locator('[data-slot="branch-outcome-note"]')
        .getByRole('button', { name: 'Retry' });
      await name.fill('');
      await retry.click();
      await expect(
        page.getByRole('button', { name: 'Branch: cms/x' })
      ).toBeVisible({ timeout: 8000 });
      await expect(
        page.getByRole('button', { name: 'Branch: cms/x' })
      ).toBeFocused();
      await page.getByRole('button', { name: 'Branch: cms/x' }).click();
      const reopened = frameOf(page, false);
      await expect(
        reopened.getByRole('button', { name: 'New branch' })
      ).toBeVisible();
      await expect(
        reopened.getByRole('form', { name: 'New branch form' })
      ).toHaveCount(0);
    });

    test(`holds the note's ready outcome while the form keeps a typed name in the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=failonce#/');
      await openFrame(page, false);
      await makeBranch(page, frameOf(page, false));
      await page.keyboard.press('Escape');
      await expect(page.getByText("Couldn't create cms/x")).toBeVisible();
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      const open = view.getByRole('button', { name: 'New branch' });
      if (await open.isVisible()) await open.click();
      const name = view.getByRole('searchbox', { name: 'New branch name' });
      const retry = view
        .locator('[data-slot="branch-outcome-note"]')
        .getByRole('button', { name: 'Retry' });
      await name.fill('cms/b');
      await retry.click();
      await expect(view.getByText('Creating cms/x…')).toBeHidden({
        timeout: 8000,
      });
      await expect(name).toHaveValue('cms/b');
      await name.fill('');
      await expect(view.getByText('cms/x is ready')).toBeVisible();
      await expect(
        view.getByRole('form', { name: 'New branch form' })
      ).toBeVisible();
      await expect(name).toBeFocused();
    });

    test(`keeps the typed name when the form create fails while the ${frame.name} is closed`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=fail#/');
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await makeBranch(page, view);
      await page.keyboard.press('Escape');
      await expect(page.getByText("Couldn't create cms/x")).toBeVisible();
      await openFrame(page, frame.maximise);
      await expect(
        frameOf(page, frame.maximise).getByRole('searchbox', {
          name: 'New branch name',
        })
      ).toHaveValue('cms/x');
    });

    test(`returns focus to the branch button when a form create switches and closes the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=ok#/');
      await openFrame(page, frame.maximise);
      await makeBranch(page, frameOf(page, frame.maximise));
      const button = page.getByRole('button', { name: 'Branch: cms/x' });
      await expect(button).toBeVisible({ timeout: 10000 });
      await expect(button).toBeFocused();
    });

    test(`wraps a long branch name in the inline failure in the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=fail#/');
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await makeBranch(page, view, `cms/${'a'.repeat(90)}`);
      const alert = view
        .getByRole('alert')
        .filter({ hasText: /Couldn't create/ });
      await expect(alert).toBeVisible();
      const [scroll, client] = await alert.evaluate((el) => [
        el.scrollWidth,
        el.clientWidth,
      ]);
      expect(scroll).toBeLessThanOrEqual(client);
    });

    test(`keeps the Creating button in place while the branch gets ready in the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=slow#/');
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await view.getByRole('button', { name: 'New branch' }).click();
      await view
        .getByRole('searchbox', { name: 'New branch name' })
        .fill('cms/x');
      await view.getByRole('button', { name: 'Create branch' }).click();
      const busy = view.getByRole('button', { name: 'Creating' });
      const form = view.getByRole('form', { name: 'New branch form' });
      await expect(busy).toBeVisible();
      await settled(busy);
      // The button's distance below the form's top, so a scroll of the frame does not count.
      const gap = async () => {
        const [b, f] = await Promise.all([
          busy.boundingBox(),
          form.boundingBox(),
        ]);
        return b && f ? Math.round(b.y - f.y) : undefined;
      };
      const first = await gap();
      let samples = 0;
      while (await busy.isVisible()) {
        const now = await gap();
        if (now !== undefined) expect(now).toBe(first);
        samples += 1;
        if (samples > 400) break;
      }
      expect(samples).toBeGreaterThan(1);
    });

    test(`keeps Create and Retry in place when the failure line appears in the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=fail#/');
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await view.getByRole('button', { name: 'New branch' }).click();
      await view
        .getByRole('searchbox', { name: 'New branch name' })
        .fill('cms/x');
      const form = view.getByRole('form', { name: 'New branch form' });
      const below = async (name: string) => {
        const button = view.getByRole('button', { name });
        await expect(button).toBeVisible();
        await settled(button);
        const [b, f] = await Promise.all([
          button.boundingBox(),
          form.boundingBox(),
        ]);
        return b && f ? Math.round(b.y - f.y) : undefined;
      };
      const before = await below('Create branch');
      await view.getByRole('button', { name: 'Create branch' }).click();
      await expect(view.getByRole('alert')).toBeVisible();
      expect(await below('Retry')).toBe(before);
    });

    test(`resets the form and switches when the note's Retry makes a branch whose form create failed while the ${frame.name} was closed`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=failonce#/');
      await openFrame(page, frame.maximise);
      await makeBranch(page, frameOf(page, frame.maximise));
      await page.keyboard.press('Escape');
      await expect(page.getByText("Couldn't create cms/x")).toBeVisible();
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await view.getByRole('button', { name: 'Retry' }).click();
      await expect(
        page.getByRole('button', { name: 'Branch: cms/x' })
      ).toBeVisible();
      await expect(page.getByText(/already exists/)).toHaveCount(0);
    });

    test(`takes the failure toast back after the failed form is emptied and the ${frame.name} closed`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=fail#/');
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await makeBranch(page, view);
      await expect(view.getByText(/Couldn't create cms\/x\. Try/)).toBeVisible({
        timeout: 5000,
      });
      await view.getByRole('searchbox', { name: 'New branch name' }).fill('');
      await page.keyboard.press('Escape');
      await expect(
        page.locator('[data-sonner-toast]').getByText("Couldn't create cms/x")
      ).toBeVisible();
      await openFrame(page, frame.maximise);
      await expect(
        frameOf(page, frame.maximise).getByText(/Couldn't create cms\/x\. Try/)
      ).toBeVisible();
      await expect.poll(() => toastCount(page)).toBe(0);
    });

    test(`keeps Create branch off for an empty name in the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=ok#/');
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await view.getByRole('button', { name: 'New branch' }).click();
      const create = view.getByRole('button', { name: 'Create branch' });
      const name = view.getByRole('searchbox', { name: 'New branch name' });
      await expect(create).toBeDisabled();
      await name.press('Enter');
      await expect(
        view.getByRole('form', { name: 'New branch form' })
      ).toBeVisible();
      await name.fill('cms/y');
      await expect(create).toBeEnabled();
      await name.fill('');
      await expect(create).toBeDisabled();
      await expect(view.getByText('Enter a branch name.')).toBeVisible();
    });

    test(`shows the failure note with Retry inside the ${frame.name} after a toast-started failure, with no toast`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=fail#/');
      await openFrame(page, false);
      await makeBranch(page, frameOf(page, false));
      await page.keyboard.press('Escape');
      await expect(page.getByText("Couldn't create cms/x")).toBeVisible();
      await openFrame(page, frame.maximise);
      const view = frameOf(page, frame.maximise);
      await expect(
        view.getByText("Couldn't create cms/x. Try again.")
      ).toBeVisible();
      await expect.poll(() => toastCount(page)).toBe(0);
      await view.getByRole('button', { name: 'Retry' }).click();
      await expect(
        view.getByText("Couldn't create cms/x. Try again.")
      ).toBeVisible({ timeout: 5000 });
      expect(await toastCount(page)).toBe(0);
    });
  }

  test('sends one toast when the switcher closes with the note, and takes it back on reopen', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=unready#/');
    await openFrame(page, false);
    const view = frameOf(page, false);
    await makeBranch(page, view);
    await expect(view.getByText(/isn't ready yet\. It was made/)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      page.getByText("cms/x isn't ready yet", { exact: true })
    ).toBeVisible();
    expect(await toastCount(page)).toBe(1);
    await openFrame(page, false);
    await expect(
      frameOf(page, false).getByText(/isn't ready yet\. It was made/)
    ).toBeVisible();
    await expect.poll(() => toastCount(page)).toBe(0);
    await frameOf(page, false).getByRole('button', { name: 'Dismiss' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    await nextFrames(page);
    expect(await toastCount(page)).toBe(0);
  });

  for (const width of [1280, 800])
    test(`keeps the maximised view above the Errors pane at ${width}px, with Close branches clickable`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(
        '/branches.html?docs=1#/collections/post/content%2Fposts%2Fpost-01.mdx'
      );
      const title = page.getByRole('textbox', { name: /^Title/ });
      await title.fill('');
      await page
        .locator('[data-slot=form-bar]')
        .getByRole('button', { name: /^(Save|Resolve)/ })
        .click();
      await expect(
        page.locator('[data-slot="error-summary-pane"]').first()
      ).toBeVisible();
      await page.getByRole('button', { name: /^Branch:/ }).click();
      await page.getByRole('button', { name: 'Maximise' }).click();
      const view = page.locator('[data-slot="branch-maximised"]');
      await expect(view).toBeVisible();
      const onTop = await page.evaluate(() => {
        const view = document.querySelector('[data-slot="branch-maximised"]');
        if (!view) return false;
        const r = view.getBoundingClientRect();
        return [r.right - 6, r.right - 40].every((x) => {
          const hit = document.elementFromPoint(x, r.top + r.height / 2);
          return hit !== null && view.contains(hit);
        });
      });
      expect(onTop).toBe(true);
      await view.getByRole('button', { name: 'Close branches' }).click();
      await expect(view).toBeHidden();
    });

  test('keeps the note and its Retry inside the switcher when the branch name is long', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/branches.html?docs=1&create=fail#/');
    await openFrame(page, false);
    await makeBranch(page, frameOf(page, false), `cms/${'a'.repeat(120)}`);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Retry' }).click();
    await expect(page.getByText(/^Couldn't create cms\/a+$/)).toBeVisible({
      timeout: 5000,
    });
    await page.keyboard.press('Escape');
    await openFrame(page, false);
    const note = page.locator('[data-slot="branch-outcome-note"]');
    await expect(note).toBeVisible({ timeout: 5000 });
    const fits = await note.evaluate((el) => {
      const text = el.querySelector('span') as HTMLElement;
      const retry = el.querySelector('button')?.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      return (
        text.scrollWidth <= text.clientWidth &&
        !!retry &&
        retry.right <= box.right + 1 &&
        document.documentElement.scrollWidth <= window.innerWidth
      );
    });
    expect(fits).toBe(true);
  });

  test('leaves the Toaster layer as it was: no lift above the switcher', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=unready#/');
    await openFrame(page, true);
    await makeBranch(page, frameOf(page, true));
    await expect(
      frameOf(page, true).getByText(/isn't ready yet/)
    ).toBeVisible();
    const layer = await page.evaluate(() => {
      const toaster = document.querySelector('[data-sonner-toaster]');
      return toaster ? getComputedStyle(toaster).zIndex : 'none';
    });
    expect(['40', 'none']).toContain(layer);
  });

  test('keeps a page toast from covering a modal opened over the phone sheet', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(
      '/branches.html?docs=1&fail=branch-gone#/collections/post/content%2Fposts%2Fpost-01.mdx'
    );
    await page.getByRole('textbox', { name: /^Title/ }).fill('Edited');
    await page
      .locator('[data-slot=form-bar]')
      .getByRole('button', { name: /^Save/ })
      .click();
    await expect(page.getByText(/Couldn't save/).first()).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+k' : 'Control+k'
    );
    await expect
      .poll(() =>
        page.evaluate(() => {
          const field = document.querySelector<HTMLElement>(
            '[data-slot=foot-sheet]:not([hidden]) input'
          );
          if (!field) return 'no field';
          const r = field.getBoundingClientRect();
          const hit = document.elementFromPoint(
            r.x + r.width / 2,
            r.y + r.height / 2
          );
          return hit?.closest('[data-sonner-toast]') === null
            ? 'dialog'
            : 'toast';
        })
      )
      .toBe('dialog');
  });
});
