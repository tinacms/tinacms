import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  TINACLOUD_CONTENT_URL,
  TinaCloudError,
  createTinaCloudClient,
} from '../client';
import {
  LIST_PAGE_SIZE,
  TINACLOUD_CONTENT_API_VERSION,
  TinaCloudGraphQLError,
  contentUrl,
  fetchDocument,
  fetchDocumentPage,
  updateDocument,
} from './request';

const client = createTinaCloudClient({
  clientId: 'abc',
  getToken: async () => 'secret',
});

const stubFetch = (...responses: Response[]) => {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
    const next = responses.shift();
    if (!next) throw new Error('unexpected fetch');
    return next;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const sentBody = (fetchMock: ReturnType<typeof stubFetch>) =>
  JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

const hello = {
  _sys: { path: 'content/posts/hello.mdx' },
  _values: { title: 'Hello' },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('contentUrl', () => {
  it('builds the branch endpoint with the version segment', () => {
    expect(contentUrl('abc', 'feat/x')).toBe(
      `${TINACLOUD_CONTENT_URL}/${TINACLOUD_CONTENT_API_VERSION}/content/abc/github/feat%2Fx`
    );
  });
});

describe('fetchDocument', () => {
  it('posts the query with a bearer token and returns the document', async () => {
    const fetchMock = stubFetch(Response.json({ data: { document: hello } }));
    expect(
      await fetchDocument(client, 'main', 'post', 'content/posts/hello.mdx')
    ).toEqual(hello);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(contentUrl('abc', 'main'));
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Authorization')).toBe(
      'Bearer secret'
    );
    expect(sentBody(fetchMock).variables).toEqual({
      collection: 'post',
      path: 'content/posts/hello.mdx',
    });
  });

  it('returns null for a missing document', async () => {
    stubFetch(Response.json({ data: { document: null } }));
    expect(await fetchDocument(client, 'main', 'post', 'x.mdx')).toBeNull();
  });

  it('throws the GraphQL errors of the response', async () => {
    const errors = [
      { message: 'Title is required.', extensions: { code: 'VALIDATION' } },
    ];
    stubFetch(Response.json({ data: null, errors }));
    const failure = await fetchDocument(client, 'main', 'post', 'x.mdx').catch(
      (cause: unknown) => cause
    );
    expect(failure).toBeInstanceOf(TinaCloudGraphQLError);
    expect(failure).toMatchObject({ errors, message: 'Title is required.' });
  });

  it('rejects a response in an unknown format', async () => {
    stubFetch(Response.json({ data: { document: { _values: {} } } }));
    const failure = await fetchDocument(client, 'main', 'post', 'x.mdx').catch(
      (cause: unknown) => cause
    );
    expect(failure).toBeInstanceOf(TinaCloudError);
    expect(failure).not.toBeInstanceOf(TinaCloudGraphQLError);
    expect(failure).toMatchObject({
      message: expect.stringContaining('unknown format'),
    });
  });
});

describe('fetchDocumentPage', () => {
  it('asks for one page after the cursor', async () => {
    const documents = {
      edges: [{ node: { _sys: { path: 'content/posts/a.mdx' } } }],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
    const fetchMock = stubFetch(
      Response.json({ data: { collection: { documents } } })
    );
    expect(await fetchDocumentPage(client, 'main', 'post', 'c1')).toEqual(
      documents
    );
    expect(sentBody(fetchMock).variables).toEqual({
      collection: 'post',
      first: LIST_PAGE_SIZE,
      after: 'c1',
    });
  });
});

describe('updateDocument', () => {
  it('sends the values as params and returns the saved document', async () => {
    const fetchMock = stubFetch(
      Response.json({ data: { updateDocument: hello } })
    );
    expect(
      await updateDocument(client, 'main', 'post', 'content/posts/hello.mdx', {
        title: 'Hello',
      })
    ).toEqual(hello);
    expect(sentBody(fetchMock)).toMatchObject({
      query: expect.stringContaining('updateDocument'),
      variables: {
        collection: 'post',
        path: 'content/posts/hello.mdx',
        params: { title: 'Hello' },
      },
    });
  });
});
