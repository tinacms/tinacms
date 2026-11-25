import { type Locator, type Page, expect, test } from '@playwright/test';
import { fakeKeyboard } from './fake-keyboard';
import { formColumn } from './form-column';

const HOME = `/?preview=${encodeURIComponent('/plain.html')}#/collections/page/${encodeURIComponent('content/pages/home.mdx')}`;

const TOP_BAR = 56;
// The preview is 364px narrower than the window, so under 440px at this width.
const NARROW_TABLET = 800;
const CHECKLIST =
  '/#/collections/checklist/content%2Fchecklists%2Ftwo-errors.mdx';

const box = async (locator: Locator) => {
  await locator.first().waitFor();
  const found = await locator.boundingBox();
  if (!found) throw new Error('no box');
  return found;
};

const heroField = (page: Page) =>
  page.getByRole('group', { name: 'Hero image' });

const openPicker = async (page: Page) => {
  const hero = heroField(page);
  await expect(hero).toBeVisible();
  const replace = hero.getByRole('button', { name: /^Replace / });
  if ((await replace.count()) > 0) await replace.click();
  else await hero.getByRole('button', { name: 'Choose from Media' }).click();
  const picker = page.getByRole('region', { name: 'Choose an image' });
  await expect(picker).toBeVisible();
  // The panel slides in over --dur; measure once it has stopped.
  await page.waitForTimeout(400);
  return picker;
};

const previewRegion = (page: Page) => page.locator('[data-preview-slot]');

const sideways = (page: Page) =>
  page.evaluate(() => {
    const root = document.scrollingElement;
    return root ? root.scrollWidth - root.clientWidth : 0;
  });

test.describe('desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('is a 400px popover 12px inside the preview, and Maximise covers the preview only', async ({
    page,
  }) => {
    await page.goto(HOME);
    const formBefore = await box(formColumn(page));
    const picker = await openPicker(page);
    const panel = page.locator('[data-slot=media-picker-host]');
    const region = await box(previewRegion(page));
    const rect = await box(panel);
    expect(Math.round(rect.width)).toBe(400);
    expect(Math.round(rect.y - region.y)).toBe(12);
    expect(Math.round(region.x + region.width - (rect.x + rect.width))).toBe(
      12
    );
    expect(Math.round(region.y + region.height - (rect.y + rect.height))).toBe(
      12
    );
    expect(Math.round((await box(formColumn(page))).width)).toBe(
      Math.round(formBefore.width)
    );
    await expect(heroField(page)).toBeVisible();

    await picker.getByRole('button', { name: 'Maximise' }).click();
    await page.waitForTimeout(300);
    const maximised = await box(panel);
    expect(Math.round(maximised.x - region.x)).toBe(12);
    expect(Math.round(maximised.width)).toBe(Math.round(region.width - 24));
    const upload = await box(picker.getByRole('button', { name: 'Upload' }));
    const restoreButton = await box(
      picker.getByRole('button', { name: 'Restore' })
    );
    expect(restoreButton.x - (upload.x + upload.width)).toBeLessThan(16);
    await picker.getByRole('button', { name: 'Restore' }).click();
    await page.waitForTimeout(300);
    expect(Math.round((await box(panel)).width)).toBe(400);
  });

  test('keeps its header and footer pinned while the library scrolls', async ({
    page,
  }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    const header = await box(picker.locator('[data-slot=panel-header]'));
    const footer = await box(picker.locator('[data-slot=picker-footer]'));
    const library = picker.getByRole('region', { name: 'Media library' });
    await library.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    expect(await box(picker.locator('[data-slot=panel-header]'))).toEqual(
      header
    );
    expect(await box(picker.locator('[data-slot=picker-footer]'))).toEqual(
      footer
    );
  });

  test('closes when the preview expands and when Media opens', async ({
    page,
  }) => {
    await page.goto(HOME);
    await openPicker(page);
    // The popover covers the preview toolbar, so the keyboard reaches Expand.
    await page.getByRole('button', { name: /Expand preview/i }).focus();
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('region', { name: 'Choose an image' })
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => document.activeElement === document.body)
    ).toBe(false);
  });

  test('closes without writing when Media opens from the rail', async ({
    page,
  }) => {
    await page.goto(HOME);
    await openPicker(page);
    await page.getByRole('button', { name: 'Media', exact: true }).click();
    await expect(
      page.getByRole('region', { name: 'Choose an image' })
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => document.activeElement === document.body)
    ).toBe(false);
  });

  test('keeps the picker open and re-laid out across the width tiers, with its picks', async ({
    page,
  }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    await picker.getByRole('button', { name: 'preview.svg' }).click();
    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(picker).toBeVisible();
    await expect(picker.getByText('1 picked')).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(picker).toBeVisible();
    await expect(picker.getByText('1 picked')).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(picker.getByText('1 picked')).toBeVisible();
  });

  test('slides in with no transition under reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(HOME);
    await heroField(page)
      .getByRole('button', { name: /Choose from Media|^Replace / })
      .first()
      .click();
    const panel = page.locator('[data-slot=media-picker-host]');
    await expect(panel).toBeVisible();
    const transition = await panel.evaluate(
      (node) => getComputedStyle(node).transitionDuration
    );
    expect(transition.split(',').every((part) => part.trim() === '0s')).toBe(
      true
    );
  });

  test('the field shows Replace and Remove on hover and focus, never at rest', async ({
    page,
  }) => {
    await page.goto(HOME);
    const hero = heroField(page);
    await expect(hero).toBeVisible();
    const choose = hero.getByRole('button', { name: 'Choose from Media' });
    if ((await choose.count()) > 0) {
      await choose.click();
      const picker = page.getByRole('region', { name: 'Choose an image' });
      await picker.getByRole('button', { name: 'preview.svg' }).click();
      await picker.getByRole('button', { name: 'Choose image' }).click();
    }
    const replace = hero.getByRole('button', { name: /^Replace / });
    const opacity = () =>
      replace.evaluate(
        (node) => getComputedStyle(node.parentElement ?? node).opacity
      );
    await page.mouse.move(0, 0);
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await expect.poll(opacity).toBe('0');
    await hero.getByRole('figure').hover();
    await expect.poll(opacity).toBe('1');
    await page.mouse.move(0, 0);
    await replace.focus();
    await expect.poll(opacity).toBe('1');
  });
});

test.describe('tablet', () => {
  test.use({ viewport: { width: 1024, height: 800 } });

  test('keeps a readable popover: at least 360px wide, or covering the page', async ({
    page,
  }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    const rect = await box(page.locator('[data-slot=media-picker-host]'));
    expect(rect.width).toBeGreaterThanOrEqual(360);
    await expect(
      picker.getByRole('heading', { name: 'Choose an image' })
    ).toBeVisible();
    await expect(picker.getByText('0 picked')).toBeVisible();
  });

  test('covers the page with no Maximise when the preview is under 440px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: NARROW_TABLET, height: 800 });
    await page.goto(HOME);
    const picker = await openPicker(page);
    await expect(picker.getByRole('button', { name: 'Maximise' })).toHaveCount(
      0
    );
    await expect(picker.getByRole('button', { name: 'Restore' })).toHaveCount(
      0
    );
    const rect = await box(page.locator('[data-slot=media-picker-host]'));
    expect(Math.round(rect.x)).toBe(0);
    expect(Math.round(rect.width)).toBe(NARROW_TABLET);
    expect(Math.round(rect.y)).toBe(TOP_BAR);
  });
});

test.describe('tablet with a wide enough preview', () => {
  test.use({ viewport: { width: 1100, height: 800 } });

  test('Maximise fills the space below the top bar, form included', async ({
    page,
  }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    await picker.getByRole('button', { name: 'Maximise' }).click();
    await page.waitForTimeout(300);
    const rect = await box(page.locator('[data-slot=media-picker-host]'));
    expect(Math.round(rect.x)).toBe(0);
    expect(Math.round(rect.width)).toBe(1100);
    expect(Math.round(rect.y)).toBe(TOP_BAR);
    const covered = await box(heroField(page));
    expect(covered.x + covered.width).toBeLessThanOrEqual(rect.x + rect.width);
    expect(covered.x).toBeGreaterThanOrEqual(rect.x);
  });

  test('sits 12px under the preview toolbar, leaving it clickable', async ({
    page,
  }) => {
    await page.goto(HOME);
    await openPicker(page);
    const toolbar = await box(
      previewRegion(page).locator('[data-slot=preview-toolbar]')
    );
    const rect = await box(page.locator('[data-slot=media-picker-host]'));
    expect(Math.round(rect.y - (toolbar.y + toolbar.height))).toBe(12);
    const region = await box(previewRegion(page));
    expect(Math.round(region.y + region.height - (rect.y + rect.height))).toBe(
      12
    );
  });

  test('Maximise preview by mouse closes the picker', async ({ page }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    await page.getByRole('button', { name: 'Maximise preview' }).click();
    await expect(picker).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Restore preview' })
    ).toBeVisible();
  });

  test('Maximise preview by keyboard closes the picker and focuses Restore preview', async ({
    page,
  }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    await page.getByRole('button', { name: 'Maximise preview' }).focus();
    await page.keyboard.press('Enter');
    await expect(picker).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Restore preview' })
    ).toBeFocused();
  });

  test('Maximise form by keyboard closes the picker', async ({ page }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    await page.getByRole('button', { name: 'Maximise form' }).focus();
    await page.keyboard.press('Enter');
    await expect(picker).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Restore form' })
    ).toBeVisible();
  });

  test('narrowing the window swaps the maximised picker for the cover with no Restore, and widening restores the popover', async ({
    page,
  }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    await picker.getByRole('button', { name: 'Maximise' }).click();
    await page.setViewportSize({ width: NARROW_TABLET, height: 800 });
    await expect(picker.getByRole('button', { name: 'Restore' })).toHaveCount(
      0
    );
    await expect(picker.getByRole('button', { name: 'Maximise' })).toHaveCount(
      0
    );
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect(
      picker.getByRole('button', { name: 'Maximise' })
    ).toBeVisible();
  });
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('fills the space below the top bar, has no Maximise and no sideways scroll', async ({
    page,
  }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    const rect = await box(page.locator('[data-slot=media-picker-host]'));
    expect(Math.round(rect.x)).toBe(0);
    expect(Math.round(rect.width)).toBe(390);
    expect(Math.round(rect.y)).toBe(TOP_BAR);
    await expect(picker.getByRole('button', { name: 'Maximise' })).toHaveCount(
      0
    );
    expect(await sideways(page)).toBe(0);
  });

  test('keeps the header, search, a row of results and the footer in view with the keyboard up', async ({
    page,
  }) => {
    await page.goto(HOME);
    const picker = await openPicker(page);
    const search = picker.getByRole('searchbox', {
      name: 'Search this folder',
    });
    await search.focus();
    await fakeKeyboard(page, 336);
    const visibleBottom = 844 - 336;
    await expect
      .poll(async () => {
        const footer = await box(picker.locator('[data-slot=picker-footer]'));
        return Math.round(footer.y + footer.height);
      })
      .toBeLessThanOrEqual(visibleBottom);
    const header = await box(picker.locator('[data-slot=panel-header]'));
    expect(header.y).toBeGreaterThanOrEqual(0);
    const searchBox = await box(search);
    expect(searchBox.y + searchBox.height).toBeLessThanOrEqual(visibleBottom);
    const firstImage = await box(
      picker.getByRole('list', { name: 'Images' }).getByRole('button').first()
    );
    expect(firstImage.y + firstImage.height).toBeLessThanOrEqual(visibleBottom);
    const library = picker.getByRole('region', { name: 'Media library' });
    expect(
      await library.evaluate((node) => getComputedStyle(node).overflowY)
    ).toBe('auto');
  });
});

const chooseHero = async (page: Page) => {
  const picker = await openPicker(page);
  await picker.getByRole('button', { name: 'preview.svg' }).click();
  await picker.getByRole('button', { name: 'Choose image' }).click();
  await expect(picker).toHaveCount(0);
};

for (const width of [1440, 390]) {
  test.describe(`field look at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('shows the chosen picture at 4:3 across the field, and the empty area as wide', async ({
      page,
    }) => {
      await page.goto(HOME);
      const hero = heroField(page);
      await expect(hero).toBeVisible();
      const empty = await hero.getByRole('button', {
        name: 'Choose from Media',
      });
      if ((await empty.count()) > 0) {
        const area = await box(empty.locator('xpath=..').locator('xpath=..'));
        const field = await box(hero);
        expect(Math.round(area.width)).toBe(Math.round(field.width));
      }
      await chooseHero(page);
      const picture = await box(
        hero.getByRole('figure').locator('div').first()
      );
      const field = await box(hero);
      expect(Math.round(picture.width)).toBe(Math.round(field.width));
      expect(Math.abs(picture.width / picture.height - 4 / 3)).toBeLessThan(
        0.02
      );
      expect(await sideways(page)).toBe(0);
    });

    test('shows gallery tiles at 4:3, three across, in a grid of at most 480px', async ({
      page,
    }) => {
      await page.goto(CHECKLIST);
      const add = page.getByRole('button', { name: 'Add images' });
      await expect(add).toBeVisible();
      const gallery = add.locator('xpath=ancestor::div[@role="group"][1]');
      for (const name of ['preview.svg', 'sample-01.svg', 'sample-02.svg']) {
        await gallery.getByRole('button', { name: 'Add images' }).click();
        const picker = page.getByRole('region', { name: 'Choose images' });
        await picker.getByRole('button', { name }).click();
        await picker.getByRole('button', { name: 'Add image' }).click();
      }
      const tiles = gallery.getByRole('figure');
      await expect(tiles).toHaveCount(3);
      const first = await box(tiles.nth(0).locator('div').first());
      const third = await box(tiles.nth(2).locator('div').first());
      expect(Math.abs(first.width / first.height - 4 / 3)).toBeLessThan(0.02);
      expect(Math.abs(first.y - third.y)).toBeLessThan(1);
      const grid = await box(gallery.locator('.grid'));
      expect(grid.width).toBeLessThanOrEqual(480);
      expect(await sideways(page)).toBe(0);
    });
  });
}

test.describe('phone modality', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('makes the page behind the picker inert, and the desktop popover does not', async ({
    page,
  }) => {
    await page.goto(HOME);
    await openPicker(page);
    expect(
      await page.evaluate(
        () => document.querySelectorAll('body > [inert]').length
      )
    ).toBeGreaterThan(0);
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(
      page.getByRole('region', { name: 'Choose an image' })
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.querySelectorAll('body > [inert]').length)
      )
      .toBe(0);
  });
});
