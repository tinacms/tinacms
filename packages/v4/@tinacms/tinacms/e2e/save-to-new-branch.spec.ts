import { expect, type Page, test } from '@playwright/test';

const DOCUMENT =
  '/branches.html?docs=1&fail=branch-gone#/collections/post/content%2Fposts%2Fpost-01.mdx';

// The save fails with `branch-not-found`: the deleted dialog opens over a toast
// whose action reopens it. Escape closes the first one, so focus is back on Save.
const failSaveThenClose = async (page: Page) => {
  await page.goto(DOCUMENT);
  const title = page.getByRole('textbox', { name: /^Title/ });
  await title.click();
  await title.pressSequentially('!');
  await page
    .locator('[data-slot=form-bar]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'feature/news was deleted' })
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  return page
    .locator('[data-slot=toast]')
    .getByRole('button', { name: 'Save to new branch' });
};

for (const how of ['a click', 'Enter'] as const) {
  test(`the toast action opens the deleted dialog with focus in the name field and Tab kept inside, by ${how}`, async ({
    page,
  }) => {
    const action = await failSaveThenClose(page);
    if (how === 'Enter') {
      await action.focus();
      await page.keyboard.press('Enter');
    } else {
      await action.click();
    }
    const dialog = page.getByRole('dialog', {
      name: 'feature/news was deleted',
    });
    const field = dialog.getByRole('textbox', { name: /New branch name/ });
    await expect(field).toBeFocused();
    await page.waitForTimeout(300);
    await expect(field).toBeFocused();
    for (let step = 0; step < 4; step += 1) {
      await page.keyboard.press('Tab');
      await expect
        .poll(() =>
          page.evaluate(() => {
            const active = document.activeElement;
            return `${active?.tagName} ${active?.closest('[role=dialog]') ? 'in' : 'out'}`;
          })
        )
        .toMatch(/ in$/);
    }
  });
}
