import type { Media, MediaUploadOptions } from './media';
import { TinaMediaStore } from './media-store.default';
import { EventBus } from './event';

type FetchWithTokenMock = ReturnType<typeof vi.fn>;

const makeJsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  }) as any;

// Stubs the global `fetch` to a successful S3 PUT response so the upload
// loop in `persist_cloud` moves past the signed-URL upload step.
const stubS3PutOk = () =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(''),
      json: vi.fn().mockResolvedValue({}),
    })
  );

const buildStore = ({
  branch = 'main',
  isLocalMode = false,
  authenticated = true,
  usingProtectedBranch = false,
  executeEditorialWorkflow,
  autoConfirmMediaWorkflow = true,
}: {
  branch?: string | undefined;
  isLocalMode?: boolean;
  authenticated?: boolean;
  usingProtectedBranch?: boolean;
  executeEditorialWorkflow?: ReturnType<typeof vi.fn>;
  autoConfirmMediaWorkflow?: boolean;
} = {}) => {
  const fetchWithToken: FetchWithTokenMock = vi.fn();
  const authProvider = {
    fetchWithToken,
    isAuthenticated: vi.fn().mockResolvedValue(authenticated),
  };
  const api: any = {
    branch,
    clientId: 'test-client',
    contentApiUrl:
      'https://content.tinajs.io/1.1/content/test-client/github/main',
    assetsApiUrl: 'https://assets.tinajs.io',
    isLocalMode,
    authProvider,
    options: {},
    getRequestStatus: vi.fn().mockResolvedValue({ error: false }),
    schema: { schema: { config: { media: { tina: {} } } } },
    usingProtectedBranch: vi.fn().mockReturnValue(usingProtectedBranch),
    executeEditorialWorkflow:
      executeEditorialWorkflow ??
      vi.fn().mockResolvedValue({
        branchName: 'tina/media-upload-uploads',
        pullRequestUrl: 'https://github.com/x/y/pull/1',
      }),
    gitSettingsLink: 'https://app.tina.io/settings',
  };
  const events = new EventBus();
  if (autoConfirmMediaWorkflow) {
    events.subscribe('media:workflow:confirm-branch', (event) => {
      event.onConfirm(`tina/${event.branchName}`);
    });
  }
  const alerts = { warn: vi.fn(), success: vi.fn(), error: vi.fn() };
  const cms = { api: { tina: api }, events, alerts } as any;
  const store = new TinaMediaStore(cms);
  return { store, fetchWithToken, authProvider, api, cms, events, alerts };
};

describe('TinaMediaStore — branch query param', () => {
  describe('list()', () => {
    it('appends single-encoded branch for a simple branch', async () => {
      const { store, fetchWithToken } = buildStore({ branch: 'main' });
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
      );

      await store.list({ directory: '', thumbnailSizes: [] } as any);

      const calledUrl = fetchWithToken.mock.calls[0][0];
      expect(calledUrl).toContain('&branch=main');
      expect(calledUrl).not.toContain('branch=undefined');
    });

    it('single-encodes a branch containing `/` (already encoded on the Client)', async () => {
      // `Client.setBranch('feat/x')` stores `'feat%2Fx'`; list() should
      // forward exactly `branch=feat%2Fx`, never the double-encoded form.
      const { store, fetchWithToken } = buildStore({ branch: 'feat%2Fx' });
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
      );

      await store.list({ directory: '', thumbnailSizes: [] } as any);

      const calledUrl = fetchWithToken.mock.calls[0][0];
      expect(calledUrl).toContain('&branch=feat%2Fx');
      expect(calledUrl).not.toContain('feat%252Fx');
    });

    it('omits the branch param when branch is the literal string "undefined"', async () => {
      // `Client.setBranch(undefined)` runs `encodeURIComponent(undefined)`,
      // which returns the literal 9-char string "undefined". We must not
      // forward that to the assets-api as a real branch.
      const { store, fetchWithToken } = buildStore({ branch: 'undefined' });
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
      );

      await store.list({ directory: '', thumbnailSizes: [] } as any);

      const calledUrl = fetchWithToken.mock.calls[0][0];
      expect(calledUrl).not.toContain('branch=');
    });

    it('omits the branch param when branch is empty', async () => {
      const { store, fetchWithToken } = buildStore({ branch: '' });
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
      );

      await store.list({ directory: '', thumbnailSizes: [] } as any);

      const calledUrl = fetchWithToken.mock.calls[0][0];
      expect(calledUrl).not.toContain('branch=');
    });
  });

  describe('delete()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('appends branch as the first query param', async () => {
      const { store, fetchWithToken } = buildStore({ branch: 'feat%2Fx' });
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, { requestId: 'req-1' })
      );

      const deletePromise = store.delete({
        directory: 'images',
        filename: 'a.png',
      } as Media);
      await vi.advanceTimersByTimeAsync(1100);
      await deletePromise;

      const calledUrl = fetchWithToken.mock.calls[0][0];
      expect(calledUrl).toContain('/images/a.png?branch=feat%2Fx');
    });

    it('omits the branch param when branch is unset', async () => {
      const { store, fetchWithToken } = buildStore({ branch: '' });
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, { requestId: 'req-1' })
      );

      const deletePromise = store.delete({
        directory: 'images',
        filename: 'a.png',
      } as Media);
      await vi.advanceTimersByTimeAsync(1100);
      await deletePromise;

      const calledUrl = fetchWithToken.mock.calls[0][0];
      expect(calledUrl).toContain('/images/a.png');
      expect(calledUrl).not.toContain('branch=');
    });
  });

  describe('persist()', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    const stubFetchGlobal = (status: number, body: unknown) => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        text: vi.fn().mockResolvedValue(''),
        json: vi.fn().mockResolvedValue(body),
      });
      vi.stubGlobal('fetch', fetchMock);
      return fetchMock;
    };

    it('forwards the encoded branch on the upload_url request and resolves canonical entries via list()', async () => {
      const { store, fetchWithToken } = buildStore({ branch: 'feat%2Fx' });
      // 1) upload_url response
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, {
          signedUrl: 'https://s3.example/signed',
          requestId: 'req-1',
        })
      );
      // 2) the post-upload list() call inside fetchUploadedEntries
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, {
          files: [
            {
              filename: 'llama.png',
              src: 'https://assets.tina.io/test-client/__staging/feat/x/__file/uploads/llama.png',
            },
          ],
          directories: [],
          cursor: 0,
        })
      );
      stubFetchGlobal(200, {});

      const uploads: MediaUploadOptions[] = [
        {
          directory: 'uploads',
          file: new File(['x'], 'llama.png', { type: 'image/png' }),
        },
      ];

      const persistPromise = store.persist(uploads);
      // Advance past the 1s polling sleep inside the upload loop.
      await vi.advanceTimersByTimeAsync(1100);
      const result = await persistPromise;

      // First call is upload_url with branch query.
      const uploadUrl = fetchWithToken.mock.calls[0][0];
      expect(uploadUrl).toContain(
        '/upload_url/uploads/llama.png?branch=feat%2Fx'
      );

      // Result contains the canonical entry from the list endpoint, not a
      // locally-constructed `https://assets.tina.io/<clientId>/<path>` URL.
      expect(result).toHaveLength(1);
      expect(result[0].filename).toBe('llama.png');
      expect(result[0].src).toBe(
        'https://assets.tina.io/test-client/__staging/feat/x/__file/uploads/llama.png'
      );
    });

    it('returns [] when not authenticated, without making upload calls', async () => {
      const { store, fetchWithToken } = buildStore({ authenticated: false });

      const uploads: MediaUploadOptions[] = [
        {
          directory: 'uploads',
          file: new File(['x'], 'llama.png', { type: 'image/png' }),
        },
      ];

      const result = await store.persist(uploads);
      expect(result).toEqual([]);
      expect(fetchWithToken).not.toHaveBeenCalled();
    });
  });
});

describe('TinaMediaStore — protected-branch interception', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('runs the editorial workflow before issuing the upload_url request', async () => {
    const workflowBranch = 'tina/media-upload-uploads-blog-llama-png';
    const executeEditorialWorkflow = vi.fn(async ({ onStatusUpdate }) => {
      onStatusUpdate?.({ status: 'COMPLETE' });
      return {
        branchName: workflowBranch,
        pullRequestUrl: 'https://github.com/x/y/pull/9',
      };
    });

    const { store, fetchWithToken, api } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      executeEditorialWorkflow,
    });

    // Simulate the admin shell catching up before the ack-wait: by the time
    // `awaitBranchSwitched` reads `api.branch`, it already matches.
    executeEditorialWorkflow.mockImplementation(async ({ onStatusUpdate }) => {
      onStatusUpdate?.({ status: 'COMPLETE' });
      api.branch = workflowBranch;
      return {
        branchName: workflowBranch,
        pullRequestUrl: 'https://github.com/x/y/pull/9',
      };
    });

    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        signedUrl: 'https://s3.example/x',
        requestId: 'r1',
      })
    );
    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
    );
    stubS3PutOk();

    const persistPromise = store.persist([
      {
        directory: 'uploads/blog',
        file: new File(['x'], 'llama.png', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    await persistPromise;

    expect(executeEditorialWorkflow).toHaveBeenCalledTimes(1);
    const [opts] = executeEditorialWorkflow.mock.calls[0];
    expect(opts.branchName).toBe(workflowBranch);
    expect(opts.baseBranch).toBe('main');
    expect(opts.graphQLContentOp).toBeUndefined();

    // The upload_url fetch must come AFTER the workflow call.
    const workflowOrder = executeEditorialWorkflow.mock.invocationCallOrder[0];
    const uploadOrder = fetchWithToken.mock.invocationCallOrder[0];
    expect(uploadOrder).toBeGreaterThan(workflowOrder);

    // And it should target the new branch.
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(workflowBranch)}`
    );
  });

  it('falls back to a stable branch slug when the media path has no branch-safe characters', async () => {
    let workflowBranch = '';
    const executeEditorialWorkflow = vi.fn(async (opts) => {
      workflowBranch = opts.branchName;
      opts.onStatusUpdate?.({ status: 'COMPLETE' });
      api.branch = workflowBranch;
      return {
        branchName: workflowBranch,
        pullRequestUrl: 'https://github.com/x/y/pull/10',
      };
    });

    const { store, fetchWithToken, api } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      executeEditorialWorkflow,
    });

    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        signedUrl: 'https://s3.example/x',
        requestId: 'r1',
      })
    );
    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
    );
    stubS3PutOk();

    const persistPromise = store.persist([
      {
        directory: '',
        file: new File(['x'], '!!!', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    await persistPromise;

    expect(workflowBranch).toMatch(/^tina\/media-upload-asset-[a-z0-9]+$/);
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(workflowBranch)}`
    );
  });

  it('uses the branch name confirmed by the workflow overlay', async () => {
    const selectedBranch = 'tina/custom-media-change';
    const executeEditorialWorkflow = vi.fn(async (opts) => {
      opts.onStatusUpdate?.({ status: 'COMPLETE' });
      api.branch = opts.branchName;
      return {
        branchName: opts.branchName,
        pullRequestUrl: 'https://github.com/x/y/pull/10',
      };
    });

    const { store, fetchWithToken, api, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      executeEditorialWorkflow,
      autoConfirmMediaWorkflow: false,
    });

    events.subscribe('media:workflow:confirm-branch', (event) => {
      expect(event.branchName).toBe('media-upload-uploads-a-png');
      event.onConfirm(selectedBranch);
    });

    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        signedUrl: 'https://s3.example/x',
        requestId: 'r1',
      })
    );
    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
    );
    stubS3PutOk();

    const persistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'a.png', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    await persistPromise;

    expect(executeEditorialWorkflow.mock.calls[0][0].branchName).toBe(
      selectedBranch
    );
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(selectedBranch)}`
    );
  });

  it('continues on the protected branch when the overlay chooses that action', async () => {
    const executeEditorialWorkflow = vi.fn();
    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      executeEditorialWorkflow,
      autoConfirmMediaWorkflow: false,
    });

    events.subscribe('media:workflow:confirm-branch', (event) => {
      event.onSaveToProtectedBranch();
    });

    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        signedUrl: 'https://s3.example/x',
        requestId: 'r1',
      })
    );
    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
    );
    stubS3PutOk();

    const persistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'a.png', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    await persistPromise;

    expect(executeEditorialWorkflow).not.toHaveBeenCalled();
    expect(fetchWithToken.mock.calls[0][0]).toContain('?branch=main');
  });

  it('does not create a workflow for an empty upload batch', async () => {
    const executeEditorialWorkflow = vi.fn();
    const { store, fetchWithToken, authProvider } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      executeEditorialWorkflow,
    });

    await expect(store.persist([])).resolves.toEqual([]);

    expect(authProvider.isAuthenticated).not.toHaveBeenCalled();
    expect(executeEditorialWorkflow).not.toHaveBeenCalled();
    expect(fetchWithToken).not.toHaveBeenCalled();
  });

  it('skips the workflow when not on a protected branch (regression)', async () => {
    const executeEditorialWorkflow = vi.fn();
    const { store, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: false,
      executeEditorialWorkflow,
    });

    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        signedUrl: 'https://s3.example/x',
        requestId: 'r1',
      })
    );
    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
    );
    stubS3PutOk();

    const persistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'a.png', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    await persistPromise;

    expect(executeEditorialWorkflow).not.toHaveBeenCalled();
  });

  it('intercepts delete on a protected branch', async () => {
    const workflowBranch = 'tina/media-delete-images-a-png';
    const executeEditorialWorkflow = vi.fn(async () => {
      return {
        branchName: workflowBranch,
        pullRequestUrl: 'https://github.com/x/y/pull/3',
      };
    });

    const { store, fetchWithToken, api } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      executeEditorialWorkflow,
    });
    executeEditorialWorkflow.mockImplementation(async () => {
      api.branch = workflowBranch;
      return {
        branchName: workflowBranch,
        pullRequestUrl: 'https://github.com/x/y/pull/3',
      };
    });

    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, { requestId: 'r-del' })
    );

    const deletePromise = store.delete({
      directory: 'images',
      filename: 'a.png',
    } as Media);
    await vi.advanceTimersByTimeAsync(1100);
    await deletePromise;

    expect(executeEditorialWorkflow).toHaveBeenCalledTimes(1);
    expect(executeEditorialWorkflow.mock.calls[0][0].branchName).toBe(
      workflowBranch
    );
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(workflowBranch)}`
    );
  });

  it('does not miss a branch-switch ack emitted during the complete event', async () => {
    const workflowBranch = 'tina/media-upload-uploads-a-png';
    const executeEditorialWorkflow = vi.fn().mockResolvedValue({
      branchName: workflowBranch,
      pullRequestUrl: 'https://github.com/x/y/pull/12',
    });

    const { store, fetchWithToken, api, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      executeEditorialWorkflow,
    });

    events.subscribe('media:workflow:complete', () => {
      api.branch = workflowBranch;
      events.dispatch({
        type: 'media:workflow:branch-switched',
        branchName: workflowBranch,
      });
    });

    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        signedUrl: 'https://s3.example/x',
        requestId: 'r1',
      })
    );
    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
    );
    stubS3PutOk();

    const persistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'a.png', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    await persistPromise;

    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(workflowBranch)}`
    );
  });

  it('surfaces branch-switch failures to the workflow overlay', async () => {
    const workflowBranch = 'tina/media-upload-uploads-a-png';
    const executeEditorialWorkflow = vi.fn().mockResolvedValue({
      branchName: workflowBranch,
      pullRequestUrl: 'https://github.com/x/y/pull/11',
    });

    const { store, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      executeEditorialWorkflow,
      autoConfirmMediaWorkflow: false,
    });

    let workflowError: unknown;
    events.subscribe('media:workflow:confirm-branch', (event) => {
      event.onConfirm(`tina/${event.branchName}`).catch((e) => {
        workflowError = e;
        event.onCancel();
      });
    });

    const persistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'a.png', { type: 'image/png' }),
      },
    ]);
    const result = persistPromise.catch((e) => e);
    await vi.advanceTimersByTimeAsync(30001);

    expect(workflowError).toMatchObject({
      message: expect.stringContaining('Timed out waiting for branch context'),
    });
    await expect(result).resolves.toMatchObject({
      message: expect.stringContaining('Media operation cancelled'),
    });
  });
});
