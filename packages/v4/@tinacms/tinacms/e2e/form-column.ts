import type { Page } from '@playwright/test';

export const formColumn = (page: Page) =>
  page.getByRole('complementary', { name: 'Document form' });

export const resizeHandle = (page: Page) =>
  page.getByRole('separator', { name: 'Resize the form column' });

export const columnWidth = (page: Page) =>
  formColumn(page).evaluate((column) => column.getBoundingClientRect().width);

export const toolbar = (page: Page) =>
  page.getByRole('toolbar', { name: 'Formatting' });

export const formScroller = (page: Page) =>
  formColumn(page).locator('div.overflow-y-auto').first();

export const toolbarShell = (page: Page, field?: string | RegExp) =>
  field
    ? page
        .locator('[data-slot="field-wrapper"]', {
          has: page.getByRole('textbox', { name: field }),
        })
        .last()
        .locator('[data-slot="toolbar-shell"]')
    : page.locator('[data-slot="toolbar-shell"]').first();

export const fakeVisualViewport = (page: Page) =>
  page.addInitScript(() => {
    const fake = Object.assign(new EventTarget(), {
      width: window.innerWidth,
      height: window.innerHeight,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', { get: () => fake });
    Object.defineProperty(window, '__setKeyboard', {
      value: (height: number) => {
        fake.height = height;
        fake.dispatchEvent(new Event('resize'));
      },
    });
  });

export const setKeyboardHeight = (page: Page, height: number) =>
  page.evaluate((next) => {
    const keyboard = Reflect.get(window, '__setKeyboard');
    if (typeof keyboard !== 'function') throw new Error('no fake keyboard');
    keyboard(next);
  }, height);

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
