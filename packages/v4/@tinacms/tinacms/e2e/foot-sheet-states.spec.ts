import { expect, type Locator, type Page, test } from '@playwright/test';

const BRANCH_DIALOG =
  '/branches.html?docs=1&fail=branch-gone#/collections/post/content%2Fposts%2Fpost-01.mdx';
const CHECKLIST =
  '/#/collections/checklist/content%2Fchecklists%2Ftwo-errors.mdx';
const POST = '/#/collections/post/content%2Fposts%2Fhello-world.mdx';
const PHONE = { width: 390, height: 844 };

const SHEET = '[data-slot=foot-sheet]:not([hidden])';
const settle = (page: Page) => page.waitForTimeout(400);

const box = async (locator: Locator) => {
  const found = await locator.boundingBox();
  if (!found) throw new Error('no box');
  return found;
};

const edit = async (page: Page, name: RegExp, text: string) => {
  const field = page.getByRole('textbox', { name });
  await field.click();
  await field.pressSequentially(text);
};

const save = (page: Page) =>
  page
    .locator('[data-slot=form-bar]')
    .getByRole('button', { name: /^(Save|Resolve)/ });

const drag = async (page: Page, handle: Locator, dy: number) => {
  const { x, y, width, height } = await box(handle);
  await page.mouse.move(x + width / 2, y + height / 2);
  await page.mouse.down();
  await page.mouse.move(x + width / 2, y + height / 2 + dy / 2, { steps: 4 });
  await page.mouse.move(x + width / 2, y + height / 2 + dy, { steps: 4 });
  await page.mouse.up();
};

const fakeKeyboard = (page: Page, shrink: number) =>
  page.evaluate((by) => {
    const visual = window.visualViewport;
    if (!visual) throw new Error('no visual viewport');
    Object.defineProperty(visual, 'height', {
      configurable: true,
      value: window.innerHeight - by,
    });
    visual.dispatchEvent(new Event('resize'));
  }, shrink);

const noSideways = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth
  );

test.describe('a plain dialog on a phone', () => {
  const open = async (page: Page) => {
    await page.setViewportSize(PHONE);
    await page.goto('/sheets.html?case=plain');
    const trigger = page.getByRole('button', { name: 'Open' });
    await trigger.click();
    await expect(page.locator(SHEET)).toBeVisible();
    await settle(page);
    return { trigger, sheet: page.locator(SHEET) };
  };

  for (const route of [
    '×',
    'Cancel',
    'scrim',
    'Escape',
    'handle tap',
    '120px drag',
  ]) {
    test(`closes by ${route} and gives focus back to the button that opened it`, async ({
      page,
    }) => {
      const { trigger, sheet } = await open(page);
      const handle = sheet.getByRole('button', { name: 'Close sheet' });
      if (route === '×') {
        await sheet.getByRole('button', { name: 'Close', exact: true }).click();
      } else if (route === 'Cancel') {
        await sheet.getByRole('button', { name: 'Cancel' }).click();
      } else if (route === 'scrim') {
        await page.mouse.click(195, 10);
      } else if (route === 'Escape') {
        await page.keyboard.press('Escape');
      } else if (route === 'handle tap') {
        await handle.click();
      } else {
        await drag(page, handle, 120);
      }
      await expect(page.locator(SHEET)).toHaveCount(0);
      await expect(trigger).toBeFocused();
    });
  }

  test('springs back on a 30px drag and scrolls its body without moving', async ({
    page,
  }) => {
    const { sheet } = await open(page);
    const before = await box(sheet);
    await drag(page, sheet.getByRole('button', { name: 'Close sheet' }), 30);
    await settle(page);
    await expect(sheet).toBeVisible();
    expect(Math.round((await box(sheet)).y)).toBe(Math.round(before.y));
    await page.mouse.move(195, 700);
    await page.mouse.wheel(0, 300);
    await expect
      .poll(() => sheet.evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
    expect(Math.round((await box(sheet)).y)).toBe(Math.round(before.y));
  });
});

test.describe('the Discard confirm on a phone', () => {
  const open = async (page: Page) => {
    await page.setViewportSize(PHONE);
    await page.goto(POST);
    await edit(page, /^Title/, '!');
    await page.getByRole('button', { name: 'Document actions' }).click();
    await page.getByRole('menuitem', { name: 'Discard unsaved edits' }).click();
    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toBeVisible();
    await settle(page);
    return confirm;
  };

  for (const route of ['×', 'handle tap', '120px drag', 'Escape']) {
    test(`cancels by ${route} and discards nothing`, async ({ page }) => {
      const confirm = await open(page);
      if (route === '×') {
        await confirm
          .getByRole('button', { name: 'Close', exact: true })
          .click();
      } else if (route === 'handle tap') {
        await confirm.getByRole('button', { name: 'Close sheet' }).click();
      } else if (route === '120px drag') {
        await drag(
          page,
          confirm.getByRole('button', { name: 'Close sheet' }),
          120
        );
      } else {
        await page.keyboard.press('Escape');
      }
      await expect(confirm).toBeHidden();
      await expect(page.getByRole('textbox', { name: /^Title/ })).toHaveValue(
        /!$/
      );
    });
  }

  test('is announced by its title and line, keeps Tab inside and locks the page behind', async ({
    page,
  }) => {
    const confirm = await open(page);
    await expect(confirm).toHaveAccessibleName(/discard/i);
    await expect(confirm).toHaveAccessibleDescription(/.+/);
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab');
      await expect
        .poll(() =>
          page.evaluate(
            () => document.activeElement?.closest('[role=alertdialog]') !== null
          )
        )
        .toBe(true);
    }
    const locked = await page.evaluate(() => {
      const html = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      return html.overflow === 'hidden' || body.overflow === 'hidden';
    });
    expect(locked).toBe(true);
  });
});

test('a branch dialog is a centred dialog at 768px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(BRANCH_DIALOG);
  await edit(page, /^Title/, '!');
  await save(page).click();
  const dialog = page.locator('[data-slot=dialog-content]');
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close sheet' })).toHaveCount(
    0
  );
  await expect(
    page.getByRole('button', { name: 'Close', exact: true })
  ).toHaveCount(0);
  const rect = await box(dialog);
  expect(rect.y + rect.height).toBeLessThan(1024 - 20);
});

test.describe('Save to a new branch on a phone, by what its callbacks hear', () => {
  const open = async (page: Page, query: string) => {
    await page.setViewportSize(PHONE);
    await page.goto(`/sheets.html?case=branch${query}`);
    const sheet = page.locator(SHEET);
    await expect(sheet).toBeVisible();
    await settle(page);
    return sheet;
  };
  const calls = (page: Page) => page.locator('#calls');
  const dismiss = async (page: Page, sheet: Locator, route: string) => {
    if (route === '×') {
      await sheet.getByRole('button', { name: 'Close', exact: true }).click();
    } else if (route === 'Cancel') {
      await sheet.getByRole('button', { name: 'Cancel' }).click();
    } else if (route === 'Escape') {
      await page.keyboard.press('Escape');
    } else if (route === 'handle tap') {
      await sheet.getByRole('button', { name: 'Close sheet' }).click();
    } else if (route === 'scrim') {
      await page.mouse.click(195, 10);
    } else {
      await drag(page, sheet.getByRole('button', { name: 'Close sheet' }), 120);
    }
  };

  for (const route of ['×', 'Cancel', 'Escape']) {
    test(`${route} calls onCancel once, with or without a name`, async ({
      page,
    }) => {
      for (const query of ['', '&name=my-branch']) {
        const sheet = await open(page, query);
        await dismiss(page, sheet, route);
        await expect(calls(page)).toHaveText('cancel=1 open=1');
      }
    });
  }

  for (const route of ['handle tap', 'scrim', '120px drag']) {
    test(`${route} calls onCancel once with the field empty, and nothing with a name`, async ({
      page,
    }) => {
      let sheet = await open(page, '');
      await dismiss(page, sheet, route);
      await expect(calls(page)).toHaveText('cancel=1 open=1');
      sheet = await open(page, '&name=my-branch');
      await dismiss(page, sheet, route);
      await settle(page);
      await expect(calls(page)).toHaveText('cancel=0 open=0');
      await expect(
        sheet.getByRole('textbox', { name: /New branch name/ })
      ).toHaveValue('my-branch');
    });
  }

  for (const route of [
    '×',
    'Cancel',
    'Escape',
    'handle tap',
    'scrim',
    '120px drag',
  ]) {
    test(`${route} does nothing while saving, and the sheet rests at the foot`, async ({
      page,
    }) => {
      const sheet = await open(page, '&name=my-branch&saving=1');
      if (route === 'Cancel') {
        await expect(
          sheet.getByRole('button', { name: 'Cancel' })
        ).toBeDisabled();
      } else {
        await dismiss(page, sheet, route);
      }
      await settle(page);
      await expect(calls(page)).toHaveText('cancel=0 open=0');
      const rect = await box(sheet);
      expect(Math.abs(rect.y + rect.height - PHONE.height)).toBeLessThanOrEqual(
        1
      );
    });
  }
});

test.describe('sheets on a phone', () => {
  for (const [side, width] of [
    ['left', 390],
    ['right', 390],
  ] as const) {
    test(`a ${side} sheet is the screen's width`, async ({ page }) => {
      await page.setViewportSize(PHONE);
      await page.goto(`/sheets.html?case=sheet&side=${side}`);
      const sheet = page.locator('[data-slot=sheet-content]');
      await expect(sheet).toBeVisible();
      await settle(page);
      expect((await box(sheet)).width).toBe(width);
    });
  }

  test('a bottom sheet is a foot sheet', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/sheets.html?case=sheet&side=bottom');
    const sheet = page.locator(SHEET);
    await expect(sheet).toBeVisible();
    await settle(page);
    const rect = await box(sheet);
    expect(Math.abs(rect.y + rect.height - 844)).toBeLessThanOrEqual(1);
    expect(rect.height).toBeGreaterThanOrEqual(421);
    await expect(
      sheet.getByRole('button', { name: 'Close sheet' })
    ).toBeVisible();
    await expect(
      sheet.getByRole('button', { name: 'Close', exact: true })
    ).toBeVisible();
  });

  for (const size of [
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
  ]) {
    test(`a right sheet is 400px wide at ${size.width}px`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto('/sheets.html?case=sheet&side=right');
      const sheet = page.locator('[data-slot=sheet-content]');
      await expect(sheet).toBeVisible();
      await settle(page);
      expect((await box(sheet)).width).toBe(400);
      await expect(
        page.getByRole('button', { name: 'Close sheet' })
      ).toHaveCount(0);
    });
  }
});

test.describe('the error list sheet', () => {
  const block = async (page: Page) => {
    await page.setViewportSize(PHONE);
    await page.goto(CHECKLIST);
    await edit(page, /^Note/, 'x');
    await save(page).click();
    const sheet = page.getByRole('dialog', { name: /^Errors/ });
    await expect(sheet).toBeVisible();
    await settle(page);
    return sheet;
  };

  test('closes by the handle and by a drag, each giving focus to Resolve', async ({
    page,
  }) => {
    const sheet = await block(page);
    await sheet.getByRole('button', { name: 'Close sheet' }).click();
    await expect(save(page)).toBeFocused();
    await save(page).click();
    await expect(sheet).toBeVisible();
    await settle(page);
    await drag(page, sheet.getByRole('button', { name: 'Close sheet' }), 120);
    await expect(sheet).toBeHidden();
    await expect(save(page)).toBeFocused();
  });

  test('tucks when the window crosses 768px, leaving the edge tab and focus on Resolve', async ({
    page,
  }) => {
    const sheet = await block(page);
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(sheet).toBeHidden();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(save(page)).toBeFocused();
    await expect(
      page.getByRole('button', { name: 'Show errors, 2' })
    ).toBeVisible();
  });

  test('leaves a stored pin alone, and the pane then docks at 1440px', async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem('tina.errorPane.pinned', 'true')
    );
    const sheet = await block(page);
    await sheet.getByRole('button', { name: 'Close', exact: true }).click();
    expect(
      await page.evaluate(() => localStorage.getItem('tina.errorPane.pinned'))
    ).toBe('true');
    await page.setViewportSize({ width: 1440, height: 900 });
    await save(page).click();
    await expect(page.locator('#error-pane')).toHaveAttribute(
      'data-layout',
      'docked'
    );
  });

  for (const size of [
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
  ]) {
    test(`stays a floating pane at ${size.width}px, with Pin and the Esc hint, and Go to field only on hover`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await page.goto(CHECKLIST);
      await edit(page, /^Note/, 'x');
      await save(page).click();
      const pane = page.getByRole('complementary', { name: /^Errors/ });
      await expect(pane).toBeVisible();
      await expect(pane).toHaveAttribute('data-layout', 'floating');
      await expect(pane.getByRole('button', { name: 'Pin' })).toBeVisible();
      await expect(pane.getByText('to hide')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Close sheet' })
      ).toHaveCount(0);
      const hint = pane.getByText('Go to field').first();
      await page.mouse.move(0, 0);
      await page
        .locator('body')
        .click({ position: { x: 5, y: size.height - 5 } });
      expect(await hint.evaluate((el) => getComputedStyle(el).opacity)).toBe(
        '0'
      );
    });
  }
});

test.describe('reduced motion', () => {
  test('fades the scrim, and fades the error sheet in place', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize(PHONE);
    await page.goto(CHECKLIST);
    await edit(page, /^Note/, 'x');
    await save(page).click();
    const sheet = page.getByRole('dialog', { name: /^Errors/ });
    const samples: string[] = [];
    for (let step = 0; step < 6; step += 1) {
      samples.push(
        await sheet.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return `${getComputedStyle(el).translate}|${Math.round(rect.y)}`;
        })
      );
      await page.waitForTimeout(20);
    }
    expect(new Set(samples.map((sample) => sample.split('|')[1])).size).toBe(1);
    for (const slot of ['foot-sheet', 'foot-sheet-scrim']) {
      const [property, duration] = await page
        .locator(`[data-slot=${slot}]:not([hidden])`)
        .first()
        .evaluate((el) => {
          const style = getComputedStyle(el);
          return [style.transitionProperty, style.transitionDuration];
        });
      expect(property).toBe('opacity');
      expect(duration).toBe('0.1s');
    }
  });
});

test.describe('popups on a phone', () => {
  const open = async (page: Page) => {
    await page.setViewportSize(PHONE);
    await page.goto(CHECKLIST);
  };

  test('a select list with a 100-character label stays inside the screen', async ({
    page,
  }) => {
    await open(page);
    await page.getByRole('combobox', { name: /^Choice/ }).click();
    const list = page.locator('[data-slot=select-content]');
    await expect(list).toBeVisible();
    const rect = await box(list);
    expect(rect.width).toBeLessThanOrEqual(366);
    expect(rect.x).toBeGreaterThanOrEqual(12 - 1);
    expect(rect.x + rect.width).toBeLessThanOrEqual(390 - 12 + 1);
    expect(await noSideways(page)).toBe(true);
  });

  test('a combobox list stays inside the screen and keeps listing as you type', async ({
    page,
  }) => {
    await open(page);
    await page.getByRole('combobox', { name: /^Related post/ }).click();
    const list = page.locator('[data-slot=combobox-content]');
    await expect(list).toBeVisible();
    const rect = await box(list);
    expect(rect.width).toBeLessThanOrEqual(366);
    expect(rect.x + rect.width).toBeLessThanOrEqual(390 - 12 + 1);
    expect(await noSideways(page)).toBe(true);
    await page.keyboard.type('hello');
    await expect(list.getByRole('option').first()).toBeVisible();
  });

  test('both lists stay in the visible area with the keyboard up', async ({
    page,
  }) => {
    await open(page);
    await fakeKeyboard(page, 336);
    await page.getByRole('combobox', { name: /^Choice/ }).click();
    const select = page.locator('[data-slot=select-content]');
    await expect(select).toBeVisible();
    let rect = await box(select);
    expect(rect.y + rect.height).toBeLessThanOrEqual(844 - 336 + 1);
    await page.keyboard.press('Escape');
    await page.getByRole('combobox', { name: /^Related post/ }).click();
    await page.keyboard.type('hello');
    const list = page.locator('[data-slot=combobox-content]');
    await expect(list.getByRole('option').first()).toBeVisible();
    rect = await box(list);
    expect(rect.y + rect.height).toBeLessThanOrEqual(844 - 336 + 1);
  });

  test('the block picker popover and an item menu stay inside the screen', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/#/collections/page/content%2Fpages%2Fhome.mdx');
    const add = page.getByRole('button', { name: /^Add/ }).first();
    await add.click();
    const popover = page.locator('[data-slot=popover-content]');
    await expect(popover).toBeVisible();
    const rect = await box(popover);
    expect(rect.width).toBeLessThanOrEqual(366);
    expect(rect.x).toBeGreaterThanOrEqual(11);
    expect(rect.x + rect.width).toBeLessThanOrEqual(390 - 11);
    expect(await noSideways(page)).toBe(true);
  });
});

test('the image gallery dialog opens as a foot sheet and closes with ×', async ({
  page,
}) => {
  await page.setViewportSize(PHONE);
  await page.goto(CHECKLIST);
  await page.getByRole('button', { name: 'Add images' }).click();
  const sheet = page.locator(SHEET);
  await expect(sheet).toBeVisible();
  await settle(page);
  const rect = await box(sheet);
  expect(Math.abs(rect.y + rect.height - PHONE.height)).toBeLessThanOrEqual(1);
  expect(rect.height).toBeGreaterThanOrEqual(PHONE.height / 2 - 1);
  await expect(
    sheet.getByRole('button', { name: 'Close sheet' })
  ).toBeVisible();
  await sheet.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator(SHEET)).toHaveCount(0);
});

test('a list card’s action menu at the right edge stays inside the screen', async ({
  page,
}) => {
  await page.setViewportSize(PHONE);
  await page.goto('/#/collections/page/content%2Fpages%2Fhome.mdx');
  await page.getByRole('button', { name: 'Add a block' }).last().click();
  await page
    .getByRole('dialog', { name: 'Choose a block' })
    .getByRole('button', { name: /Template number/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Up to Plain blocks' }).click();
  await page
    .getByRole('button', { name: /^Actions for/ })
    .first()
    .click();
  const menu = page.locator('[data-slot=dropdown-menu-content]');
  await expect(menu).toBeVisible();
  const rect = await box(menu);
  expect(rect.width).toBeLessThanOrEqual(366);
  expect(rect.x).toBeGreaterThanOrEqual(11);
  expect(rect.x + rect.width).toBeLessThanOrEqual(390 - 11);
  expect(await noSideways(page)).toBe(true);
});

test.describe('the branch switcher on a phone', () => {
  const openNewBranch = async (
    page: Page,
    size: { width: number; height: number }
  ) => {
    await page.setViewportSize(size);
    await page.goto('/branches.html?docs=1#/');
    await page
      .getByRole('button', { name: /feature\/news/ })
      .first()
      .click();
    await page.getByRole('button', { name: 'New branch' }).click();
    await settle(page);
  };

  for (const size of [PHONE, { width: 320, height: 568 }]) {
    test(`splits Back to branches and Create branch 50/50 at ${size.width}px`, async ({
      page,
    }) => {
      await openNewBranch(page, size);
      const back = await box(
        page.getByRole('button', { name: 'Back to branches' })
      );
      const create = await box(
        page.getByRole('button', { name: 'Create branch' })
      );
      expect(Math.abs(back.width - create.width)).toBeLessThanOrEqual(1);
    });
  }

  test('shows no Full screen button, but keeps it from 768px up', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/branches.html?docs=1#/');
    await page
      .getByRole('button', { name: /feature\/news/ })
      .first()
      .click();
    await expect(page.locator(SHEET)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Full screen' })).toHaveCount(
      0
    );
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(
      page.getByRole('button', { name: 'Full screen' })
    ).toBeVisible();
  });
});

// Button puts the label in its last span; a span added after it makes this locator measure the wrong element.
const labelFits = (button: Locator) =>
  button.evaluate((el) => {
    const label = el.querySelector('span:last-of-type');
    if (!label) return false;
    const css = getComputedStyle(label);
    const inner = label.getBoundingClientRect();
    const outer = el.getBoundingClientRect();
    return (
      label.scrollWidth <= label.clientWidth + 1 &&
      css.textOverflow !== 'ellipsis' &&
      inner.top >= outer.top - 1 &&
      inner.bottom <= outer.bottom + 1
    );
  });

for (const width of [375, 320]) {
  test(`the Save label wraps and the buttons match in height at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/sheets.html?case=branch&reason=deleted');
    const save = page.getByRole('button', { name: 'Save to new branch' });
    await expect(save).toBeVisible();
    await settle(page);
    expect(await labelFits(save)).toBe(true);
    const cancel = await box(page.getByRole('button', { name: 'Cancel' }));
    expect(
      Math.abs((await box(save)).height - cancel.height)
    ).toBeLessThanOrEqual(1);
  });
}

test('Back to branches wraps at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/branches.html?docs=1#/');
  await page
    .getByRole('button', { name: /feature\/news/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'New branch' }).click();
  await settle(page);
  expect(
    await labelFits(page.getByRole('button', { name: 'Back to branches' }))
  ).toBe(true);
});

test('a nested confirm gets its own scrim and covers its parent sheet', async ({
  page,
}) => {
  await page.setViewportSize(PHONE);
  await page.goto('/sheets.html?case=nested');
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await settle(page);
  await expect(
    page.locator('[data-slot=foot-sheet-scrim]:visible')
  ).toHaveCount(2);
  const parent = await box(page.getByText('Parent action'));
  const covered = await page.evaluate(
    ({ x, y }) =>
      document.elementFromPoint(x, y)?.closest('[role=alertdialog]') !== null,
    { x: parent.x + parent.width / 2, y: parent.y + parent.height / 2 }
  );
  expect(covered).toBe(true);
  const strip = await page.evaluate(
    () => document.elementFromPoint(195, 10)?.getAttribute('data-slot') ?? ''
  );
  expect(strip).toBe('foot-sheet-scrim');
});

test('a long select option ends in an ellipsis', async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto(CHECKLIST);
  await page.getByRole('combobox', { name: /^Choice/ }).click();
  const option = page.getByRole('option', { name: /A very long option/ });
  await expect(option).toBeVisible();
  const text = page
    .locator('[data-slot=select-content]')
    .getByText(/A very long option/)
    .first();
  const style = await text.evaluate((el) => {
    const css = getComputedStyle(el);
    return [css.textOverflow, el.scrollWidth > el.clientWidth];
  });
  expect(style).toEqual(['ellipsis', true]);
});

test.describe('touch taps on an error row', () => {
  test.use({ hasTouch: true });

  for (const gap of [0, 60, 120]) {
    test(`two taps ${gap}ms apart end with focus in the field`, async ({
      page,
    }) => {
      await page.setViewportSize(PHONE);
      await page.goto(CHECKLIST);
      await edit(page, /^Note/, 'x');
      await save(page).click();
      const row = page
        .getByRole('dialog', { name: /^Errors/ })
        .locator('[data-error-row]')
        .first();
      await expect(row).toBeVisible();
      await settle(page);
      const { x, y, width, height } = await box(row);
      await page.touchscreen.tap(x + width / 2, y + height / 2);
      await page.waitForTimeout(gap);
      await page.touchscreen.tap(x + width / 2, y + height / 2);
      await settle(page);
      await expect(page.getByRole('textbox', { name: /^First/ })).toBeFocused();
    });
  }
});
