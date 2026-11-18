import { expect, type Locator, type Page, test } from '@playwright/test';

const SCREEN = { width: 390, height: 844 };
const KEYBOARD = 336;

const BRANCHES = '/branches.html?docs=1';
const POSTS_FOLDER = '/#/collections/post/folder/guides';
const MEDIA = '/#/screens/media';
const HOME = `/#/collections/page/${encodeURIComponent('content/pages/home.mdx')}`;

const SHEET = '[data-slot=foot-sheet]:not([hidden])';

// The sheet rises over its slide-in time; measure once it has stopped.
const settle = (page: Page) => page.waitForTimeout(400);

const box = async (locator: Locator) => {
  const found = await locator.boundingBox();
  if (!found) throw new Error('no box');
  return found;
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

const foot = async (sheet: Locator) => {
  const rect = await box(sheet);
  return Math.round(rect.y + rect.height);
};

/** AC1: a foot sheet at the screen's foot, at least half the screen, with handle, x and focus inside. */
const expectFootSheet = async (page: Page) => {
  const sheet = page.locator(SHEET);
  await expect(sheet).toBeVisible();
  await settle(page);
  const rect = await box(sheet);
  expect(Math.abs(rect.y + rect.height - SCREEN.height)).toBeLessThanOrEqual(1);
  expect(rect.height).toBeGreaterThanOrEqual(SCREEN.height / 2 - 1);
  await expect(
    sheet.getByRole('button', { name: 'Close sheet' })
  ).toBeVisible();
  await expect(
    sheet.getByRole('button', { name: 'Close', exact: true })
  ).toBeVisible();
  expect(
    await sheet.evaluate((el) => el.contains(document.activeElement))
  ).toBe(true);
  return sheet;
};

const expectClosed = (page: Page) => expect(page.locator(SHEET)).toHaveCount(0);

const openRowMenu = async (page: Page, label: string, item: string) => {
  await page.getByRole('button', { name: `Actions for ${label}` }).click();
  await page.getByRole('menuitem', { name: item }).click();
};

test.use({ viewport: SCREEN });

test.describe('dialogs as foot sheets on a phone', () => {
  test('the branch switcher lists branches and its New branch form closes with Back to branches', async ({
    page,
  }) => {
    await page.goto(BRANCHES);
    await page.getByRole('button', { name: /^Branch: / }).click();
    const sheet = await expectFootSheet(page);
    await sheet.getByRole('button', { name: 'New branch' }).click();
    await expect(
      sheet.getByRole('form', { name: 'New branch form' })
    ).toBeVisible();
    await expectFootSheet(page);
    await sheet.getByRole('button', { name: 'Back to branches' }).click();
    await expect(
      sheet.getByRole('form', { name: 'New branch form' })
    ).toBeHidden();
    await sheet.getByRole('button', { name: 'Close', exact: true }).click();
    await expectClosed(page);
  });

  test('the collection table rename dialog', async ({ page }) => {
    await page.goto(POSTS_FOLDER);
    await openRowMenu(page, 'Getting started', 'Rename');
    const sheet = await expectFootSheet(page);
    await expect(
      sheet.getByRole('textbox', { name: 'File name' })
    ).toBeVisible();
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await expectClosed(page);
  });

  test('the collection table rename dialog rides on the keyboard with its field and buttons in view', async ({
    page,
  }) => {
    await page.goto(POSTS_FOLDER);
    await openRowMenu(page, 'Getting started', 'Rename');
    const sheet = await expectFootSheet(page);
    await fakeKeyboard(page, KEYBOARD);
    await expect.poll(() => foot(sheet)).toBe(SCREEN.height - KEYBOARD);
    await expect(
      sheet.getByRole('textbox', { name: 'File name' })
    ).toBeInViewport();
    await expect(
      sheet.getByRole('button', { name: 'Cancel' })
    ).toBeInViewport();
    await expect(
      sheet.getByRole('button', { name: 'Rename' })
    ).toBeInViewport();
    await fakeKeyboard(page, 0);
    await expect.poll(() => foot(sheet)).toBe(SCREEN.height);
  });

  test('the collection table document delete confirm', async ({ page }) => {
    await page.goto(POSTS_FOLDER);
    await openRowMenu(page, 'Getting started', 'Delete');
    const sheet = await expectFootSheet(page);
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await expectClosed(page);
  });

  test('the collection table folder delete confirm', async ({ page }) => {
    await page.goto('/#/collections/post?max');
    await openRowMenu(page, 'guides', 'Delete');
    const sheet = await expectFootSheet(page);
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await expectClosed(page);
  });

  test('the search dialog is laid out from the top with its field focused', async ({
    page,
  }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /Search/ })
      .first()
      .click();
    const sheet = await expectFootSheet(page);
    await expect(
      sheet.getByRole('searchbox', { name: 'Search' })
    ).toBeFocused();
    const title = await box(sheet.getByText('Search', { exact: true }).first());
    const field = await box(sheet.getByRole('searchbox', { name: 'Search' }));
    expect(title.y).toBeLessThan(field.y);
    await sheet.getByRole('button', { name: 'Close', exact: true }).click();
    await expectClosed(page);
  });

  test('the image field confirm and its picker dialog', async ({ page }) => {
    await page.goto(HOME);
    const field = page.getByRole('group', { name: 'Hero image' });
    await field.getByRole('button', { name: 'Choose from Media' }).click();
    const picker = await expectFootSheet(page);
    await expect(
      picker.getByRole('heading', { name: 'Choose an image' })
    ).toBeVisible();
    await picker.getByRole('button', { name: 'preview.svg' }).click();
    await picker.getByRole('button', { name: 'Insert' }).click();
    await expectClosed(page);

    const dataTransfer = await page.evaluateHandle(() => {
      const transfer = new DataTransfer();
      transfer.items.add(
        new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], 'dropped.svg', {
          type: 'image/svg+xml',
        })
      );
      return transfer;
    });
    await field.dispatchEvent('dragenter', { dataTransfer });
    await field.dispatchEvent('dragover', { dataTransfer });
    await field.dispatchEvent('drop', { dataTransfer });
    const confirm = await expectFootSheet(page);
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await confirm.getByRole('button', { name: 'Cancel' }).click();
    await expectClosed(page);
  });
});

test.describe('media manager confirms as foot sheets on a phone', () => {
  const pane = (page: Page) =>
    page.getByRole('complementary', { name: 'Media' });

  const select = async (page: Page) => {
    await page.goto(MEDIA);
    await pane(page)
      .getByRole('button', { name: 'Select', exact: true })
      .click();
    await pane(page).getByRole('checkbox', { name: 'preview.svg' }).click();
  };

  test('the delete confirm', async ({ page }) => {
    await select(page);
    await pane(page)
      .getByRole('button', { name: /^Delete/ })
      .click();
    const sheet = await expectFootSheet(page);
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await expectClosed(page);
  });

  test('the move dialog', async ({ page }) => {
    await select(page);
    await pane(page).getByRole('button', { name: 'Move', exact: true }).click();
    const sheet = await expectFootSheet(page);
    await expect(
      sheet.getByRole('navigation', { name: 'Move to' })
    ).toBeVisible();
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await expectClosed(page);
  });

  test('the New folder form keeps its field above the keyboard', async ({
    page,
  }) => {
    await page.goto(MEDIA);
    await pane(page).getByRole('button', { name: 'New folder' }).click();
    const sheet = await expectFootSheet(page);
    const field = sheet.getByRole('textbox', { name: 'Folder name' });
    await field.focus();
    await fakeKeyboard(page, KEYBOARD);
    await expect.poll(() => foot(sheet)).toBe(SCREEN.height - KEYBOARD);
    await expect(field).toBeInViewport();
    expect(
      (await box(field)).y + (await box(field)).height
    ).toBeLessThanOrEqual(SCREEN.height - KEYBOARD);
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await expectClosed(page);
  });

  test('the New folder form in the image picker keeps its field above the keyboard', async ({
    page,
  }) => {
    await page.goto(HOME);
    await page
      .getByRole('group', { name: 'Hero image' })
      .getByRole('button', { name: 'Choose from Media' })
      .click();
    await expectFootSheet(page);
    await page.getByRole('button', { name: 'New Folder' }).click();
    const sheet = page.locator(SHEET).last();
    await settle(page);
    const field = sheet.getByRole('textbox', { name: 'Folder name' });
    await field.focus();
    await fakeKeyboard(page, KEYBOARD);
    await expect.poll(() => foot(sheet)).toBe(SCREEN.height - KEYBOARD);
    expect(
      (await box(field)).y + (await box(field)).height
    ).toBeLessThanOrEqual(SCREEN.height - KEYBOARD);
    await sheet.getByRole('button', { name: 'Cancel' }).click();
    await expect(
      page.getByRole('textbox', { name: 'Folder name' })
    ).toHaveCount(0);
  });
});

test.describe('a long usage list keeps the confirm usable on a small phone', () => {
  const SIZES = [
    { width: 375, height: 667 },
    { width: 320, height: 568 },
  ];

  // Stored drafts count as unsaved uses, so ten of them make a ten-document usage list.
  const seedUsage = (page: Page) =>
    page.addInitScript(() => {
      for (let i = 0; i < 10; i++) {
        const values = { title: `Used ${i}`, image: 'preview.svg' };
        localStorage.setItem(
          `tina-drafts:content/pages/used-with-a-long-file-name-${i}.mdx`,
          JSON.stringify({
            version: 2,
            values,
            baseline: { title: `Used ${i}` },
          })
        );
      }
    });

  // Forty folders beside the file, so the Move list fills its own box and the sheet overflows.
  const manyFolders = (page: Page) =>
    page.route('**/api/tina/media?*', (route) =>
      route.fulfill({
        json: {
          items: [
            { path: 'preview.svg', kind: 'file' },
            ...Array.from({ length: 40 }, (_, i) => ({
              path: `folder-${i}`,
              kind: 'directory',
            })),
          ],
        },
      })
    );

  const expectReachable = async (page: Page, size: { height: number }) => {
    const sheet = page.locator(SHEET);
    await expect(sheet).toBeVisible();
    await expect(
      sheet.getByRole('button', { name: /^Open used-with-a-long-file-name-9/ })
    ).toBeAttached();
    await settle(page);
    const header = await box(sheet.locator('[data-slot=alert-dialog-header]'));
    const footer = await box(sheet.locator('[data-slot=alert-dialog-footer]'));
    expect(header.height).toBeGreaterThan(0);
    const natural = await sheet
      .locator('[data-slot=alert-dialog-header]')
      .evaluate((el) => el.scrollHeight);
    expect(header.height).toBeGreaterThanOrEqual(
      Math.min(natural, size.height * 0.4) - 1
    );
    expect(header.height).toBeLessThanOrEqual(size.height * 0.4 + 1);
    expect(header.y + header.height).toBeLessThanOrEqual(footer.y + 1);
    await expect(sheet.locator('[data-slot=alert-dialog-title]')).toBeVisible();
    await expect(
      sheet.getByRole('button', { name: 'Cancel' })
    ).toBeInViewport();
    return sheet;
  };

  for (const size of SIZES) {
    const label = `${size.width}x${size.height}`;
    const open = async (page: Page, action: 'Delete' | 'Move') => {
      await page.setViewportSize(size);
      await seedUsage(page);
      await manyFolders(page);
      await page.goto(MEDIA);
      const pane = page.getByRole('complementary', { name: 'Media' });
      await pane.getByRole('button', { name: 'Select', exact: true }).click();
      await pane.getByRole('checkbox', { name: 'preview.svg' }).click();
      await pane
        .getByRole('button', {
          name: action === 'Delete' ? /^Delete/ : 'Move',
          exact: action === 'Move',
        })
        .click();
    };

    test(`the delete confirm at ${label}`, async ({ page }) => {
      await open(page, 'Delete');
      const sheet = await expectReachable(page, size);
      await expect(
        sheet.getByRole('button', { name: 'Delete', exact: true })
      ).toBeInViewport();
    });

    test(`the move dialog at ${label}`, async ({ page }) => {
      await open(page, 'Move');
      const sheet = await expectReachable(page, size);
      await expect(
        sheet.getByRole('button', { name: 'Move here' })
      ).toBeInViewport();
    });
  }
});
