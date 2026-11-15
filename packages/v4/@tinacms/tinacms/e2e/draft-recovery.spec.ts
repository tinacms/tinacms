import { expect, type Page, test } from '@playwright/test';
import { setColumnWidth } from './form-column';

const DOCUMENT = '/#/collections/post/content%2Fposts%2Fhello-world.mdx';
const WIDTHS = [
  { name: '1440px', width: 1440, height: 900 },
  { name: '768px', width: 768, height: 1024 },
  { name: '390px', width: 390, height: 844 },
] as const;

const drafts = (page: Page) =>
  page.evaluate(() =>
    Object.fromEntries(
      Object.keys(localStorage)
        .filter((key) => key.startsWith('tina-drafts'))
        .map((key) => {
          const entry = JSON.parse(localStorage.getItem(key) ?? '{}');
          const titles = entry.copies
            ? entry.copies.map(
                (copy: { values: { title: string } }) => copy.values.title
              )
            : entry.values.title;
          return [key.endsWith('#waiting') ? 'waiting' : 'live', titles];
        })
    )
  );

const title = (page: Page) => page.getByRole('textbox', { name: /^Title/ });
const prompt = (page: Page) => page.getByText('Resume your unsaved edits?');

const typeTitle = async (page: Page, text: string) => {
  await title(page).click();
  await title(page).pressSequentially(text);
  await expect.poll(() => drafts(page)).toHaveProperty('live');
};

const reload = async (page: Page) => {
  await page.reload();
  await expect(title(page)).toBeVisible();
};

for (const { name, width, height } of WIDTHS) {
  test.describe(`draft recovery at ${name}`, () => {
    test.use({ viewport: { width, height } });

    test.beforeEach(async ({ page }) => {
      await page.goto(DOCUMENT);
      await expect(title(page)).toBeVisible();
      await page.evaluate(() => {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith('tina-drafts')) localStorage.removeItem(key);
        }
      });
      await reload(page);
    });

    test('row 18: reload with the toast showing and nothing typed keeps the copy', async ({
      page,
    }) => {
      const file = await title(page).inputValue();
      await typeTitle(page, ' EDIT');
      await reload(page);
      await expect(prompt(page)).toBeVisible();
      const before = await drafts(page);
      await reload(page);
      await expect(prompt(page)).toBeVisible();
      expect(await drafts(page)).toEqual(before);
      await expect(title(page)).toHaveValue(file);
    });

    test('row 19: reload after typing under the toast keeps both copies', async ({
      page,
    }) => {
      await typeTitle(page, ' ONE');
      await reload(page);
      await expect(prompt(page)).toBeVisible();
      await typeTitle(page, ' TWO');
      await reload(page);
      const kept = await drafts(page);
      expect(kept.waiting).toHaveLength(2);
      expect(kept.waiting[0]).toMatch(/ONE$/);
      expect(kept.waiting[1]).toMatch(/TWO$/);
    });

    test('row 20: reload after Resume waits again as the newest copy', async ({
      page,
    }) => {
      await typeTitle(page, ' EDIT');
      await reload(page);
      await page.getByRole('button', { name: 'Resume' }).click();
      await expect(title(page)).toHaveValue(/EDIT$/);
      await reload(page);
      await expect(prompt(page)).toBeVisible();
      expect((await drafts(page)).waiting).toEqual([
        expect.stringMatching(/EDIT$/),
      ]);
    });

    test('row 21: reload with the Discard confirm open drops the dialog and keeps the copy', async ({
      page,
    }) => {
      await typeTitle(page, ' EDIT');
      await reload(page);
      await page.getByRole('button', { name: 'Discard' }).first().click();
      const dialog = page.getByRole('alertdialog');
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: 'Cancel' })
      ).toBeFocused();
      await reload(page);
      await expect(dialog).toBeHidden();
      await expect(prompt(page)).toBeVisible();
      expect((await drafts(page)).waiting).toHaveLength(1);
    });

    test('row 21: reload while a save is in flight keeps the edit and the file as it was', async ({
      page,
    }) => {
      // Only the write hangs. Reads must pass, or the page cannot reload.
      await page.route('**/api/tina/**', (route) =>
        route.request().postData()?.includes('"op":"update"')
          ? new Promise(() => {})
          : route.continue()
      );
      await typeTitle(page, ' EDIT');
      await page.getByRole('button', { name: 'Save' }).click();
      await reload(page);
      await expect(prompt(page)).toBeVisible();
      expect((await drafts(page)).waiting).toEqual([
        expect.stringMatching(/EDIT$/),
      ]);
    });

    test('rows 13 and 14: Save and Document actions stay reachable under the toast', async ({
      page,
    }) => {
      await typeTitle(page, ' EDIT');
      await reload(page);
      await expect(prompt(page)).toBeVisible();
      await typeTitle(page, '!');
      // Playwright waits until the control receives pointer events, so a toast
      // that stays on top of it times out instead of passing.
      for (const name of ['Save', 'Document actions']) {
        await page.getByRole('button', { name }).hover({ timeout: 4000 });
      }
      // Whatever the toast does, its rectangle must clear the form bar's.
      await expect
        .poll(async () => {
          const toast = await page
            .locator('[data-sonner-toast]')
            .first()
            .boundingBox();
          const bar = await page.locator('[data-slot=form-bar]').boundingBox();
          if (!toast || !bar) return true;
          return (
            toast.x < bar.x + bar.width &&
            toast.x + toast.width > bar.x &&
            toast.y < bar.y + bar.height &&
            toast.y + toast.height > bar.y
          );
        })
        .toBe(false);
    });

    test('row 11: the confirm takes focus even when a field held it', async ({
      page,
    }) => {
      await typeTitle(page, ' EDIT');
      await reload(page);
      await title(page).click();
      await page.getByRole('button', { name: 'Discard' }).first().click();
      await expect(
        page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' })
      ).toBeFocused();
    });
  });
}

const clearOf = async (page: Page, selector: string) => {
  const toast = await page.locator('[data-sonner-toast]').first().boundingBox();
  const other = await page.locator(selector).first().boundingBox();
  if (!toast || !other) return true;
  return !(
    toast.x < other.x + other.width &&
    toast.x + toast.width > other.x &&
    toast.y < other.y + other.height &&
    toast.y + toast.height > other.y
  );
};

const waitForPrompt = async (page: Page) => {
  await typeTitle(page, ' EDIT');
  await reload(page);
  await expect(prompt(page)).toBeVisible();
};

test.describe('the Resume toast keeps the form usable', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(DOCUMENT);
    await expect(title(page)).toBeVisible();
    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('tina-drafts')) localStorage.removeItem(key);
      }
    });
  });

  for (const width of [1024, 1094, 1440]) {
    test(`Save and Document actions stay clickable at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await waitForPrompt(page);
      await typeTitle(page, '!');
      await expect.poll(() => clearOf(page, '[data-slot=form-bar]')).toBe(true);
    });
  }

  test('Save stays clickable with the form column dragged to its widest', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(DOCUMENT);
    await setColumnWidth(page, 1040);
    await waitForPrompt(page);
    await typeTitle(page, '!');
    await expect.poll(() => clearOf(page, '[data-slot=form-bar]')).toBe(true);
  });

  test('the prompt sits 16px above the Status bar at 1440px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await waitForPrompt(page);
    const gap = async () => {
      const toast = await page.locator('[data-sonner-toast]').boundingBox();
      const bar = await page.getByRole('contentinfo').boundingBox();
      return toast && bar ? bar.y - (toast.y + toast.height) : Number.NaN;
    };
    await expect.poll(gap).toBeGreaterThan(14);
    await expect.poll(gap).toBeLessThan(18);
  });

  test('Cancel shows a focus ring in the Resume confirm and the menu confirm', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await waitForPrompt(page);
    await page.getByRole('button', { name: 'Discard' }).first().click();
    const cancel = page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Cancel' });
    await expect(cancel).toBeFocused();
    expect(
      await cancel.evaluate((node) => node.matches(':focus-visible'))
    ).toBe(true);
    await page.keyboard.press('Escape');

    await typeTitle(page, '!');
    await page.getByRole('button', { name: 'Document actions' }).click();
    await page.getByRole('menuitem', { name: 'Discard unsaved edits' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText('Discard unsaved edits to “');
    await expect(cancel).toBeFocused();
    expect(
      await cancel.evaluate((node) => node.matches(':focus-visible'))
    ).toBe(true);
  });

  for (const height of [440, 460, 480]) {
    test(`Resume can be tapped over the rich-text toolbar at ${height}px high`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height });
      await waitForPrompt(page);
      await page
        .getByRole('button', { name: 'Resume' })
        .hover({ timeout: 4000 });
    });
  }

  test('the toast steps aside while a field has focus on a shrunk screen, and returns after', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 664 });
    await waitForPrompt(page);
    await page.setViewportSize({ width: 390, height: 332 });
    await expect(prompt(page)).toBeVisible();
    await title(page).focus();
    await expect(prompt(page)).toBeHidden();
    await title(page).blur();
    await expect(prompt(page)).toBeVisible();
  });

  test('Resume stays reachable on a landscape phone with no keyboard open', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 750, height: 342 });
    await waitForPrompt(page);
    await page.getByRole('button', { name: 'Resume' }).hover({ timeout: 4000 });
    await page.getByRole('button', { name: 'Resume' }).click();
  });
});
