import { expect, type Page, test } from '@playwright/test';

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
