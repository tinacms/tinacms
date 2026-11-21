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

  test('has the action row in view when New branch opens on a short screen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto('/branches.html?docs=1&many=30&create=ok#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page.waitForTimeout(400);
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
      await page.waitForTimeout(400);
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
    await page.waitForTimeout(400);
    expect(await rowInView()).toBe(true);
    await view.getByRole('button', { name: 'Restore' }).click();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeVisible();
    await page.waitForTimeout(400);
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

  const toastOnTop = (page: import('@playwright/test').Page, text: string) =>
    page.evaluate((words) => {
      const toast = [...document.querySelectorAll('[data-sonner-toast]')].find(
        (el) => el.textContent?.includes(words)
      );
      if (!toast) return false;
      const r = toast.getBoundingClientRect();
      const hit = document.elementFromPoint(
        r.x + r.width / 2,
        r.y + r.height / 2
      );
      return hit !== null && toast.contains(hit);
    }, text);

  for (const frame of [
    { name: 'pop-up', size: DESKTOP, maximise: false },
    { name: 'maximised view', size: DESKTOP, maximise: true },
    { name: 'phone sheet', size: { width: 390, height: 844 }, maximise: false },
  ]) {
    test(`shows the not-ready toast on top of the ${frame.name}`, async ({
      page,
    }) => {
      await page.setViewportSize(frame.size);
      await page.goto('/branches.html?docs=1&create=unready#/');
      await page.getByRole('button', { name: /^Branch:/ }).click();
      if (frame.maximise) {
        await page.getByRole('button', { name: 'Maximise' }).click();
        await expect(
          page.locator('[data-slot="branch-maximised"]')
        ).toBeVisible();
        await expect(
          page.getByRole('dialog', { name: 'Branches' })
        ).toBeHidden();
      }
      await page.getByRole('button', { name: 'New branch' }).click();
      await page
        .getByRole('searchbox', { name: 'New branch name' })
        .fill('cms/x');
      await page.getByRole('button', { name: 'Create branch' }).click();
      await expect(page.getByText("cms/x isn't ready yet")).toBeVisible();
      await expect
        .poll(() => toastOnTop(page, "cms/x isn't ready yet"))
        .toBe(true);
    });
  }

  test('can press Retry on the failure toast while the maximised view is open', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=fail#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await page.getByRole('button', { name: 'Create branch' }).click();
    await page
      .getByRole('dialog', { name: 'Branches' })
      .getByRole('button', { name: 'Close branches' })
      .click();
    await expect(page.getByText("Couldn't create cms/x")).toBeVisible();
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'Maximise' }).click();
    await expect(page.locator('[data-slot="branch-maximised"]')).toBeVisible();
    await expect
      .poll(() => toastOnTop(page, "Couldn't create cms/x"))
      .toBe(true);
    const retry = page.getByRole('button', { name: 'Retry' });
    await retry.click({ timeout: 3000 });
    await expect(
      page
        .locator('[data-slot="branch-maximised"]')
        .getByText("Couldn't create cms/x. Check your connection, then retry.")
    ).toBeVisible({ timeout: 5000 });
  });

  test('keeps the maximised view above the Errors pane, with Close branches clickable', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
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
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/branches.html?docs=1&create=fail#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/' + 'a'.repeat(80));
    await page.getByRole('button', { name: 'Create branch' }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Retry' }).click();
    await page.getByRole('button', { name: /^Branch:/ }).click();
    const note = page.locator('[data-slot="branch-failure-note"]');
    await expect(note).toBeVisible({ timeout: 5000 });
    const fits = await note.evaluate((el) => {
      const text = el.firstElementChild as HTMLElement;
      const retry = el.querySelector('button')?.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      return (
        text.scrollWidth <= text.clientWidth &&
        !!retry &&
        retry.right <= box.right + 1
      );
    });
    expect(fits).toBe(true);
  });

  test('lets a modal dim the toast again while the maximised view is open', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/branches.html?docs=1&create=unready#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'Maximise' }).click();
    const view = page.locator('[data-slot="branch-maximised"]');
    await expect(view).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    await view.getByRole('button', { name: 'New branch' }).click();
    await view
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await view.getByRole('button', { name: 'Create branch' }).click();
    await expect
      .poll(() => toastOnTop(page, "cms/x isn't ready yet"))
      .toBe(true);
    await page.keyboard.press(
      process.platform === 'darwin' ? 'Meta+k' : 'Control+k'
    );
    await expect(page.getByRole('dialog', { name: /Search/ })).toBeVisible();
    await expect
      .poll(() => toastOnTop(page, "cms/x isn't ready yet"))
      .toBe(false);
  });

  test('lets a phone modal dim the toast too, after the switcher sheet is closed', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/branches.html?docs=1&create=unready#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await page.getByRole('button', { name: 'Create branch' }).click();
    await expect
      .poll(() => toastOnTop(page, "cms/x isn't ready yet"))
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Branches' })).toBeHidden();
    await page.getByRole('button', { name: 'Search' }).first().click();
    await expect(
      page.locator('[data-slot=foot-sheet]:not([hidden])')
    ).toBeVisible();
    await expect
      .poll(() => toastOnTop(page, "cms/x isn't ready yet"))
      .toBe(false);
  });

  test('drops the toast lift when another phone sheet opens over the switcher sheet', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/branches.html?docs=1&create=unready#/');
    await page.getByRole('button', { name: /^Branch:/ }).click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await page
      .getByRole('searchbox', { name: 'New branch name' })
      .fill('cms/x');
    await page.getByRole('button', { name: 'Create branch' }).click();
    await expect(page.getByText("cms/x isn't ready yet")).toBeVisible();
    const layer = () =>
      page.evaluate(
        () =>
          getComputedStyle(
            document.querySelector('[data-sonner-toaster]') as Element
          ).zIndex
      );
    await expect.poll(layer).toBe('60');
    await page.evaluate(() => {
      const sheet = document.createElement('div');
      sheet.setAttribute('data-slot', 'foot-sheet');
      sheet.id = 'extra-sheet';
      document.body.append(sheet);
    });
    await expect.poll(layer).toBe('40');
    await page.evaluate(() => document.getElementById('extra-sheet')?.remove());
    await expect.poll(layer).toBe('60');
  });
});
