import { type Page, expect, test } from '@playwright/test';
import { columnWidth, setColumnWidth } from './form-column';

const HELLO = 'content/posts/hello-world.mdx';
const SECOND = 'content/posts/second-post.mdx';

const adminUrl = (preview: string, hash = '/page') =>
  `/?preview=${encodeURIComponent(preview)}#${hash}`;
const postHash = (path: string) =>
  `/collections/post/${encodeURIComponent(path)}`;
const declared = (path: string) => `/declared.html?post=${path}`;
const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');
const toolbar = (page: Page) =>
  page.getByRole('group', { name: 'Preview toolbar' });
const address = (page: Page) =>
  page.getByRole('textbox', { name: 'Page address' });
const form = (page: Page) =>
  page.getByRole('complementary', { name: 'Document form' });
const heading = (page: Page) => form(page).locator('h2').first();
const actions = (page: Page) =>
  toolbar(page).getByRole('button', { name: 'Preview actions' });
const ground = (page: Page) =>
  page.locator('[data-slot=preview-frame] > div').first();

const markFrame = (page: Page) =>
  page.evaluate(() => {
    const node = document.querySelector('iframe[title="Preview"]');
    if (node) node.setAttribute('data-mark', 'same');
  });
const sameFrame = (page: Page) =>
  page.locator('iframe[title="Preview"][data-mark="same"]');

test.describe('address', () => {
  test('follows a link click to a page without Tina, and Reload and Open in new tab use that page', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    await expect(toolbar(page)).toBeVisible();
    await expect(address(page)).toHaveValue(/^localhost:\d+\/plain\.html$/);
    await frame(page).getByTestId('plain-link').click();
    await expect(address(page)).toHaveValue(/\/plain\.html\?second=1$/);

    await actions(page).click();
    await page.getByRole('menuitem', { name: 'Reload' }).click();
    await expect(frame(page).getByTestId('query')).toHaveText('?second=1');

    await actions(page).click();
    const popup = page.waitForEvent('popup');
    await page.getByRole('menuitem', { name: 'Open in new tab' }).click();
    expect((await popup).url()).toMatch(/\/plain\.html\?second=1$/);
  });

  test('Enter moves the preview in place, in all three forms, and the form follows the page', async ({
    page,
  }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await expect(frame(page).getByTestId('post-title')).toBeVisible();
    await markFrame(page);
    await expect(heading(page)).toHaveText(/^Hello World/);

    const box = address(page);
    await box.fill(`/declared.html?post=${SECOND}`);
    await box.press('Enter');
    await expect(frame(page).getByTestId('post-title')).toHaveText(/Second/i);
    await expect(heading(page)).not.toHaveText(/^Hello World/);
    await expect(sameFrame(page)).toHaveCount(1);
    await expect(box).toBeFocused();
    await expect(box).toHaveValue(/^localhost:\d+\/declared\.html\?post=/);

    await box.fill(`declared.html?post=${HELLO}`);
    await box.press('Enter');
    await expect(heading(page)).toHaveText(/^Hello World/);
    await expect(sameFrame(page)).toHaveCount(1);
  });

  test('a page that declares no document goes to Nothing to edit', async ({
    page,
  }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await expect(frame(page).getByTestId('post-title')).toBeVisible();
    const box = address(page);
    await box.fill('/declared.html?view=blog');
    await box.press('Enter');
    await expect(heading(page)).toHaveText('Nothing to edit on this page');
  });

  test('refuses other origins and schemes with an announced error that clears on the next key', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    const box = address(page);
    const before = await box.inputValue();
    for (const typed of [
      'https://other.test/',
      '//other.test/',
      'javascript:alert(1)',
      'data:text/html,x',
    ]) {
      await box.fill(typed);
      await box.press('Enter');
      await expect(
        page.getByRole('alert').filter({ hasText: /Type an address/ })
      ).toBeVisible();
      await expect(box).toHaveAttribute('aria-invalid', 'true');
      await expect(frame(page).getByTestId('plain-title')).toBeVisible();
      await box.press('x');
      await expect(
        page.getByRole('alert').filter({ hasText: /Type an address/ })
      ).toHaveCount(0);
    }
    await box.fill('');
    await box.press('Enter');
    await expect(
      page.getByRole('alert').filter({ hasText: /Type an address/ })
    ).toHaveCount(0);
    expect(before).toMatch(/plain\.html$/);
  });

  test('does not replace text the editor is typing when the page moves', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    const box = address(page);
    await box.click();
    await box.fill('half typed');
    await frame(page)
      .getByTestId('plain-link')
      .evaluate((a) => (a as HTMLElement).click());
    await page.waitForTimeout(400);
    await expect(box).toHaveValue('half typed');
  });

  test('a hash-only address moves the page with no loading state, and the same address reloads', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    await expect(frame(page).getByTestId('plain-title')).toBeVisible();
    const box = address(page);
    await box.fill('/plain.html#anchor');
    await box.press('Enter');
    await expect(page.getByText('Loading the page')).toHaveCount(0);
    await expect(box).toHaveValue(/plain\.html#anchor$/);

    await frame(page)
      .getByTestId('plain-title')
      .evaluate((node) => {
        node.ownerDocument.defaultView?.sessionStorage.setItem('seen', '1');
        node.setAttribute('data-stale', 'yes');
      });
    await box.press('Enter');
    await expect(frame(page).getByTestId('plain-title')).not.toHaveAttribute(
      'data-stale',
      'yes'
    );
  });
});

test.describe('device size and scale', () => {
  test.use({ viewport: { width: 1600, height: 900 } });

  test('Tablet and Phone draw the page at 768 and 390 and Fit shows the drawn width', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    const devices = toolbar(page).getByRole('group', { name: 'Device size' });
    const fit = devices.getByRole('button', { name: /^Fit/ });
    await expect(fit).toHaveAttribute('aria-pressed', 'true');
    await expect(frame(page).getByTestId('inner-width')).toHaveText(/\d{3,4}/);
    const readout = await toolbar(page)
      .getByText(/^\d+px$/)
      .textContent();
    const drawn = await frame(page).getByTestId('inner-width').textContent();
    expect(readout).toBe(`${drawn}px`);

    await devices.getByRole('button', { name: /^Tablet/ }).click();
    await expect(
      devices.getByRole('button', { name: /^Tablet/ })
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(frame(page).getByTestId('inner-width')).toHaveText('768');
    await devices.getByRole('button', { name: /^Phone/ }).click();
    await expect(frame(page).getByTestId('inner-width')).toHaveText('390');
    await fit.click();
    await expect(frame(page).getByTestId('inner-width')).toHaveText(
      drawn ?? ''
    );
  });

  test('dragging the form column changes the drawn width', async ({ page }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    const readout = toolbar(page).getByText(/^\d+px$/);
    await expect(readout).toBeVisible();
    const before = Number.parseInt((await readout.textContent()) ?? '0', 10);
    await setColumnWidth(page, (await columnWidth(page)) + 120);
    await expect
      .poll(async () =>
        Number.parseInt((await readout.textContent()) ?? '0', 10)
      )
      .toBeLessThan(before);
  });
});

test.describe('scale', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Tablet in a narrow preview scales to fit, the Scale menu changes it and 100% scrolls sideways', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    await toolbar(page)
      .getByRole('button', { name: /^Tablet/ })
      .click();
    const room = await ground(page).evaluate((node) => node.clientWidth - 32);
    expect(room).toBeLessThan(768);
    const fit = Math.round((Math.floor((room / 768) * 1000) / 1000) * 100);
    const scale = toolbar(page).getByRole('button', { name: /^768px, scale/ });
    await expect(scale).toHaveText(`768px · ${fit}%`);
    const geometry = await ground(page).evaluate((node) => ({
      sideways: node.scrollWidth > node.clientWidth,
      pageHeight: document
        .querySelector('iframe[title="Preview"]')
        ?.getBoundingClientRect().height,
      groundHeight: node.clientHeight - 32,
    }));
    expect(geometry.sideways).toBe(false);
    expect(
      Math.abs((geometry.pageHeight ?? 0) - geometry.groundHeight)
    ).toBeLessThanOrEqual(2);

    await scale.click();
    await page.getByRole('menuitemcheckbox', { name: '50%' }).click();
    await expect(scale).toHaveText('768px · 50%');
    await scale.click();
    await page.getByRole('menuitemcheckbox', { name: '100%' }).click();
    await expect(scale).toHaveText('768px · 100%');
    expect(
      await ground(page).evaluate((n) => n.scrollWidth > n.clientWidth)
    ).toBe(true);
    await scale.click();
    await page
      .getByRole('menuitemcheckbox', { name: 'Fit to the preview' })
      .click();
    await expect(scale).toHaveText(`768px · ${fit}%`);
  });
});

test.describe('remembering the device size', () => {
  test.use({ viewport: { width: 1600, height: 900 } });

  test('survives a reload, and an unknown value starts at Fit', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    await toolbar(page)
      .getByRole('button', { name: /^Phone/ })
      .click();
    await page.reload();
    await expect(
      toolbar(page).getByRole('button', { name: /^Phone/ })
    ).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() =>
      localStorage.setItem('tina-preview-device', 'sideways')
    );
    await page.reload();
    await expect(
      toolbar(page).getByRole('button', { name: /^Fit/ })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('a localStorage that throws does not break the toolbar', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const { getItem, setItem } = Storage.prototype;
      Storage.prototype.getItem = function (key: string) {
        if (key === 'tina-preview-device') throw new Error('blocked');
        return getItem.call(this, key);
      };
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key === 'tina-preview-device') throw new Error('blocked');
        return setItem.call(this, key, value);
      };
    });
    await page.goto(adminUrl('/plain.html'));
    await expect(
      toolbar(page).getByRole('button', { name: /^Fit/ })
    ).toHaveAttribute('aria-pressed', 'true');
    await toolbar(page)
      .getByRole('button', { name: /^Tablet/ })
      .click();
    await expect(frame(page).getByTestId('inner-width')).toHaveText('768');
  });
});

test.describe('expand', () => {
  test.use({ viewport: { width: 1400, height: 900 } });

  test('hides the side nav and form, then Collapse and Esc bring them back with the same field and frame', async ({
    page,
  }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await expect(frame(page).getByTestId('post-title')).toBeVisible();
    await markFrame(page);
    const title = page.getByRole('textbox', { name: /^title\b/i });
    await title.fill('Kept title');
    const expand = toolbar(page).getByRole('button', {
      name: 'Expand preview',
    });
    await expand.click();
    await expect(form(page)).toBeHidden();
    await expect(
      page.getByRole('navigation', { name: 'Content' })
    ).toBeHidden();
    const collapse = toolbar(page).getByRole('button', {
      name: 'Collapse preview',
    });
    await expect(collapse).toBeFocused();
    const room = await page.locator('[data-preview-slot]').boundingBox();
    expect(room?.x).toBe(0);

    await collapse.click();
    await expect(form(page)).toBeVisible();
    await expect(
      toolbar(page).getByRole('button', { name: 'Expand preview' })
    ).toBeFocused();
    await expect(title).toHaveValue('Kept title');
    await expect(sameFrame(page)).toHaveCount(1);

    await toolbar(page).getByRole('button', { name: 'Expand preview' }).click();
    await address(page).focus();
    await page.keyboard.press('Escape');
    await expect(form(page)).toBeVisible();
    await expect(title).toHaveValue('Kept title');
    await expect(sameFrame(page)).toHaveCount(1);
  });

  test('Esc that closes the ⋯ menu only closes the menu', async ({ page }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await toolbar(page).getByRole('button', { name: 'Expand preview' }).click();
    await actions(page).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(form(page)).toBeHidden();
  });

  test('a click on a marked part at Tablet size, scaled, collapses and opens that field', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await toolbar(page)
      .getByRole('button', { name: /^Tablet/ })
      .click();
    await toolbar(page).getByRole('button', { name: 'Expand preview' }).click();
    await expect(form(page)).toBeHidden();
    await frame(page).getByTestId('post-title').click();
    await expect(form(page)).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: /^title\b/i })
    ).toBeFocused();
  });

  test('leaving the route collapses it, and a link that opens another document does not', async ({
    page,
  }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await expect(frame(page).getByTestId('post-title')).toBeVisible();
    await toolbar(page).getByRole('button', { name: 'Expand preview' }).click();
    await address(page).fill(`/declared.html?post=${SECOND}`);
    await address(page).press('Enter');
    await expect(frame(page).getByTestId('post-title')).toHaveText(/Second/i);
    await expect(
      toolbar(page).getByRole('button', { name: 'Collapse preview' })
    ).toBeVisible();
    await expect(form(page)).toBeHidden();

    await page.evaluate(() => {
      location.hash = '/';
    });
    await expect(
      page.getByRole('navigation', { name: 'Content' })
    ).toBeVisible();
    await page.evaluate((hash) => {
      location.hash = hash;
    }, postHash(SECOND));
    await expect(form(page)).toBeVisible();
    await expect(
      toolbar(page).getByRole('button', { name: 'Expand preview' })
    ).toBeVisible();
  });

  test('narrowing to phone width collapses it', async ({ page }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await toolbar(page).getByRole('button', { name: 'Expand preview' }).click();
    await expect(form(page)).toBeHidden();
    await page.setViewportSize({ width: 600, height: 800 });
    await expect(
      toolbar(page).getByRole('button', {
        name: /Collapse preview|Expand preview/,
      })
    ).toHaveCount(0);
  });
});

test.describe('loading, reloading and failing', () => {
  test('shows the spinner above the words until the slow page loads, and a second Enter wins', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    await expect(frame(page).getByTestId('plain-title')).toBeVisible();
    const box = address(page);
    await box.fill('/slow.html?ms=2500');
    await box.press('Enter');
    await expect(
      page.getByRole('status').filter({ hasText: 'Loading the page' })
    ).toBeVisible();
    await box.fill('/slow.html?ms=700');
    await box.press('Enter');
    await expect(frame(page).getByTestId('slow-title')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText('Loading the page')).toHaveCount(0);
  });

  test('Reload keeps the page under a scrim, and an unsaved edit still shows', async ({
    page,
  }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await expect(frame(page).getByTestId('post-title')).toBeVisible();
    await page
      .getByRole('textbox', { name: /^title\b/i })
      .fill('Draft headline');
    await expect(frame(page).getByTestId('post-title')).toHaveText(
      'Draft headline'
    );
    await page.route('**/declared.html**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });
    await actions(page).click();
    await page.getByRole('menuitem', { name: 'Reload' }).click();
    const reloading = page
      .getByRole('status')
      .filter({ hasText: 'Reloading the page' });
    await expect(reloading).toBeVisible();
    await expect(reloading).toHaveCount(0, { timeout: 10000 });
    await expect(frame(page).getByTestId('post-title')).toHaveText(
      'Draft headline'
    );
  });

  test('a site that is down shows the note with Reload, and Reload shows the page once it is up', async ({
    page,
  }) => {
    const key = `k${Date.now()}`;
    await page.goto(adminUrl('/plain.html'));
    const box = address(page);
    await box.fill(`/down.html?key=${key}`);
    await box.press('Enter');
    const note = page
      .getByRole('status')
      .filter({ hasText: 'The page didn’t load' });
    await expect(note).toBeVisible({ timeout: 15000 });
    await expect(page.locator('iframe[title="Preview"]')).toBeHidden();
    await page.request.get(`/__up?key=${key}`);
    await note.getByRole('button', { name: 'Reload' }).dispatchEvent('click');
    await expect(frame(page).getByTestId('down-title')).toBeVisible({
      timeout: 15000,
    });
    await expect(note).toHaveCount(0);
  });

  test('a 404 or 500 shows the site’s own page, not the note', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    for (const status of ['404', '500']) {
      const box = address(page);
      await box.fill(`/status/${status}`);
      await box.press('Enter');
      await expect(frame(page).getByTestId('status-title')).toHaveText(
        `Site says ${status}`
      );
      await expect(page.getByText('The page didn’t load')).toHaveCount(0);
    }
  });
});

test.describe('window tiers', () => {
  test('a tablet-width window moves the device sizes into ⋯ and keeps Expand', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await page.goto(adminUrl('/plain.html'));
    await expect(
      toolbar(page).getByRole('group', { name: 'Device size' })
    ).toHaveCount(0);
    await expect(
      toolbar(page).getByRole('button', { name: 'Expand preview' })
    ).toBeVisible();
    await actions(page).click();
    await expect(page.getByText('Device size')).toBeVisible();
    await page.getByRole('menuitemcheckbox', { name: 'Tablet' }).click();
    await expect(frame(page).getByTestId('inner-width')).toHaveText('768');
    await expect(
      toolbar(page).getByRole('button', { name: /^768px, scale/ })
    ).toBeVisible();
  });

  test('a phone-width window shows the address and ⋯ only, draws a stored Tablet at Fit, and draws it again when wider', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(adminUrl('/plain.html'));
    await toolbar(page)
      .getByRole('button', { name: /^Tablet/ })
      .click();
    await page.setViewportSize({ width: 600, height: 800 });
    await expect(toolbar(page).getByRole('button')).toHaveCount(1);
    await expect(actions(page)).toBeVisible();
    await expect(frame(page).getByTestId('inner-width')).not.toHaveText('768');
    await page.setViewportSize({ width: 1600, height: 900 });
    await expect(frame(page).getByTestId('inner-width')).toHaveText('768');
  });
});

test('every toolbar control is reachable with Tab and has a name', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto(adminUrl('/plain.html'));
  await address(page).focus();
  const seen: string[] = [];
  for (let step = 0; step < 8; step++) {
    await page.keyboard.press('Tab');
    const name = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.closest('[data-slot=preview-toolbar]')
        ? (el.getAttribute('aria-label') ?? el.textContent ?? '')
        : '';
    });
    if (name) seen.push(name);
  }
  expect(seen).toEqual([
    expect.stringMatching(/^Fit/),
    expect.stringMatching(/^Tablet/),
    expect.stringMatching(/^Phone/),
    'Preview actions',
    'Expand preview',
  ]);
});

test('with no preview the slot shows the note, whose link opens the docs, and no toolbar', async ({
  page,
}) => {
  await page.goto(`/?preview=none#${postHash(HELLO)}`);
  await expect(
    page.getByRole('button', { name: 'How previews are set up' })
  ).toBeVisible();
  await expect(toolbar(page)).toHaveCount(0);
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'How previews are set up' }).click();
  expect((await popup).url()).toContain('tina.io/docs');
});

test.describe('narrow pane', () => {
  const overlaps = (a: Box, b: Box) =>
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height;
  type Box = { x: number; y: number; width: number; height: number };

  for (const width of [768, 800, 820, 860]) {
    for (const device of ['Tablet', 'Phone']) {
      for (const scale of ['fit', '50%']) {
        test(`at ${width}px with ${device} at ${scale}, the address stays usable, nothing overlaps and ⋯ is inside the window`, async ({
          page,
        }) => {
          await page.setViewportSize({ width, height: 800 });
          await page.goto(adminUrl('/plain.html'));
          await expect(toolbar(page)).toBeVisible();
          await actions(page).click();
          await page
            .getByRole('menuitemcheckbox', { name: new RegExp(`^${device}`) })
            .click();
          if (scale !== 'fit') {
            const scaleButton = toolbar(page).getByRole('button', {
              name: /scale/,
            });
            if (await scaleButton.count()) {
              await scaleButton.click();
            } else {
              await actions(page).click();
            }
            await page.getByRole('menuitemcheckbox', { name: scale }).click();
          }
          await page.waitForTimeout(200);
          const names = ['Page address', 'Preview actions', 'Expand preview'];
          const boxes: Box[] = [];
          for (const name of names) {
            const target = toolbar(page).getByRole(
              name === 'Page address' ? 'textbox' : 'button',
              { name }
            );
            if ((await target.count()) === 0) continue;
            const box = await target.boundingBox();
            if (box) boxes.push(box);
          }
          const scaleButton = toolbar(page).getByRole('button', {
            name: /scale/,
          });
          if ((await scaleButton.count()) > 0) {
            const scaleBox = await scaleButton.boundingBox();
            if (scaleBox) boxes.push(scaleBox);
          }
          const addressBox = await address(page).boundingBox();
          // 128px when the pane leaves room beside ⋯; otherwise whatever room is left.
          const wide = (await ground(page).boundingBox())?.width ?? 0;
          expect(addressBox?.width ?? 0).toBeGreaterThanOrEqual(
            Math.min(128, wide - 60)
          );
          const more = await actions(page).boundingBox();
          expect((more?.x ?? 0) + (more?.width ?? 0)).toBeLessThanOrEqual(
            width
          );
          for (const [index, a] of boxes.entries()) {
            expect(a.x + a.width).toBeLessThanOrEqual(width);
            for (const b of boxes.slice(index + 1))
              expect(overlaps(a, b)).toBe(false);
          }
          expect(
            await page.evaluate(
              () =>
                document.querySelector('[data-slot=sidebar-wrapper]')
                  ?.scrollLeft
            )
          ).toBe(0);
        });
      }
    }
  }

  test('Expand stays reachable in ⋯ when the pane is too narrow for the button', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.goto(adminUrl('/plain.html'));
    await actions(page).click();
    await page.getByRole('menuitemcheckbox', { name: /^Tablet/ }).click();
    await expect(
      toolbar(page).getByRole('button', { name: 'Expand preview' })
    ).toHaveCount(0);
    await actions(page).click();
    await page.getByRole('menuitem', { name: 'Expand preview' }).click();
    await expect(
      page.getByRole('navigation', { name: 'Content' })
    ).toBeHidden();
    await toolbar(page)
      .getByRole('button', { name: 'Collapse preview' })
      .click();
    await expect(
      page.getByRole('navigation', { name: 'Content' })
    ).toBeVisible();
  });
});

test('a form column dragged wide at desktop width moves controls into ⋯ and keeps the address usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
  await toolbar(page)
    .getByRole('button', { name: /^Tablet/ })
    .click();
  await setColumnWidth(page, 1000);
  await expect(
    toolbar(page).getByRole('group', { name: 'Device size' })
  ).toHaveCount(0);
  const box = await address(page).boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(128);
  const more = await actions(page).boundingBox();
  expect((more?.x ?? 0) + (more?.width ?? 0)).toBeLessThanOrEqual(1440);
  await actions(page).click();
  await expect(
    page.getByRole('menuitemcheckbox', { name: /^Phone/ })
  ).toBeVisible();
});

test.describe('375px window', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('⋯ then Esc, focusing the address and an address error leave the shell unscrolled', async ({
    page,
  }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await expect(toolbar(page)).toBeAttached();
    const scrolled = () =>
      page.evaluate(
        () => document.querySelector('[data-slot=sidebar-wrapper]')?.scrollLeft
      );
    await actions(page).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    expect(await scrolled()).toBe(0);
    await address(page).focus();
    expect(await scrolled()).toBe(0);
    await address(page).fill('//other.test/');
    await address(page).press('Enter');
    await expect(
      page.getByRole('alert').filter({ hasText: /Type an address/ })
    ).toHaveCount(1);
    expect(await scrolled()).toBe(0);
    const title = await page
      .getByRole('textbox', { name: /^title\b/i })
      .boundingBox();
    expect(title?.x ?? -1).toBeGreaterThanOrEqual(0);
  });

  test('a fast first page ends loading', async ({ page }) => {
    await page.goto(adminUrl('/plain.html'));
    await expect(frame(page).getByTestId('plain-title')).toBeAttached();
    await expect(page.getByText('Loading the page')).toHaveCount(0);
  });
});

test.describe('slow and unreachable sites', () => {
  test('a first response slower than the probe timeout still ends with the page shown', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto(adminUrl('/plain.html'));
    await expect(frame(page).getByTestId('plain-title')).toBeAttached();
    const box = address(page);
    await box.fill('/slow.html?ms=4000');
    await box.press('Enter');
    await expect(
      page.getByRole('status').filter({ hasText: 'Loading the page' })
    ).toBeVisible();
    await page.clock.fastForward(11_000);
    await expect(
      page.getByRole('status').filter({ hasText: 'Loading the page' })
    ).toBeVisible();
    await expect(frame(page).getByTestId('slow-title')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('The page didn’t load')).toHaveCount(0);
  });

  test('a host that never answers ends on the note after 30 seconds, and the error page never shows', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto(adminUrl('/plain.html'));
    await expect(frame(page).getByTestId('plain-title')).toBeAttached();
    const box = address(page);
    await box.fill('/hang.html');
    await box.press('Enter');
    await page.clock.fastForward(11_000);
    await page.clock.fastForward(31_000);
    await expect(
      page.getByRole('status').filter({ hasText: 'The page didn’t load' })
    ).toBeVisible();
    await expect(page.locator('iframe[title="Preview"]')).toBeHidden();
  });

  test('a hash-only address typed while the note shows clears it', async ({
    page,
  }) => {
    const key = `h${Date.now()}`;
    await page.goto(adminUrl('/plain.html'));
    const box = address(page);
    await box.fill(`/down.html?key=${key}`);
    await box.press('Enter');
    const note = page
      .getByRole('status')
      .filter({ hasText: 'The page didn’t load' });
    await expect(note).toBeVisible({ timeout: 15000 });
    await page.request.get(`/__up?key=${key}`);
    await box.fill(`/down.html?key=${key}#a`);
    await box.press('Enter');
    await expect(frame(page).getByTestId('down-title')).toBeVisible({
      timeout: 15000,
    });
    await expect(note).toHaveCount(0);
  });

  test('a second Reload during a reload keeps the page under the scrim', async ({
    page,
  }) => {
    await page.goto(adminUrl(declared(HELLO), postHash(HELLO)));
    await expect(frame(page).getByTestId('post-title')).toBeVisible();
    await page.route('**/declared.html**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });
    await actions(page).click();
    await page.getByRole('menuitem', { name: 'Reload' }).click();
    const reloading = page
      .getByRole('status')
      .filter({ hasText: 'Reloading the page' });
    await expect(reloading).toBeVisible();
    await actions(page).click();
    await page.getByRole('menuitem', { name: 'Reload' }).click();
    await expect(page.locator('iframe[title="Preview"]')).toBeVisible();
    await expect(frame(page).getByTestId('post-title')).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe('canvas and tooltips', () => {
  test.use({ viewport: { width: 1600, height: 900 } });

  test('a page with no background draws on the default canvas, with an edge at Tablet', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    const pageBox = page.locator('[data-slot=preview-page]');
    await expect(pageBox).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await toolbar(page)
      .getByRole('button', { name: /^Tablet/ })
      .click();
    const edge = await pageBox.evaluate(
      (node) => getComputedStyle(node).boxShadow
    );
    expect(edge).not.toBe('none');
  });

  test('Preview actions shows a tooltip on hover, and again after the menu closes with Esc', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    const tip = page.locator('[data-slot=tooltip-content]');
    await actions(page).hover();
    await expect(tip).toHaveText('Preview actions');
    await page.mouse.move(5, 400);
    await actions(page).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    await toolbar(page).getByRole('button', { name: 'Expand preview' }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(actions(page)).toBeFocused();
    await expect(tip.filter({ hasText: 'Preview actions' })).toBeVisible();
  });
});

test.describe('Reload and a pending address', () => {
  test('Reload after a hanging address fails retries it, and never lands on the page from before', async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto(adminUrl('/plain.html'));
    await expect(frame(page).getByTestId('plain-title')).toBeAttached();
    const box = address(page);
    await box.fill('/hang.html');
    await box.press('Enter');
    await page.clock.fastForward(11_000);
    await page.clock.fastForward(31_000);
    const note = page
      .getByRole('status')
      .filter({ hasText: 'The page didn’t load' });
    await expect(note).toBeVisible();
    await note.getByRole('button', { name: 'Reload' }).dispatchEvent('click');
    await expect(
      page.getByRole('status').filter({ hasText: 'Loading the page' })
    ).toBeVisible();
    await expect(page.locator('iframe[title="Preview"]')).toHaveAttribute(
      'src',
      /\/hang\.html$/
    );
    await expect(box).toHaveValue(/\/hang\.html$/);
    await page.clock.fastForward(11_000);
    await page.clock.fastForward(31_000);
    await expect(note).toBeVisible();
    await expect(page.locator('iframe[title="Preview"]')).toBeHidden();
  });

  test('Reload from ⋯ during a slow load retries the typed address, and Open in new tab opens it', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    await expect(frame(page).getByTestId('plain-title')).toBeAttached();
    const box = address(page);
    await box.fill('/slow.html?ms=3000');
    await box.press('Enter');
    await expect(
      page.getByRole('status').filter({ hasText: 'Loading the page' })
    ).toBeVisible();
    await actions(page).click();
    const popup = page.waitForEvent('popup');
    await page.getByRole('menuitem', { name: 'Open in new tab' }).click();
    expect((await popup).url()).toMatch(/\/slow\.html\?ms=3000$/);
    await actions(page).click();
    await page.getByRole('menuitem', { name: 'Reload' }).click();
    await expect(frame(page).getByTestId('slow-title')).toBeVisible({
      timeout: 15000,
    });
    await expect(box).toHaveValue(/\/slow\.html\?ms=3000$/);
  });

  test('typing the page shown before, during a pending load, loads that page and not the pending one', async ({
    page,
  }) => {
    await page.goto(adminUrl('/plain.html'));
    await expect(frame(page).getByTestId('plain-title')).toBeAttached();
    const box = address(page);
    const before = await box.inputValue();
    await box.fill('/slow.html?ms=6000');
    await box.press('Enter');
    await expect(
      page.getByRole('status').filter({ hasText: 'Loading the page' })
    ).toBeVisible();
    await box.fill(before);
    await box.press('Enter');
    await expect(frame(page).getByTestId('plain-title')).toBeVisible({
      timeout: 10000,
    });
    await expect(box).toHaveValue(before);
  });

  test('a late load of the browser error page after the limit leaves the note in place', async ({
    page,
  }) => {
    const key = `s${Date.now()}`;
    await page.clock.install();
    await page.goto(adminUrl('/plain.html'));
    await expect(frame(page).getByTestId('plain-title')).toBeAttached();
    const box = address(page);
    await box.fill(`/stall.html?key=${key}`);
    await box.press('Enter');
    await page.clock.fastForward(11_000);
    await page.clock.fastForward(31_000);
    const note = page
      .getByRole('status')
      .filter({ hasText: 'The page didn’t load' });
    await expect(note).toBeVisible();
    await page.request.get(`/__release?key=${key}`);
    await page.waitForTimeout(1500);
    await expect(note).toBeVisible();
    await expect(page.locator('iframe[title="Preview"]')).toBeHidden();
  });
});
