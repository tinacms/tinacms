import { expect, test } from '@playwright/test';

// The click-to-edit half of visual editing, across a real iframe boundary. The vitest
// suite fakes the two windows, so only this test observes the postMessage guards —
// origin and source — against the browser's real values.
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
