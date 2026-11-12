import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentError } from '../../../core/content/contract';
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

const page = (paths: string[], endCursor: string | null) => ({
  data: {
    collection: {
      documents: {
        edges: paths.map((path) => ({ node: { _sys: { path } } })),
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
  it('maps edit metadata on list, get and update and requests the v4 contract', async () => {
    const metadata = {
      updatedAt: '2026-11-12T10:00:00+10:00',
      lastAuthor: { name: 'Ada' },
    };
    const document = { ...hello, _sys: { ...hello._sys, ...metadata } };
    const listPage = page(['content/posts/hello.mdx'], null);
    listPage.data.collection.documents.edges[0].node = document;
    const fetchMock = stubTinaCloud(
      listPage,
      { data: { document } },
      { data: { updateDocument: document } }
    );
    const slice = content();
    const expected = {
      path: hello._sys.path,
      updatedAt: '2026-11-12T00:00:00.000Z',
      lastAuthor: { name: 'Ada' },
    };
    expect(await slice.list('post')).toEqual([expected]);
    expect(await slice.get('post', hello._sys.path)).toEqual({
      ...expected,
      document: hello._values,
    });
    expect(await slice.update('post', hello._sys.path, hello._values)).toEqual({
      ...expected,
      document: hello._values,
    });
    const [, init] = fetchMock.mock.calls.at(-1) ?? [];
    expect(new Headers(init?.headers).get('x-tina-content-contract')).toBe('4');
  });

  it('pins one history revision while following collection pages', async () => {
    const revision = 'a'.repeat(40);
    const first = {
      data: {
        collection: {
          documents: {
            edges: [{ node: { _sys: { path: 'a.mdx' } } }],
            pageInfo: {
              hasNextPage: true,
              endCursor: 'c1',
              historyRevision: revision,
            },
          },
        },
      },
    };
    const fetchMock = stubTinaCloud(first, page(['b.mdx'], null));
    expect(await content().list('post')).toEqual([
      { path: 'a.mdx' },
      { path: 'b.mdx' },
    ]);
    expect(
      contentCalls(fetchMock).map(({ variables }) => variables.historyRevision)
    ).toEqual([null, revision]);
  });

  it('lists valid documents when edit metadata is missing, null or malformed', async () => {
    stubTinaCloud({
      data: {
        collection: {
          documents: {
            edges: [
              {
                node: {
                  _sys: { path: 'a.mdx', updatedAt: null, lastAuthor: null },
                },
              },
              {
                node: {
                  _sys: {
                    path: 'b.mdx',
                    updatedAt: 'not a date',
                    lastAuthor: { name: '' },
                  },
                },
              },
              { node: { _sys: { path: 'c.mdx' } } },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      },
    });
    expect(await content().list('post')).toEqual([
      { path: 'a.mdx' },
      { path: 'b.mdx' },
      { path: 'c.mdx' },
    ]);
  });

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
    expect(await content().list('post')).toEqual([
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
    expect(await content().list('post')).toEqual([
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
    expect(await content().list('post')).toEqual([]);
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
