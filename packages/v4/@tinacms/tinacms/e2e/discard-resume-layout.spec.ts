import { expect, type Page, test } from '@playwright/test';
import { setColumnWidth } from './form-column';

const DOCUMENT = '/#/collections/post/content%2Fposts%2Fhello-world.mdx';
const MENU_ITEM = 'Discard unsaved edits';

const title = (page: Page) => page.getByRole('textbox', { name: /^Title/ });
const prompt = (page: Page) => page.getByText('Resume your unsaved edits?');
const chip = (page: Page) => page.locator('[data-slot=form-bar] [role=status]');
const dialog = (page: Page) => page.getByRole('alertdialog');
const cancel = (page: Page) =>
  dialog(page).getByRole('button', { name: 'Cancel' });
const focusRing = (page: Page) =>
  cancel(page).evaluate((node) => node.matches(':focus-visible'));
const toastGap = (page: Page) =>
  page.evaluate(() => {
    const toast =
      document.querySelector('[data-sonner-toast][data-front="true"]') ??
      document.querySelector('[data-sonner-toast]');
    const bar = document.querySelector('[data-slot=status-bar]');
    if (!toast || !bar) return Number.NaN;
    return (
      bar.getBoundingClientRect().top - toast.getBoundingClientRect().bottom
    );
  });
const overflows = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );

// Any warning or error the page logs fails the test (AC17).
const problems: string[] = [];
let expected: RegExp | null = null;
test.beforeEach(async ({ page }) => {
  problems.length = 0;
  expected = null;
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      problems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  await page.goto(DOCUMENT);
  await expect(title(page)).toBeVisible();
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('tina-drafts')) localStorage.removeItem(key);
    }
  });
  await page.reload();
  await expect(title(page)).toBeVisible();
});
test.afterEach(() => {
  expect(problems.filter((line) => !(expected?.test(line) ?? false))).toEqual(
    []
  );
});

const type = async (page: Page, text: string) => {
  await title(page).click();
  await title(page).pressSequentially(text);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys(localStorage).some(
          (key) => key.startsWith('tina-drafts') && !key.endsWith('#waiting')
        )
      )
    )
    .toBe(true);
};

const showPrompt = async (page: Page, edit = ' EDIT') => {
  await type(page, edit);
  await page.reload();
  await expect(prompt(page)).toBeVisible();
};

const openMenuConfirm = async (page: Page) => {
  await page.getByRole('button', { name: 'Document actions' }).click();
  await page.getByRole('menuitem', { name: MENU_ITEM }).click();
  await expect(dialog(page)).toBeVisible();
};

test('AC2: the menu item is disabled on a pristine form and opens nothing', async ({
  page,
}) => {
  const initial = await title(page).inputValue();
  await page.getByRole('button', { name: 'Document actions' }).click();
  const item = page.getByRole('menuitem', { name: MENU_ITEM });
  await expect(item).toHaveAttribute('aria-disabled', 'true');
  await item.click({ force: true });
  await item.focus();
  await page.keyboard.press('Enter');
  await expect(dialog(page)).toHaveCount(0);
  await expect(title(page)).toHaveValue(initial);
});

test('AC3, AC1: the menu confirm opens with the ring by keyboard, and Cancel returns focus', async ({
  page,
}) => {
  const initial = await title(page).inputValue();
  await type(page, '!');
  await page.getByRole('button', { name: 'Document actions' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitem', { name: MENU_ITEM }).focus();
  await page.keyboard.press('Enter');
  await expect(cancel(page)).toBeFocused();
  expect(await focusRing(page)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('button', { name: 'Document actions' })
  ).toBeFocused();
  await expect(title(page)).toHaveValue(`${initial}!`);
});

test('AC3 and AC24: the navigator confirm for kept edits whose file is gone', async ({
  page,
}) => {
  await type(page, '!');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('tina-drafts:') && !key.endsWith('#waiting')) {
        localStorage.setItem(
          key.replace('hello-world.mdx', 'gone.mdx'),
          localStorage.getItem(key) ?? ''
        );
      }
    }
  });
  await page.goto('/#/collections?unsaved');
  await page.reload();
  const discard = page.getByRole('button', {
    name: 'Discard edits to gone.mdx',
  });
  await expect(discard).toBeVisible();
  await discard.click();
  await expect(dialog(page)).toContainText(
    'The file is gone, so these edits are the only copy. Discarded edits can’t be brought back.'
  );
  await expect(cancel(page)).toBeFocused();
  expect(await focusRing(page)).toBe(true);
  await cancel(page).click();
  await expect(dialog(page)).toHaveCount(0);
  await expect(discard).toBeVisible();
});

test('AC9: at 390px the confirm wraps a 200-character title and the prompt fits', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await title(page).click();
  await title(page).fill('w'.repeat(200));
  await openMenuConfirm(page);
  const heading = dialog(page).getByRole('heading');
  const lines = await heading.evaluate(
    (node) =>
      node.getBoundingClientRect().height /
      Number.parseFloat(getComputedStyle(node).lineHeight)
  );
  expect(lines).toBeGreaterThan(2);
  expect(await overflows(page)).toBe(false);
  await dialog(page).getByRole('button', { name: 'Discard' }).click();
  await expect(dialog(page)).toHaveCount(0);

  await showPrompt(page);
  expect(await overflows(page)).toBe(false);
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(prompt(page)).toHaveCount(0);
});

test('AC20: with either confirm open the other cannot be opened', async ({
  page,
}) => {
  await showPrompt(page);
  await type(page, '!');
  await openMenuConfirm(page);
  await expect(dialog(page)).toHaveCount(1);
  await expect(
    page
      .getByRole('button', { name: 'Discard', exact: true })
      .first()
      .click({ timeout: 1000 })
  ).rejects.toThrow();
  await expect(dialog(page)).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toHaveCount(0);

  await page
    .getByRole('button', { name: 'Discard', exact: true })
    .first()
    .click();
  await expect(dialog(page)).toHaveCount(1);
  await expect(
    page
      .getByRole('button', { name: 'Document actions' })
      .click({ timeout: 1000 })
  ).rejects.toThrow();
  await expect(dialog(page)).toHaveCount(1);
});

test('AC21: the toast follows a resize, a column drag and a sidebar collapse', async ({
  page,
}) => {
  const low = (message: string) =>
    expect.poll(() => toastGap(page), { message }).toBeCloseTo(16, 0);
  const high = (message: string) =>
    expect.poll(() => toastGap(page), { message }).toBeGreaterThan(40);
  await page.setViewportSize({ width: 1440, height: 900 });
  await showPrompt(page);
  await low('1440 wide');
  await page.setViewportSize({ width: 800, height: 900 });
  await high('resized to 800');
  await page.setViewportSize({ width: 1440, height: 900 });
  await low('resized back to 1440');
  await setColumnWidth(page, 1040);
  await high('column dragged wide');
  await setColumnWidth(page, 340);
  await low('column dragged back');
  await page.setViewportSize({ width: 1100, height: 900 });
  await setColumnWidth(page, 540);
  await high('1100 wide with a wide column');
  await page.getByRole('button', { name: 'Toggle Sidebar' }).first().click();
  await low('sidebar collapsed');
});

test('AC22: a failed Save toast follows the offset rule and the card lifts the prompt', async ({
  page,
}) => {
  expected = /500|Save failed/;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('**/api/tina/**', async (route) => {
    if (!route.request().postData()?.includes('"op":"update"')) {
      return route.continue();
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'op-failed', message: 'No.' } }),
    });
  });
  await showPrompt(page);
  await type(page, '!');
  await expect.poll(() => toastGap(page)).toBeCloseTo(16, 0);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect
    .poll(() => toastGap(page), { timeout: 2000 })
    .toBeGreaterThan(40);
  await expect(page.getByText(/Couldn.t save/).first()).toBeVisible({
    timeout: 6000,
  });
  const failed = page
    .locator('[data-sonner-toast]')
    .filter({ hasText: /Couldn.t save/ });
  await expect
    .poll(() =>
      failed.evaluate(
        (toast) =>
          (document
            .querySelector('[data-slot=status-bar]')
            ?.getBoundingClientRect().top ?? 0) -
          toast.getBoundingClientRect().bottom
      )
    )
    .toBeCloseTo(16, 0);
});

test('AC22: the storage warning sits 16px above the status bar', async ({
  page,
}) => {
  expected = /could not store the draft/;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key.startsWith('tina-drafts')) throw new Error('quota');
      return set.call(this, key, value);
    };
  });
  await title(page).click();
  await title(page).pressSequentially('!');
  await expect(page.locator('[data-sonner-toast]').first()).toBeVisible();
  await expect.poll(() => toastGap(page)).toBeCloseTo(16, 0);
});

test('AC6 and AC18: no chip under the prompt, Unsaved while typing, No changes after Resume or Discard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await showPrompt(page);
  await expect(chip(page)).toHaveText('');
  await type(page, '!');
  await expect(chip(page)).toContainText('Unsaved');

  await openMenuConfirm(page);
  await dialog(page).getByRole('button', { name: 'Discard' }).click();
  await expect(chip(page))
    .toContainText('Unsaved', { timeout: 100 })
    .catch(() => {});
  await expect(prompt(page)).toBeVisible();
  await expect(chip(page)).toHaveText('');
  await page
    .getByRole('button', { name: 'Discard', exact: true })
    .first()
    .click();
  await dialog(page).getByRole('button', { name: 'Discard' }).click();
  await expect(prompt(page)).toHaveCount(0);
  await expect(chip(page)).toContainText('No changes');
});

test('AC6: the chip stays hidden while the keyboard hides the toast', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await showPrompt(page);
  await page.setViewportSize({ width: 390, height: 332 });
  await title(page).focus();
  await expect(prompt(page)).toBeHidden();
  await expect(chip(page)).toHaveText('');
});

test('AC7: the status bar shows the dot and the same words while edits are kept', async ({
  page,
}) => {
  await showPrompt(page);
  const bar = page.locator('[data-slot=status-bar]');
  await expect(bar).toContainText('Unsaved edits kept in this browser');
  await expect(
    bar.locator('[data-slot=status-bar-state] span[aria-hidden=true]')
  ).toHaveCount(1);
  expect(
    await bar
      .locator('[data-slot=status-bar-state]')
      .evaluate((node) => node.textContent?.trim())
  ).toBe('Unsaved edits kept in this browser');
});
