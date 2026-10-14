import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentError } from '../../../core/content/contract';
import type { TinaStoreState } from '../../../core/plugin';
import { TINACLOUD_IDENTITY_URL } from '../client';
import { contentUrl } from './request';
import { createTinaCloudContentSlice } from './tinacloud-content.client';

const state: TinaStoreState = {};

const content = () => {
  state.auth = {
    status: 'signed-out',
    user: null,
    getToken: async () => 'secret',
    login: async () => {},
    logout: async () => {},
  };
  delete state.branch;
  return createTinaCloudContentSlice({ clientId: 'abc' })(
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

  it('reads the branch from store.branch.name at call time', async () => {
    const fetchMock = stubTinaCloud(
      page([], null),
      { data: { document: hello } },
      { data: { updateDocument: hello } }
    );
    const slice = content();
    await slice.list('post');
    state.branch = { name: 'feat/x' };
    await slice.get('post', 'content/posts/hello.mdx');
    await slice.update('post', 'content/posts/hello.mdx', {});
    expect(contentCalls(fetchMock).map(({ url }) => url)).toEqual([
      contentUrl('abc', 'main'),
      contentUrl('abc', 'feat/x'),
      contentUrl('abc', 'feat/x'),
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
