import { expect, test } from '@playwright/test';

test('TinaCloud metadata survives a save and reorders Home without a reload', async ({
  page,
}) => {
  const metadata = [
    {
      path: 'content/posts/older.mdx',
      title: 'Older document',
      updatedAt: '2020-01-01T00:00:00.000Z',
      lastAuthor: { name: 'Ada' },
    },
    {
      path: 'content/posts/newer.mdx',
      title: 'Newer document',
      updatedAt: '2021-01-01T00:00:00.000Z',
      lastAuthor: { name: 'Grace' },
    },
  ];
  let updates = 0;
  let documentNavigations = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      documentNavigations++;
    }
  });
  await page.route(
    'https://identity.tinajs.io/v2/apps/history-fixture',
    (route) => route.fulfill({ json: { defaultBranch: 'feature/news' } })
  );
  await page.route('https://content.tinajs.io/**', async (route) => {
    const request = route.request();
    expect(request.headers()['x-tina-content-contract']).toBe('4');
    const { query, variables } = request.postDataJSON();
    let data: unknown;
    if (query.includes('updateDocument')) {
      updates++;
      const system = metadata.find(({ path }) => path === variables.path);
      if (!system) throw new Error('Unexpected document save');
      Object.assign(system, {
        title: variables.params.title,
        updatedAt: new Date().toISOString(),
        lastAuthor: { name: 'Editor' },
      });
      data = { updateDocument: { _sys: system, _values: variables.params } };
    } else if (query.includes('documents(')) {
      data = {
        collection: {
          documents: {
            edges:
              variables.collection === 'post'
                ? metadata.map((_sys) => ({ node: { _sys } }))
                : [],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
              historyRevision: 'a'.repeat(40),
            },
          },
        },
      };
    } else {
      const system = metadata.find(({ path }) => path === variables.path);
      data = {
        document: system
          ? { _sys: system, _values: { title: system.title } }
          : null,
      };
    }
    await route.fulfill({ json: { data } });
  });
  await page.goto('/branches.html?cloud=1&account=1#/');
  const recent = page.getByRole('region', { name: 'Recent documents' });
  await expect(recent.getByRole('button').first()).toContainText(
    'Newer document'
  );
  await recent.getByRole('button', { name: /Older document/ }).click();
  await page.getByRole('textbox', { name: /^Title/ }).fill('Saved document');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  await expect(recent.getByRole('button').first()).toContainText(
    'Saved document'
  );
  await expect(recent.getByRole('button').first()).toContainText('Editor');
  await expect(recent.getByRole('button').first()).toContainText('just now');
  expect(updates).toBe(1);
  expect(documentNavigations).toBe(1);
});
