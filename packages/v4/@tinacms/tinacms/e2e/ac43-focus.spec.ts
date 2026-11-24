import { type Page, expect, test } from '@playwright/test';

const HELLO = 'content/posts/hello-world.mdx';
const url = `/?preview=${encodeURIComponent(`/declared.html?post=${HELLO}`)}#/collections/post/${encodeURIComponent(HELLO)}`;

const open = async (page: Page) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(url);
  await expect(page.locator('#title')).toBeVisible({ timeout: 30_000 });
};

const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

test('AC43: Restore preview moves focus to Maximise form on the other side', async ({
  page,
}) => {
  await open(page);
  await button(page, 'Maximise preview').click();
  await expect(button(page, 'Restore preview')).toBeFocused();
  await button(page, 'Restore preview').click();
  await expect(button(page, 'Maximise form')).toBeFocused();
});

test('AC43: Maximise form and Restore form keep focus on the form header button', async ({
  page,
}) => {
  await open(page);
  await button(page, 'Maximise form').click();
  await expect(button(page, 'Restore form')).toBeFocused();
  await button(page, 'Restore form').click();
  await expect(button(page, 'Maximise form')).toBeFocused();
});

test('AC43: Escape restores and focuses Maximise form from either start', async ({
  page,
}) => {
  await open(page);
  await button(page, 'Maximise preview').click();
  await page.keyboard.press('Escape');
  await expect(button(page, 'Maximise form')).toBeFocused();
});
