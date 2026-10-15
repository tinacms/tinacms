import { expect, test } from '@playwright/test';

test('a click on a marked element in the preview focuses its field in the form', async ({
  page,
}) => {
  await page.goto(
    `/#/collections/post/${encodeURIComponent('content/posts/hello-world.mdx')}`
  );
  await expect(page.getByRole('textbox', { name: 'body' })).toBeVisible();

  const preview = page.frameLocator('iframe[title="Preview"]');
  const markedTitle = preview.locator('[data-tina-field="title"]');
  await expect(markedTitle).toBeVisible();
  await markedTitle.click();

  await expect(page.getByRole('textbox', { name: 'title' })).toBeFocused();
});
