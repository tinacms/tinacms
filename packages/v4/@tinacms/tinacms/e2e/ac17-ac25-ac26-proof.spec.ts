import { type Page, expect, test } from '@playwright/test';

const HELLO = 'content/posts/hello-world.mdx';
const P390 = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

const declaredUrl = () =>
  `/?preview=${encodeURIComponent(`/declared.html?post=${HELLO}`)}#/collections/post/${encodeURIComponent(HELLO)}`;
const branchUrl = (query = '') =>
  `/branches.html?docs=2&${query}#/collections/post/content%2Fposts%2Fpost-01.mdx`;

const frame = (page: Page) => page.frameLocator('iframe[title="Preview"]');
const viewSwitch = (page: Page) =>
  page.getByRole('group', { name: 'View', exact: true });
const title = (page: Page) => page.getByRole('textbox', { name: /^Title/ });
const heading = (page: Page) => form(page).locator('h2');
const location = (page: Page) =>
  page.getByRole('navigation', { name: 'Location' });
const form = (page: Page) =>
  page.getByRole('complementary', { name: 'Document form' });
const switcherOf = (page: Page) =>
  page.getByRole('dialog', { name: 'Branches' });
const searchOf = (page: Page) => page.getByRole('dialog', { name: 'Search' });

const openDeclared = async (page: Page) => {
  await page.setViewportSize(P390);
  await page.goto(declaredUrl());
  await expect(frame(page).getByTestId('post-title')).toBeAttached({
    timeout: 30_000,
  });
};

/** Counts load events on the preview iframe from now on. */
const countLoads = async (page: Page) => {
  await page.evaluate(() => {
    const target = window as unknown as { __loads: number };
    target.__loads = 0;
    document
      .querySelector('iframe[title="Preview"]')
      ?.addEventListener('load', () => {
        target.__loads += 1;
      });
  });
  return () =>
    page.evaluate(() => (window as unknown as { __loads: number }).__loads);
};

const expectFormView = async (page: Page) => {
  await expect(
    viewSwitch(page).getByRole('button', { name: 'Form' })
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('iframe[title="Preview"]')).toBeHidden();
  const head = page.locator('[data-form-part=head]');
  await expect(head).toBeVisible();
  const box = await head.boundingBox();
  expect(box?.x).toBe(0);
  expect(box?.width).toBe(P390.width);
};

type SearchMode = 'document' | 'failed' | 'none';
type Stubbed = Window & { __searchMode?: SearchMode };

/**
 * The branches playground reads its fixtures in the page, so the stubs rewrite
 * its module as it is served: `sessionStorage.failBranches` fails the branch list
 * and `window.__searchMode` picks what a mounted search provider answers.
 */
const stubBranchesPlayground = async (page: Page) => {
  await page.route(/\/src\/branches\.tsx(\?.*)?$/, async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    const withFailure = source.replace(
      'if (failing === "branches")',
      'if (failing === "branches" || sessionStorage.getItem("failBranches"))'
    );
    const withSearch = withFailure
      .replace(
        'const config = defineConfig({',
        `const searchStub = definePlugin({
  name: 'e2e:search-stub',
  provides: ['search'],
  client: async () => ({
    default: {
      slice: () => ({
        search: async () => {
          if (window.__searchMode === 'failed') throw new SearchError('unavailable');
          if (window.__searchMode === 'none') return [];
          return [{ ref: { collection: 'post', path: 'content/posts/post-02.mdx' }, score: 1, snippet: 'a snippet' }];
        },
      }),
    },
  }),
});
const config = defineConfig({`
      )
      .replace('plugins: [content,', 'plugins: [content, searchStub,')
      .replace('ContentError,', 'ContentError, SearchError,');
    await route.fulfill({ response, body: withSearch });
  });
};

test.describe('AC17: reference steps and Search on a phone', () => {
  test('the Open icon on the Author field shows the author on Form, and browser Back returns to the edited post on Form with no reload', async ({
    page,
  }) => {
    await openDeclared(page);
    const loads = await countLoads(page);
    await title(page).fill('Edited before the step');
    await page
      .getByRole('button', { name: 'Open content/authors/jane-doe.md' })
      .click();
    await expect(page.getByRole('textbox', { name: /^name\b/i })).toBeVisible();
    await expect(heading(page)).not.toHaveText(/^Edited before the step/);
    await expectFormView(page);
    await expect(page).toHaveURL(/collections\/author/);
    await page.goBack();
    await expect(heading(page)).toHaveText(/^Edited before the step/);
    await expectFormView(page);
    await expect(title(page)).toHaveValue('Edited before the step');
    expect(await loads()).toBe(0);
  });

  test('a reference step entered from Preview view shows its form on Form, and Back lands on the earlier document on Form', async ({
    page,
  }) => {
    await openDeclared(page);
    const loads = await countLoads(page);
    await title(page).fill('Edited in Preview run');
    await viewSwitch(page).getByRole('button', { name: 'Preview' }).click();
    await expect(
      viewSwitch(page).getByRole('button', { name: 'Preview' })
    ).toHaveAttribute('aria-pressed', 'true');
    await frame(page).getByTestId('author-name').click();
    await expectFormView(page);
    await expect(page.getByRole('textbox', { name: /^name\b/i })).toBeVisible();
    await location(page)
      .getByRole('button', { name: /^Edited in Preview run/ })
      .click();
    await expectFormView(page);
    await expect(title(page)).toHaveValue('Edited in Preview run');
    expect(await loads()).toBe(0);
  });

  test('picking a Search result opens that document on Form, closes Search and never reloads the preview', async ({
    page,
  }) => {
    await stubBranchesPlayground(page);
    await page.setViewportSize(P390);
    await page.goto(branchUrl());
    await expectFormView(page).catch(() => undefined);
    await page.evaluate(() => {
      (window as Stubbed).__searchMode = 'document';
    });
    await viewSwitch(page).getByRole('button', { name: 'Preview' }).click();
    const loads = await countLoads(page);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const search = searchOf(page);
    await search.getByRole('searchbox', { name: 'Search' }).fill('post');
    await search
      .getByRole('list', { name: 'Search results' })
      .getByText('content/posts/post-02.mdx')
      .click();
    await expect(search).toBeHidden();
    await expect(page).toHaveURL(/post-02\.mdx/);
    await expectFormView(page);
    expect(await loads()).toBe(0);
  });
});

test.describe('AC25: the branch switcher on a phone', () => {
  // The list is read when the admin mounts and again on Retry, so a later
  // failure is a reload that finds the list down while a chosen branch is saved.
  test('a branch list that fails shows the failure with Retry, the top bar keeps the chosen branch, and Retry recovers', async ({
    page,
  }) => {
    await stubBranchesPlayground(page);
    await page.setViewportSize(P390);
    await page.goto(branchUrl());
    const topBranch = page.getByRole('button', {
      name: /^Branch:/,
      includeHidden: true,
    });
    await expect(topBranch).toContainText('feature/news');
    await topBranch.click();
    await switcherOf(page).getByRole('button', { name: 'main' }).click();
    await expect(topBranch).toContainText('main');
    await page.evaluate(() => sessionStorage.setItem('failBranches', '1'));
    await page.reload();
    await expect(topBranch).toContainText('main');
    await topBranch.click();
    const switcher = switcherOf(page);
    await expect(switcher.getByRole('alert')).toContainText(
      "Couldn't load branches"
    );
    await expect(switcher.getByRole('alert')).toContainText(
      "You're still on main"
    );
    await expect(topBranch).toContainText('main');
    await expect(topBranch).not.toContainText('feature/news');
    await page.evaluate(() => sessionStorage.removeItem('failBranches'));
    await switcher.getByRole('button', { name: 'Retry' }).click();
    await expect(switcher.getByRole('alert')).toHaveCount(0);
    await expect(switcher.getByRole('button', { name: 'main' })).toBeVisible();
    await expect(
      switcher.getByRole('button', { name: 'feature/news' })
    ).toBeVisible();
    await expect(topBranch).toContainText('main');
  });

  test('with unsaved edits, picking a branch says to save or discard first', async ({
    page,
  }) => {
    await page.setViewportSize(P390);
    await page.goto(branchUrl());
    await title(page).click();
    await title(page).pressSequentially('!');
    await page
      .getByRole('button', { name: /^Branch:/, includeHidden: true })
      .click();
    const switcher = switcherOf(page);
    await expect(
      switcher.getByText('Save or discard your changes first')
    ).toBeVisible();
    await switcher.getByRole('button', { name: 'main' }).click({ force: true });
    await expect(switcher).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Branch:/, includeHidden: true })
    ).toContainText('feature/news');
  });
});

test.describe('AC26: Search results on a phone', () => {
  const searchFor = async (page: Page, mode: SearchMode) => {
    await stubBranchesPlayground(page);
    await page.setViewportSize(P390);
    await page.goto(branchUrl());
    await page.evaluate((value) => {
      (window as Stubbed).__searchMode = value;
    }, mode);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const search = searchOf(page);
    await search.getByRole('searchbox', { name: 'Search' }).fill('zzzz');
    return search;
  };

  test('a document result opens that document on Form and closes Search', async ({
    page,
  }) => {
    const search = await searchFor(page, 'document');
    await search.getByText('content/posts/post-02.mdx').click();
    await expect(search).toBeHidden();
    await expect(page).toHaveURL(/post-02\.mdx/);
    await expectFormView(page);
  });

  test('a failed search shows the provider message in an alert, as at desktop', async ({
    page,
  }) => {
    const search = await searchFor(page, 'failed');
    const message = "Can't reach search right now. Try again in a moment.";
    await expect(search.getByRole('alert')).toHaveText(message);
    await page.setViewportSize(DESKTOP);
    await page.keyboard.press('Escape');
    await expect(searchOf(page)).toBeHidden();
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await searchOf(page)
      .getByRole('searchbox', { name: 'Search' })
      .fill('zzzz');
    await expect(searchOf(page).getByRole('alert')).toHaveText(message);
  });

  test('no results shows an empty list and no alert, as at desktop', async ({
    page,
  }) => {
    const search = await searchFor(page, 'none');
    await expect(
      search.getByRole('heading', { name: 'Content search' })
    ).toBeVisible();
    await expect(
      search.getByRole('list', { name: 'Search results' })
    ).toBeAttached();
    await expect(
      search.getByRole('list', { name: 'Search results' }).getByRole('listitem')
    ).toHaveCount(0);
    await expect(search.getByRole('alert')).toHaveCount(0);
  });
});
