import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentError, nodesOf } from '../../../core/content/contract';
import type { TinaStoreState } from '../../../core/plugin';
import { TINACLOUD_IDENTITY_URL } from '../client';
import { contentUrl } from './request';
import { createTinaCloudContentSlice } from './tinacloud-content.client';

const state: TinaStoreState = {};

const content = () => {
  delete state.branch;
  return createTinaCloudContentSlice({
    clientId: 'abc',
    getToken: async () => 'secret',
  })(
    () => {},
    () => state
  );
};

const POSTS_FOLDER = 'content/posts/';

type Row =
  | string
  | { path: string; title?: string; root?: string; relativePath?: string };

const nodeOf = (row: Row) => {
  const {
    path,
    title,
    root = POSTS_FOLDER,
    relativePath = path.slice(root.length),
  } = typeof row === 'string' ? { path: row } : row;
  return {
    _sys: { path, relativePath },
    _values: title === undefined ? {} : { title },
  };
};

const page = (rows: Row[], endCursor: string | null) => ({
  data: {
    collection: {
      documents: {
        edges: rows.map((row) => ({ node: nodeOf(row) })),
        pageInfo: { hasNextPage: endCursor !== null, endCursor },
      },
    },
  },
});

const hello = {
  _sys: { path: 'content/posts/hello.mdx' },
  _values: { title: 'Hello' },
};

const stubTinaCloud = (...contentResponses: unknown[]) => {
  const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
    if (url.startsWith(TINACLOUD_IDENTITY_URL)) {
      return Response.json({ defaultBranch: 'main' });
    }
    const next = contentResponses.shift();
    return next instanceof Response ? next : Response.json(next);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const contentCalls = (fetchMock: ReturnType<typeof stubTinaCloud>) =>
  fetchMock.mock.calls
    .filter(([url]) => !url.startsWith(TINACLOUD_IDENTITY_URL))
    .map(([url, init]) => ({
      url,
      variables: JSON.parse(String(init?.body)).variables,
    }));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TinaCloud content slice', () => {
  it("gets a document from the project's default branch", async () => {
    const fetchMock = stubTinaCloud({ data: { document: hello } });
    expect(await content().get('post', 'content/posts/hello.mdx')).toEqual({
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    });
    expect(contentCalls(fetchMock)).toEqual([
      {
        url: contentUrl('abc', 'main'),
        variables: { collection: 'post', path: 'content/posts/hello.mdx' },
      },
    ]);
    expect(
      new Headers(fetchMock.mock.calls.at(-1)?.[1]?.headers).get(
        'Authorization'
      )
    ).toBe('Bearer secret');
  });

  it('returns null for a document TinaCloud reports missing', async () => {
    stubTinaCloud(
      { data: { document: null } },
      { errors: [{ message: 'Gone.', extensions: { code: 'NOT_FOUND' } }] }
    );
    const slice = content();
    expect(await slice.get('post', 'a.mdx')).toBeNull();
    expect(await slice.get('post', 'b.mdx')).toBeNull();
  });

  it('throws on an HTTP 404 instead of reporting the document missing', async () => {
    stubTinaCloud(new Response('Not Found', { status: 404 }));
    const failure = await content()
      .get('post', 'a.mdx')
      .catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(ContentError);
    expect(failure).toMatchObject({ code: 'not-found' });
  });

  it('stops when TinaCloud repeats the cursor', async () => {
    const fetchMock = stubTinaCloud(
      page(['a.mdx'], 'c1'),
      page(['b.mdx'], 'c1')
    );
    expect(nodesOf(await content().list('post'))).toEqual([
      { path: 'a.mdx' },
      { path: 'b.mdx' },
    ]);
    expect(contentCalls(fetchMock)).toHaveLength(2);
  });

  it('follows the cursor through every page of a collection', async () => {
    const fetchMock = stubTinaCloud(
      page(['a.mdx', 'b.mdx'], 'c1'),
      page(['c.mdx'], 'c2'),
      page(['d.mdx'], null)
    );
    expect(nodesOf(await content().list('post'))).toEqual([
      { path: 'a.mdx' },
      { path: 'b.mdx' },
      { path: 'c.mdx' },
      { path: 'd.mdx' },
    ]);
    expect(
      contentCalls(fetchMock).map(({ variables }) => variables.after)
    ).toEqual([null, 'c1', 'c2']);
  });

  it('lists an empty collection', async () => {
    stubTinaCloud(page([], null));
    expect(await content().list('post')).toMatchObject({
      edges: [],
      totalCount: 0,
      folders: [],
    });
  });

  it('answers a list query over the full path list, without placeholders', async () => {
    stubTinaCloud(
      page(
        [
          'content/posts/zebra.mdx',
          'content/posts/apple.mdx',
          'content/posts/.gitkeep.mdx',
          'content/posts/2024/jan.mdx',
          'content/posts/2024/.gitkeep.mdx',
          'content/posts/empty/.gitkeep.mdx',
        ],
        null
      )
    );
    const connection = await content().list('post', {
      folder: '',
      sort: { by: 'title', direction: 'asc' },
    });
    expect(nodesOf(connection).map(({ path }) => path)).toEqual([
      'content/posts/apple.mdx',
      'content/posts/zebra.mdx',
    ]);
    expect(connection.totalCount).toBe(2);
    expect(connection.folders).toEqual([
      { path: '2024', name: '2024', documentCount: 1 },
    ]);
  });

  it('lists a folder scope filtered, sorted and paged, never a placeholder', async () => {
    const paths = [
      'content/posts/2024/.gitkeep.mdx',
      'content/posts/2024/delta.mdx',
      'content/posts/2024/alpha.mdx',
      'content/posts/2024/charlie.mdx',
      'content/posts/2024/bravo.mdx',
      'content/posts/2024/skip.mdx',
      'content/posts/root.mdx',
    ];
    const query = {
      folder: '2024',
      filter: 'a',
      sort: { by: 'title', direction: 'asc' },
      first: 2,
    } as const;
    stubTinaCloud(page(paths, null), page(paths, null));
    const slice = content();
    const first = await slice.list('post', query);
    expect(nodesOf(first).map(({ path }) => path)).toEqual([
      'content/posts/2024/alpha.mdx',
      'content/posts/2024/bravo.mdx',
    ]);
    expect(first.totalCount).toBe(4);
    expect(first.pageInfo.hasNextPage).toBe(true);
    expect(first.folders).toEqual([]);
    expect(JSON.stringify(first)).not.toContain('.gitkeep');

    const second = await slice.list('post', {
      ...query,
      after: first.pageInfo.endCursor ?? undefined,
    });
    expect(nodesOf(second).map(({ path }) => path)).toEqual([
      'content/posts/2024/charlie.mdx',
      'content/posts/2024/delta.mdx',
    ]);
    expect(second.pageInfo.hasNextPage).toBe(false);
  });

  it("roots folders at the collection's path when every document sits in a subfolder", async () => {
    stubTinaCloud(
      page(['content/posts/guides/a.md'], null),
      page(['content/posts/guides/a.md'], null)
    );
    const slice = content();
    const top = await slice.list('post', { folder: '' });
    expect(top.folders).toEqual([
      { path: 'guides', name: 'guides', documentCount: 1 },
    ]);
    expect(nodesOf(top)).toEqual([]);
    const guides = await slice.list('post', { folder: 'guides' });
    expect(nodesOf(guides).map(({ path }) => path)).toEqual([
      'content/posts/guides/a.md',
    ]);
  });

  it('roots folders at the repository top for a collection with an empty path', async () => {
    stubTinaCloud(page([{ path: 'docs/a.md', root: '' }], null));
    const connection = await content().list('post', { folder: '' });
    expect(connection.folders).toEqual([
      { path: 'docs', name: 'docs', documentCount: 1 },
    ]);
  });

  it('falls back to the unrooted listing when relativePath is not a trailing segment of path', async () => {
    stubTinaCloud(
      page([{ path: 'content/posts/a.md', relativePath: '/a.md' }], null)
    );
    const connection = await content().list('post', { folder: '' });
    expect(connection.folders).toEqual([
      { path: 'content', name: 'content', documentCount: 1 },
    ]);
  });

  it('carries each title, and filters and sorts by it', async () => {
    stubTinaCloud(
      page(
        [
          { path: 'content/posts/a.mdx', title: 'Zebra crossing' },
          { path: 'content/posts/b.mdx', title: 'Apple pie' },
          { path: 'content/posts/c.mdx', title: 'Banana bread' },
          'content/posts/d.mdx',
        ],
        null
      ),
      page(
        [
          { path: 'content/posts/a.mdx', title: 'Zebra crossing' },
          { path: 'content/posts/b.mdx', title: 'Apple pie' },
          { path: 'content/posts/c.mdx', title: 'Banana bread' },
        ],
        null
      )
    );
    const slice = content();
    const sorted = await slice.list('post', {
      folder: '',
      sort: { by: 'title', direction: 'asc' },
    });
    expect(nodesOf(sorted).map(({ path, title }) => [path, title])).toEqual([
      ['content/posts/b.mdx', 'Apple pie'],
      ['content/posts/c.mdx', 'Banana bread'],
      ['content/posts/d.mdx', undefined],
      ['content/posts/a.mdx', 'Zebra crossing'],
    ]);
    const filtered = await slice.list('post', { folder: '', filter: 'pie' });
    expect(nodesOf(filtered).map(({ path }) => path)).toEqual([
      'content/posts/b.mdx',
    ]);
  });

  it('offers no structural operations, because TinaCloud has no such API', () => {
    const slice = content();
    for (const op of [
      'create',
      'rename',
      'delete',
      'referrers',
      'createFolder',
      'renameFolder',
      'deleteFolder',
    ]) {
      expect(slice).not.toHaveProperty(op);
    }
  });

  it('refuses a page size above 200 as a ContentError', async () => {
    stubTinaCloud(page(['a.mdx'], null));
    await expect(content().list('post', { first: 500 })).rejects.toMatchObject({
      code: 'validation',
    });
  });

  it('updates a document and returns the saved values', async () => {
    const fetchMock = stubTinaCloud({ data: { updateDocument: hello } });
    expect(
      await content().update('post', 'content/posts/hello.mdx', {
        title: 'Hello',
      })
    ).toEqual({
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    });
    expect(contentCalls(fetchMock)[0].variables).toEqual({
      collection: 'post',
      path: 'content/posts/hello.mdx',
      params: { title: 'Hello' },
    });
  });

  it('reads the branch from store.branch.current at call time', async () => {
    const fetchMock = stubTinaCloud(
      page([], null),
      { data: { document: hello } },
      { data: { updateDocument: hello } }
    );
    const slice = content();
    await slice.list('post');
    state.branch = { current: 'feat/x' };
    await slice.get('post', 'content/posts/hello.mdx');
    await slice.update('post', 'content/posts/hello.mdx', {});
    expect(contentCalls(fetchMock).map(({ url }) => url)).toEqual([
      contentUrl('abc', 'main'),
      contentUrl('abc', 'feat/x'),
      contentUrl('abc', 'feat/x'),
    ]);
  });

  it('lists each branch with its pull request URL', async () => {
    stubTinaCloud([
      {
        name: 'feat/x',
        githubPullRequestUrl: 'https://github.com/acme/site/pull/12',
      },
      { name: 'main', protected: true, githubPullRequestUrl: '' },
    ]);
    expect(await content().branches?.list()).toEqual([
      {
        name: 'feat/x',
        protected: undefined,
        pullRequestUrl: 'https://github.com/acme/site/pull/12',
      },
      { name: 'main', protected: true, pullRequestUrl: undefined },
    ]);
  });

  it('reports a failed save as a ContentError', async () => {
    stubTinaCloud({
      errors: [
        { message: 'No branch.', extensions: { code: 'BRANCH_NOT_FOUND' } },
      ],
    });
    const failure = await content()
      .update('post', 'a.mdx', {})
      .catch((cause: unknown) => cause);
    expect(failure).toBeInstanceOf(ContentError);
    expect(failure).toMatchObject({ code: 'branch-not-found' });
  });
});
