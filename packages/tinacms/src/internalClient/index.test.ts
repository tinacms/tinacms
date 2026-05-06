import { Client, LocalClient, LocalAuthProvider } from './index';
import {
  EDITORIAL_WORKFLOW_ERROR,
  EDITORIAL_WORKFLOW_STATUS,
  EditorialWorkflowErrorDetails,
} from '../toolkit/form-builder/editorial-workflow-constants';

const makeResponse = ({
  status,
  body,
  statusText = '',
}: {
  status: number;
  body: Record<string, unknown>;
  statusText?: string;
}) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: vi.fn().mockResolvedValue(body),
  }) as any;

const buildClient = (
  overrides: Partial<ConstructorParameters<typeof Client>[0]> = {}
) =>
  new Client({
    clientId: 'test-id',
    branch: 'main',
    tokenStorage: 'MEMORY',
    tinaGraphQLVersion: '1.1',
    ...overrides,
  });

const stubFetchOnce = (response: unknown) => {
  const fetchMock = vi.fn().mockResolvedValueOnce(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('Tina Client', () => {
  describe('With localhost contentAPI URL', () => {
    let client: Client;

    beforeEach(() => {
      client = new LocalClient();
    });
    it('sets isLocalMode', () => {
      expect(client.isLocalMode).toEqual(true);
    });
  });

  describe('With prod contentAPI URL', () => {
    let client: Client;

    beforeEach(() => {
      client = buildClient({
        clientId: '',
        tokenStorage: 'LOCAL_STORAGE',
        customContentApiUrl: 'http://tina.io/fakeURL',
      });
    });
    it('sets isLocalMode to false', () => {
      expect(client.isLocalMode).toEqual(false);
    });
  });

  describe('LocalClient — default wiring', () => {
    let client: LocalClient;

    beforeEach(() => {
      client = new LocalClient();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('defaults to the local dev server URL when no customContentApiUrl is provided', () => {
      expect(client.contentApiUrl).toBe('http://localhost:4001/graphql');
    });

    it('uses a LocalAuthProvider by default', () => {
      expect(client.authProvider).toBeInstanceOf(LocalAuthProvider);
    });

    it('sends no Authorization header because LocalAuthProvider returns an empty id_token', async () => {
      const fetchMock = stubFetchOnce(
        makeResponse({ status: 200, body: { data: {} } })
      );

      await client.request('{ x }', { variables: {} });

      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers).not.toHaveProperty('Authorization');
    });
  });

  describe('request() — wire format', () => {
    let client: Client;

    beforeEach(() => {
      client = buildClient({ branch: 'main' });
      client.authProvider = {
        getToken: vi.fn().mockResolvedValue(null),
      } as any;
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('sends a POST with JSON content-type to the branch-derived content API URL', async () => {
      const fetchMock = stubFetchOnce(
        makeResponse({ status: 200, body: { data: {} } })
      );

      await client.request('{ hello }', { variables: {} });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://content.tinajs.io/1.1/content/test-id/github/main',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('stringifies the query and variables into the request body', async () => {
      const fetchMock = stubFetchOnce(
        makeResponse({ status: 200, body: { data: {} } })
      );

      await client.request('query X { y }', { variables: { z: 1 } });

      const [, init] = fetchMock.mock.calls[0];
      expect(JSON.parse(init.body)).toEqual({
        query: 'query X { y }',
        variables: { z: 1 },
      });
    });

    it("prints a graphql-tag function into the body's query string", async () => {
      const fetchMock = stubFetchOnce(
        makeResponse({ status: 200, body: { data: {} } })
      );

      await client.request((gql) => gql`query X { y }`, { variables: {} });

      const [, init] = fetchMock.mock.calls[0];
      const body = JSON.parse(init.body);
      expect(body.query).toContain('query X');
      expect(body.query).toContain('y');
    });
  });

  describe('branch resolution', () => {
    let client: Client;

    it('encodes the branch into the content API URL', () => {
      client = buildClient({ branch: 'feat/x y' });

      expect(client.contentApiUrl).toBe(
        'https://content.tinajs.io/1.1/content/test-id/github/feat%2Fx%20y'
      );
    });

    it('re-derives the content API URL when setBranch is called', () => {
      client = buildClient({ branch: 'main' });
      client.setBranch('develop');

      expect(client.contentApiUrl).toBe(
        'https://content.tinajs.io/1.1/content/test-id/github/develop'
      );
    });

    it('prefers customContentApiUrl over the branch-derived URL', () => {
      client = buildClient({
        branch: 'main',
        customContentApiUrl: 'http://tina.io/override',
      });

      client.setBranch('other');

      expect(client.contentApiUrl).toBe('http://tina.io/override');
    });

    it('applies tinaioConfig.contentApiUrlOverride to the base URL', () => {
      client = buildClient({
        branch: 'main',
        tinaioConfig: { contentApiUrlOverride: 'https://custom.example.com' },
      });

      expect(client.contentApiBase).toBe('https://custom.example.com');
      expect(client.contentApiUrl).toBe(
        'https://custom.example.com/1.1/content/test-id/github/main'
      );
    });

    it('promotes schema.config.contentApiUrlOverride to the content API URL', () => {
      client = buildClient({
        branch: 'main',
        schema: {
          collections: [],
          config: {
            contentApiUrlOverride: 'https://schema-override.example.com',
          },
        } as any,
      });

      expect(client.contentApiUrl).toBe('https://schema-override.example.com');
    });
  });

  describe('branch management', () => {
    let client: Client;
    let fetchWithToken: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      client = buildClient();
      fetchWithToken = vi.fn();
      client.authProvider = { fetchWithToken } as any;
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('createBranch sends a POST with baseBranch and branchName in the JSON body', async () => {
      fetchWithToken.mockResolvedValueOnce(
        makeResponse({
          status: 200,
          body: { data: { ref: 'refs/heads/feature-x' } },
        })
      );

      await client.createBranch({
        baseBranch: 'main',
        branchName: 'feature-x',
      });

      expect(fetchWithToken).toHaveBeenCalledWith(
        'https://content.tinajs.io/github/test-id/create_branch',
        {
          method: 'POST',
          body: JSON.stringify({
            baseBranch: 'main',
            branchName: 'feature-x',
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('createBranch returns the branch name parsed from the response ref', async () => {
      fetchWithToken.mockResolvedValueOnce(
        makeResponse({
          status: 200,
          body: { data: { ref: 'refs/heads/feature-x' } },
        })
      );

      const result = await client.createBranch({
        baseBranch: 'main',
        branchName: 'feature-x',
      });

      expect(result).toBe('feature-x');
    });

    it('createBranch throws with the response body message when the response is not ok', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchWithToken.mockResolvedValueOnce(
        makeResponse({
          status: 400,
          body: { message: 'Branch already exists' },
          statusText: 'Bad Request',
        })
      );

      await expect(
        client.createBranch({
          baseBranch: 'main',
          branchName: 'feature-x',
        })
      ).rejects.toThrow('Branch already exists');
    });

    it('listBranches GETs the list_branches endpoint and parses the response through the zod schema', async () => {
      fetchWithToken.mockResolvedValueOnce(
        makeResponse({
          status: 200,
          body: [
            { name: 'main', protected: true },
            {
              name: 'feature-x',
              githubPullRequestUrl: 'https://github.com/tinacms/tinacms/pull/1',
            },
          ] as unknown as Record<string, unknown>,
        })
      );

      const result = await client.listBranches({ includeIndexStatus: false });

      expect(fetchWithToken).toHaveBeenCalledWith(
        'https://content.tinajs.io/github/test-id/list_branches',
        { method: 'GET' }
      );
      expect(result).toEqual([
        { name: 'main', protected: true },
        {
          name: 'feature-x',
          protected: false,
          githubPullRequestUrl: 'https://github.com/tinacms/tinacms/pull/1',
        },
      ]);
    });

    it('listBranches fetches index status per branch and populates protectedBranches', async () => {
      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: [
              { name: 'main', protected: true },
              { name: 'feature-x', protected: false },
            ] as unknown as Record<string, unknown>,
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { status: 'complete', timestamp: 1 },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({ status: 200, body: { status: 'inprogress' } })
        );

      const result = await client.listBranches();

      expect(result).toEqual([
        {
          name: 'main',
          protected: true,
          indexStatus: { status: 'complete', timestamp: 1 },
        },
        {
          name: 'feature-x',
          protected: false,
          indexStatus: { status: 'inprogress' },
        },
      ]);
      expect(client.protectedBranches).toEqual(['main']);
    });

    it('branchExists returns true when the branch is in the list', async () => {
      fetchWithToken.mockResolvedValueOnce(
        makeResponse({
          status: 200,
          body: [
            { name: 'main', protected: true },
            { name: 'feature-x', protected: false },
          ] as unknown as Record<string, unknown>,
        })
      );

      const result = await client.branchExists('feature-x');

      expect(result).toBe(true);
    });

    it('branchExists returns false when the branch is not in the list', async () => {
      fetchWithToken.mockResolvedValueOnce(
        makeResponse({
          status: 200,
          body: [{ name: 'main', protected: true }] as unknown as Record<
            string,
            unknown
          >,
        })
      );

      const result = await client.branchExists('feature-x');

      expect(result).toBe(false);
    });

    it('branchExists returns true in local mode without calling listBranches', async () => {
      const localClient = new LocalClient();
      const localFetchWithToken = vi.fn();
      localClient.authProvider = {
        fetchWithToken: localFetchWithToken,
      } as any;

      const result = await localClient.branchExists('any-branch');

      expect(result).toBe(true);
      expect(localFetchWithToken).not.toHaveBeenCalled();
    });
  });

  describe('request() — error handling', () => {
    let client: Client;

    beforeEach(() => {
      client = buildClient({ branch: 'feature', clientId: 'app-42' });
      client.authProvider = {
        getToken: vi.fn().mockResolvedValue(null),
      } as any;
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('throws with clientId and branch context on a non-200 against a tina.io URL', async () => {
      stubFetchOnce(
        makeResponse({
          status: 500,
          body: {},
          statusText: 'Server Error',
        })
      );

      await expect(client.request('{ x }', { variables: {} })).rejects.toThrow(
        /clientId: app-42[\s\S]*branch: feature/
      );
    });

    it('omits the clientId/branch hint when a custom content API URL is set', async () => {
      client = buildClient({
        branch: 'feature',
        clientId: 'app-42',
        customContentApiUrl: 'http://tina.io/override',
      });
      client.authProvider = {
        getToken: vi.fn().mockResolvedValue(null),
      } as any;
      stubFetchOnce(
        makeResponse({
          status: 500,
          body: { message: 'oops' },
          statusText: 'Server Error',
        })
      );

      await expect(client.request('{ x }', { variables: {} })).rejects.toThrow(
        /^Unable to complete request, Server Error, Response: oops$/
      );
    });

    it("appends the response body's message to the thrown error", async () => {
      stubFetchOnce(
        makeResponse({
          status: 400,
          body: { message: 'boom' },
          statusText: 'Bad Request',
        })
      );

      await expect(client.request('{ x }', { variables: {} })).rejects.toThrow(
        /Response: boom/
      );
    });

    it('joins GraphQL error messages from a 200 response', async () => {
      stubFetchOnce(
        makeResponse({
          status: 200,
          body: {
            errors: [{ message: 'first error' }, { message: 'second error' }],
          },
        })
      );

      await expect(client.request('{ x }', { variables: {} })).rejects.toThrow(
        /first error[\s\S]*second error/
      );
    });

    it('propagates a fetch rejection unchanged', async () => {
      const networkError = new Error('ECONNRESET');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(networkError));

      await expect(client.request('{ x }', { variables: {} })).rejects.toThrow(
        networkError
      );
    });
  });

  describe('auth token flow', () => {
    let client: Client;
    let getToken: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      client = buildClient({ customContentApiUrl: 'http://tina.io/x' });
      getToken = vi.fn();
      client.authProvider = { getToken } as any;
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('includes an Authorization Bearer header when getToken returns an id_token', async () => {
      getToken.mockResolvedValue({ id_token: 'abc' });
      const fetchMock = stubFetchOnce(
        makeResponse({ status: 200, body: { data: {} } })
      );

      await client.request('{ x }', { variables: {} });

      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers).toMatchObject({ Authorization: 'Bearer abc' });
    });

    it('omits the Authorization header when getToken returns null', async () => {
      getToken.mockResolvedValue(null);
      const fetchMock = stubFetchOnce(
        makeResponse({ status: 200, body: { data: {} } })
      );

      await client.request('{ x }', { variables: {} });

      const [, init] = fetchMock.mock.calls[0];
      expect(init.headers).not.toHaveProperty('Authorization');
    });

    it('fetches a fresh token for each request', async () => {
      getToken
        .mockResolvedValueOnce({ id_token: 'v1' })
        .mockResolvedValueOnce({ id_token: 'v2' });
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          makeResponse({ status: 200, body: { data: {} } })
        )
        .mockResolvedValueOnce(
          makeResponse({ status: 200, body: { data: {} } })
        );
      vi.stubGlobal('fetch', fetchMock);

      await client.request('{ a }', { variables: {} });
      await client.request('{ b }', { variables: {} });

      expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
        Authorization: 'Bearer v1',
      });
      expect(fetchMock.mock.calls[1][1].headers).toMatchObject({
        Authorization: 'Bearer v2',
      });
    });
  });

  describe('executeEditorialWorkflow', () => {
    let client: Client;
    let fetchWithToken: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(console, 'error').mockImplementation(() => {});
      client = buildClient({
        clientId: 'client-id',
        customContentApiUrl: 'http://tina.io/fakeURL',
      });
      fetchWithToken = vi.fn();
      client.authProvider = {
        fetchWithToken,
      } as any;
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('preserves startup workflow errors from the API', async () => {
      fetchWithToken.mockResolvedValueOnce(
        makeResponse({
          status: 400,
          body: {
            message: 'Branch name validation failed',
            errorCode: EDITORIAL_WORKFLOW_ERROR.VALIDATION_FAILED,
          },
          statusText: 'Bad Request',
        })
      );

      await expect(
        client.executeEditorialWorkflow({
          branchName: 'feature/test',
          baseBranch: 'main',
        })
      ).rejects.toMatchObject({
        message: 'Branch name validation failed',
        errorCode: EDITORIAL_WORKFLOW_ERROR.VALIDATION_FAILED,
      });
    });

    it('polls until the workflow completes', async () => {
      const onStatusUpdate = vi.fn();

      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 202,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.CREATING_BRANCH,
              message: 'Creating branch...',
            },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.COMPLETE,
              branchName: 'feature/test',
              pullRequestUrl: 'https://github.com/tinacms/tinacms/pull/1',
            },
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
        onStatusUpdate,
      });

      await vi.advanceTimersByTimeAsync(10000);

      await expect(promise).resolves.toEqual({
        branchName: 'feature/test',
        pullRequestUrl: 'https://github.com/tinacms/tinacms/pull/1',
      });

      expect(onStatusUpdate).toHaveBeenNthCalledWith(1, {
        status: EDITORIAL_WORKFLOW_STATUS.QUEUED,
        message: 'Workflow queued, starting...',
      });
      expect(onStatusUpdate).toHaveBeenNthCalledWith(2, {
        status: EDITORIAL_WORKFLOW_STATUS.CREATING_BRANCH,
        message: 'Creating branch...',
      });
      expect(onStatusUpdate).toHaveBeenNthCalledWith(3, {
        status: EDITORIAL_WORKFLOW_STATUS.COMPLETE,
        message: `Status: ${EDITORIAL_WORKFLOW_STATUS.COMPLETE}`,
      });
    });

    it('fails fast on unexpected polling statuses', async () => {
      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 404,
            body: { message: 'Request not found' },
            statusText: 'Not Found',
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
      });
      const rejection = expect(promise).rejects.toMatchObject({
        message: 'Request not found',
        errorCode: 'WORKFLOW_STATUS_FAILED',
      } satisfies Partial<EditorialWorkflowErrorDetails>);

      await vi.advanceTimersByTimeAsync(5000);

      await rejection;

      expect(fetchWithToken).toHaveBeenCalledTimes(2);
    });

    it('detects error status in polling response body', async () => {
      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.ERROR,
              message:
                'Could not complete editorial workflow because your GitHub authoring connection needs attention.',
            },
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
      });
      const rejection = expect(promise).rejects.toMatchObject({
        message:
          'Could not complete editorial workflow because your GitHub authoring connection needs attention.',
        errorCode: 'WORKFLOW_FAILED',
      });

      await vi.advanceTimersByTimeAsync(5000);

      await rejection;
    });

    it('detects error status in HTTP 500 polling response', async () => {
      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 500,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.ERROR,
              message: 'Indexing failed',
              errorCode: 'WORKFLOW_FAILED',
            },
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
      });
      const rejection = expect(promise).rejects.toMatchObject({
        message: 'Indexing failed',
        errorCode: 'WORKFLOW_FAILED',
      });

      await vi.advanceTimersByTimeAsync(5000);

      await rejection;
    });

    it('retries transient polling failures', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      fetchWithToken
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: { requestId: 'req-123' },
          })
        )
        .mockRejectedValueOnce(new Error('network issue'))
        .mockResolvedValueOnce(
          makeResponse({
            status: 202,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.CREATING_PR,
              message: 'Creating PR...',
            },
          })
        )
        .mockResolvedValueOnce(
          makeResponse({
            status: 200,
            body: {
              status: EDITORIAL_WORKFLOW_STATUS.COMPLETE,
              branchName: 'feature/test',
              pullRequestUrl: 'https://github.com/tinacms/tinacms/pull/2',
            },
          })
        );

      const promise = client.executeEditorialWorkflow({
        branchName: 'feature/test',
        baseBranch: 'main',
      });

      await vi.advanceTimersByTimeAsync(15000);

      await expect(promise).resolves.toEqual({
        branchName: 'feature/test',
        pullRequestUrl: 'https://github.com/tinacms/tinacms/pull/2',
      });

      expect(fetchWithToken).toHaveBeenCalledTimes(4);
      expect(warnSpy).toHaveBeenCalledOnce();
    });
  });
});
