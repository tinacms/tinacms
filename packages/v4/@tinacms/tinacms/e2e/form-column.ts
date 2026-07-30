import type { Page } from '@playwright/test';

export const formColumn = (page: Page) => page.locator('aside').last();

export const resizeHandle = (page: Page) =>
  page.getByRole('separator', { name: 'Resize the form column' });

export const columnWidth = (page: Page) =>
  formColumn(page).evaluate((column) => column.getBoundingClientRect().width);

export const toolbar = (page: Page) =>
  page.locator('div.w-full.overflow-hidden.\\@container\\/toolbar');

export const setColumnWidth = async (page: Page, target: number) => {
  const from = await columnWidth(page);
  const handle = resizeHandle(page);
  const box = await handle.boundingBox();
  if (!box) throw new Error('The resize handle is not visible.');

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + (target - from), y, { steps: 8 });
  await page.mouse.up();
};
