import { type Page, expect, test } from '@playwright/test';

const PAGE = `/#/collections/page/${encodeURIComponent('content/pages/home.mdx')}`;
const BLOCKS = 14;

async function addBlocks(page: Page) {
  await page.goto(PAGE);
  for (let i = 0; i < BLOCKS; i++) {
    await page.getByRole('button', { name: 'Add a block' }).nth(1).click();
    await page
      .getByRole('dialog', { name: 'Choose a block' })
      .getByRole('button', { name: /^Add Template number 1 / })
      .click();
    await page
      .getByRole('navigation', { name: 'Location' })
      .getByRole('button', { name: 'Plain blocks' })
      .click();
  }
}

const viewports = [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`Up from a block keeps the admin in place at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await addBlocks(page);
    await page.evaluate(() => {
      const wrapper = document.querySelector<HTMLElement>(
        '[data-slot=sidebar-wrapper]'
      );
      const overflow = document.createElement('div');
      overflow.style.cssText =
        'position:absolute;top:100%;height:28px;width:1px';
      if (wrapper) {
        wrapper.style.position = 'relative';
        wrapper.append(overflow);
      }
    });
    const cards = page.getByRole('button', { name: /^Item \d+/ });
    for (const index of [0, Math.floor(BLOCKS / 2), BLOCKS - 1]) {
      await cards.nth(index).scrollIntoViewIfNeeded();
      await cards.nth(index).click();
      await page
        .getByRole('navigation', { name: 'Location' })
        .getByRole('button', { name: 'Plain blocks' })
        .click();
      const grip = page.getByRole('button', {
        name: `Move Item ${index + 1}`,
        exact: true,
      });
      await expect(grip).toBeFocused();
      await expect(grip).toBeInViewport();
      const shifted = await page.evaluate(
        () => document.querySelector('[data-slot=sidebar-wrapper]')?.scrollTop
      );
      expect(shifted).toBe(0);
    }
  });
}
