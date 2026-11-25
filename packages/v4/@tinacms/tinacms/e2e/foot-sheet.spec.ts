import { expect, type Locator, type Page, test } from '@playwright/test';

const BRANCH_DIALOG =
  '/branches.html?docs=1&fail=branch-gone#/collections/post/content%2Fposts%2Fpost-01.mdx';
const CHECKLIST =
  '/#/collections/checklist/content%2Fchecklists%2Ftwo-errors.mdx';

const SIZES = [
  { width: 390, height: 844 },
  { width: 390, height: 667 },
];

const edit = async (page: Page, name: RegExp, text: string) => {
  const field = page.getByRole('textbox', { name });
  await field.click();
  await field.pressSequentially(text);
};

const save = (page: Page) =>
  page
    .locator('[data-slot=form-bar]')
    .getByRole('button', { name: /^(Save|Resolve|\d+\+? errors?$)/ });

const openBranchDialog = async (page: Page) => {
  await page.goto(BRANCH_DIALOG);
  await edit(page, /^Title/, '!');
  await save(page).click();
  const sheet = page.locator('[data-slot=foot-sheet]:not([hidden])');
  await expect(sheet).toBeVisible();
  await settle(page);
  return sheet;
};

// The sheet rises over its slide-in time; measure once it has stopped.
const settle = (page: Page) => page.waitForTimeout(400);

const box = async (locator: Locator) => {
  const found = await locator.boundingBox();
  if (!found) throw new Error('no box');
  return found;
};

const drag = async (page: Page, handle: Locator, dy: number) => {
  const { x, y, width, height } = await box(handle);
  await page.mouse.move(x + width / 2, y + height / 2);
  await page.mouse.down();
  await page.mouse.move(x + width / 2, y + height / 2 + dy / 2, { steps: 4 });
  await page.mouse.move(x + width / 2, y + height / 2 + dy, { steps: 4 });
  await page.mouse.up();
};

// A keyboard shrinks the visual viewport and leaves the layout viewport alone.
const fakeKeyboard = (page: Page, shrink: number) =>
  page.evaluate((by) => {
    const visual = window.visualViewport;
    if (!visual) throw new Error('no visual viewport');
    Object.defineProperty(visual, 'height', {
      configurable: true,
      value: window.innerHeight - by,
    });
    visual.dispatchEvent(new Event('resize'));
  }, shrink);

test.describe('the branch dialog as a foot sheet', () => {
  for (const size of SIZES) {
    test(`sits at the foot, is half the screen, and splits its buttons at ${size.width}x${size.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      const sheet = await openBranchDialog(page);
      const rect = await box(sheet);
      expect(Math.abs(rect.y + rect.height - size.height)).toBeLessThanOrEqual(
        1
      );
      expect(rect.height).toBeGreaterThanOrEqual(size.height / 2 - 1);
      await expect(
        sheet.getByRole('button', { name: 'Close sheet' })
      ).toBeVisible();
      await expect(
        sheet.getByRole('button', { name: 'Close', exact: true })
      ).toBeVisible();
      await expect(
        sheet.getByRole('textbox', { name: /New branch name/ })
      ).toBeFocused();
      const title = sheet.locator('[data-slot=dialog-title]');
      expect(await title.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
        '16px'
      );
      const cancel = await box(sheet.getByRole('button', { name: 'Cancel' }));
      const primary = await box(
        sheet.getByRole('button', { name: 'Save to new branch' })
      );
      expect(Math.abs(cancel.width - primary.width)).toBeLessThanOrEqual(1);
    });
  }

  test('closes on a handle tap, a scrim tap and a 120px drag when the name is empty, but springs back on a 30px drag', async ({
    page,
  }) => {
    await page.setViewportSize(SIZES[0]);
    const sheet = await openBranchDialog(page);
    await sheet.getByRole('textbox', { name: /New branch name/ }).fill('');
    const handle = sheet.getByRole('button', { name: 'Close sheet' });
    await drag(page, handle, 30);
    await settle(page);
    await expect(sheet).toBeVisible();
    expect((await box(sheet)).y + (await box(sheet)).height).toBeCloseTo(
      844,
      0
    );
    await drag(page, handle, 120);
    await expect(
      page.locator('[data-slot=foot-sheet]:not([hidden])')
    ).toHaveCount(0);
  });

  test('stays open under a drag, a handle tap and a scrim tap once a name is typed, and Escape still closes', async ({
    page,
  }) => {
    await page.setViewportSize(SIZES[0]);
    const sheet = await openBranchDialog(page);
    await sheet
      .getByRole('textbox', { name: /New branch name/ })
      .fill('my-branch');
    const handle = sheet.getByRole('button', { name: 'Close sheet' });
    await drag(page, handle, 120);
    await settle(page);
    await expect(sheet).toBeVisible();
    await handle.click();
    await page.mouse.click(195, 10);
    await settle(page);
    await expect(sheet).toBeVisible();
    await expect(
      sheet.getByRole('textbox', { name: /New branch name/ })
    ).toHaveValue('my-branch');
    await page.keyboard.press('Escape');
    await expect(
      page.locator('[data-slot=foot-sheet]:not([hidden])')
    ).toHaveCount(0);
  });

  test('rides on the keyboard and returns when it goes', async ({ page }) => {
    await page.setViewportSize(SIZES[0]);
    const sheet = await openBranchDialog(page);
    await fakeKeyboard(page, 336);
    await expect
      .poll(async () => {
        const rect = await box(sheet);
        return Math.round(rect.y + rect.height);
      })
      .toBe(844 - 336);
    await expect(
      sheet.getByRole('button', { name: 'Save to new branch' })
    ).toBeInViewport();
    await fakeKeyboard(page, 0);
    await expect
      .poll(async () => {
        const rect = await box(sheet);
        return Math.round(rect.y + rect.height);
      })
      .toBe(844);
  });

  test('keeps its name and stays open across 768px and back', async ({
    page,
  }) => {
    await page.setViewportSize(SIZES[0]);
    const sheet = await openBranchDialog(page);
    const field = page.getByRole('textbox', { name: /New branch name/ });
    await field.fill('keep-me');
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('[data-slot=dialog-content]')).toBeVisible();
    await expect(field).toHaveValue('keep-me');
    await page.setViewportSize(SIZES[0]);
    await expect(
      page.locator('[data-slot=foot-sheet]:not([hidden])')
    ).toBeVisible();
    await expect(field).toHaveValue('keep-me');
  });

  test('stays a centred dialog without a handle from 768px up', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BRANCH_DIALOG);
    await edit(page, /^Title/, '!');
    await save(page).click();
    const dialog = page.locator('[data-slot=dialog-content]');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close sheet' })).toHaveCount(
      0
    );
    const rect = await box(dialog);
    expect(rect.y + rect.height).toBeLessThan(800 - 20);
  });

  test('fades in place under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(SIZES[0]);
    const sheet = await openBranchDialog(page);
    const [property, duration] = await sheet.evaluate((el) => {
      const style = getComputedStyle(el);
      return [style.transitionProperty, style.transitionDuration];
    });
    expect(property).toBe('opacity');
    expect(duration).toBe('0.1s');
  });
});

test.describe('the error list as a foot sheet', () => {
  const block = async (page: Page) => {
    await page.goto(CHECKLIST);
    await edit(page, /^Note/, 'x');
    await save(page).click();
    const sheet = page.getByRole('dialog', { name: /^Errors/ });
    await expect(sheet).toBeVisible();
    await settle(page);
    return sheet;
  };

  for (const size of SIZES) {
    test(`is half the screen with Go to field on every row at ${size.width}x${size.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      const sheet = await block(page);
      const rect = await box(sheet);
      expect(Math.abs(rect.height - size.height / 2)).toBeLessThanOrEqual(1);
      await expect(
        sheet.getByRole('button', { name: 'Close sheet' })
      ).toBeVisible();
      await expect(
        sheet.getByRole('button', { name: 'Close', exact: true })
      ).toBeVisible();
      await expect(sheet.getByRole('button', { name: /pin/i })).toHaveCount(0);
      await expect(sheet.getByText(/to hide/)).toHaveCount(0);
      const hints = sheet.getByText('Go to field');
      await expect(hints).toHaveCount(2);
      for (const hint of await hints.all()) {
        expect(await hint.evaluate((el) => getComputedStyle(el).opacity)).toBe(
          '1'
        );
      }
      await expect(sheet.locator('[data-error-row]').first()).toBeFocused();
    });
  }

  test('closes on a row tap and puts focus in that field, and the edge tab brings it back', async ({
    page,
  }) => {
    await page.setViewportSize(SIZES[0]);
    const sheet = await block(page);
    await sheet.locator('[data-error-row]').first().click();
    await expect(
      page.locator('[data-slot=foot-sheet]:not([hidden])')
    ).toBeHidden();
    await expect(page.getByRole('textbox', { name: /^First/ })).toBeFocused();
    await page.getByRole('button', { name: 'Show errors, 2' }).click();
    await expect(page.getByRole('dialog', { name: /^Errors/ })).toBeVisible();
  });

  test('closes on ×, a scrim tap and Escape and puts focus on Resolve, with the pane element kept', async ({
    page,
  }) => {
    await page.setViewportSize(SIZES[0]);
    const sheet = await block(page);
    await sheet.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(save(page)).toBeFocused();
    await expect(page.locator('#error-pane')).toHaveCount(1);
    await save(page).click();
    await expect(sheet).toBeVisible();
    await settle(page);
    await page.mouse.click(195, 10);
    await expect(save(page)).toBeFocused();
    await save(page).click();
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(save(page)).toBeFocused();
  });

  test('stays a floating pane with Pin from 768px up', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(CHECKLIST);
    await edit(page, /^Note/, 'x');
    await save(page).click();
    const pane = page.getByRole('complementary', { name: /^Errors/ });
    await expect(pane).toBeVisible();
    await expect(pane.getByRole('button', { name: 'Pin' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close sheet' })).toHaveCount(
      0
    );
  });
});

test.describe('menus on a phone', () => {
  test('stay within the screen less 24px', async ({ page }) => {
    await page.setViewportSize(SIZES[0]);
    await page.goto('/#/collections/post/content%2Fposts%2Fhello-world.mdx');
    await page.getByRole('button', { name: 'Document actions' }).click();
    const menu = page.locator('[data-slot=dropdown-menu-content]');
    await expect(menu).toBeVisible();
    expect((await box(menu)).width).toBeLessThanOrEqual(366);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });
});

test.describe('the Discard confirm', () => {
  const POST = '/#/collections/post/content%2Fposts%2Fhello-world.mdx';
  const openDiscard = async (page: Page) => {
    await page.goto(POST);
    await edit(page, /^Title/, '!');
    await page.getByRole('button', { name: 'Document actions' }).click();
    await page.getByRole('menuitem', { name: 'Discard unsaved edits' }).click();
    return page.getByRole('alertdialog');
  };

  test('rises as a foot sheet, and a scrim tap cancels without discarding', async ({
    page,
  }) => {
    await page.setViewportSize(SIZES[0]);
    const confirm = await openDiscard(page);
    await expect(confirm).toBeVisible();
    await settle(page);
    const rect = await box(confirm);
    expect(Math.abs(rect.y + rect.height - 844)).toBeLessThanOrEqual(1);
    await page.mouse.click(195, 10);
    await expect(confirm).toBeHidden();
    await expect(page.getByRole('textbox', { name: /^Title/ })).toHaveValue(
      /!$/
    );
  });

  test('ignores a scrim click from 768px up', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const confirm = await openDiscard(page);
    await expect(confirm).toBeVisible();
    await page.mouse.click(5, 5);
    await settle(page);
    await expect(confirm).toBeVisible();
  });
});

test('the side nav sheet closes at 390px without navigating', async ({
  page,
}) => {
  await page.setViewportSize(SIZES[0]);
  await page.goto('/#/collections/post/content%2Fposts%2Fhello-world.mdx');
  const url = page.url();
  await page.getByRole('button', { name: 'Open side nav' }).click();
  const side = page.locator('[data-slot=sidebar][data-mobile=true]');
  await expect(side).toBeVisible();
  await settle(page);
  const rect = await box(side);
  expect(rect.width).toBe(288);
  expect(rect.y).toBe(56);
  await page.getByRole('button', { name: 'Close side nav' }).click();
  await expect(side).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Open side nav' })
  ).toBeFocused();
  expect(page.url()).toBe(url);
});
