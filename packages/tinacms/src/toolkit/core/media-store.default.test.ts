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
  createBranch,
  createPullRequest,
  getIndexStatus,
  autoConfirmMediaBranchPrompt = true,
}: {
  branch?: string | undefined;
  isLocalMode?: boolean;
  authenticated?: boolean;
  usingProtectedBranch?: boolean;
  createBranch?: ReturnType<typeof vi.fn>;
  createPullRequest?: ReturnType<typeof vi.fn>;
  getIndexStatus?: ReturnType<typeof vi.fn>;
  autoConfirmMediaBranchPrompt?: boolean;
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
    createBranch:
      createBranch ??
      vi.fn().mockImplementation(async ({ branchName }) => {
        api.branch = branchName;
        return branchName;
      }),
    createPullRequest:
      createPullRequest ??
      vi.fn().mockResolvedValue({
        url: 'https://github.com/x/y/pull/1',
      }),
    getIndexStatus:
      getIndexStatus ?? vi.fn().mockResolvedValue({ status: 'complete' }),
    gitSettingsLink: 'https://app.tina.io/settings',
  };
  const events = new EventBus();
  if (autoConfirmMediaBranchPrompt) {
    events.subscribe('media:workflow:confirm-branch', (event) => {
      event.onConfirm(`tina/${event.branchName}`);
    });
  }
  const alerts = { warn: vi.fn(), success: vi.fn(), error: vi.fn() };
  const cms = { api: { tina: api }, events, alerts } as any;
  const store = new TinaMediaStore(cms);
  return {
    store,
    fetchWithToken,
    authProvider,
    api,
    cms,
    events,
    alerts,
    getIndexStatus: api.getIndexStatus as ReturnType<typeof vi.fn>,
  };
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

  it('creates the branch before upload and the pull request after upload', async () => {
    const mediaBranch = 'tina/media-upload-uploads-blog-llama-png';
    const createBranch = vi.fn(async ({ branchName }) => {
      api.branch = branchName;
      return branchName;
    });
    const createPullRequest = vi.fn().mockResolvedValue({
      url: 'https://github.com/x/y/pull/9',
    });

    const { store, fetchWithToken, api } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
      createPullRequest,
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

    expect(createBranch).toHaveBeenCalledWith({
      branchName: mediaBranch,
      baseBranch: 'main',
    });

    const branchOrder = createBranch.mock.invocationCallOrder[0];
    const uploadOrder = fetchWithToken.mock.invocationCallOrder[0];
    expect(uploadOrder).toBeGreaterThan(branchOrder);

    const prOrder = createPullRequest.mock.invocationCallOrder[0];
    expect(prOrder).toBeGreaterThan(uploadOrder);
    expect(createPullRequest).toHaveBeenCalledWith({
      baseBranch: 'main',
      branch: mediaBranch,
      title: 'media upload uploads blog llama png (PR from TinaCMS)',
    });
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(mediaBranch)}`
    );
  });

  it('does not fail the completed upload when pull request creation reports an error', async () => {
    const createPullRequest = vi
      .fn()
      .mockRejectedValue(
        new Error('There was an error creating a pull request')
      );

    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createPullRequest,
    });
    const onWorkflowError = vi.fn();
    const onWorkflowComplete = vi.fn();
    events.subscribe('media:workflow:error', onWorkflowError);
    events.subscribe('media:workflow:complete', onWorkflowComplete);

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

    await expect(persistPromise).resolves.toEqual([]);
    expect(createPullRequest).toHaveBeenCalled();
    expect(onWorkflowError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'There was an error creating a pull request',
      })
    );
  });

  it('falls back to a stable branch slug when the media path has no branch-safe characters', async () => {
    let mediaBranch = '';
    const createBranch = vi.fn(async ({ branchName }) => {
      mediaBranch = branchName;
      api.branch = branchName;
      return branchName;
    });

    const { store, fetchWithToken, api } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
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

    expect(mediaBranch).toMatch(/^tina\/media-upload-asset-[a-z0-9]+$/);
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(mediaBranch)}`
    );
  });

  it('keeps media branch names distinct for case-only filename differences', async () => {
    const mediaBranches: string[] = [];
    const createBranch = vi.fn(async ({ branchName }) => {
      mediaBranches.push(branchName);
      return branchName;
    });

    const { store, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
    });

    fetchWithToken
      .mockResolvedValueOnce(
        makeJsonResponse(200, {
          signedUrl: 'https://s3.example/hero-upper',
          requestId: 'r1',
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
      )
      .mockResolvedValueOnce(
        makeJsonResponse(200, {
          signedUrl: 'https://s3.example/hero-lower',
          requestId: 'r2',
        })
      )
      .mockResolvedValueOnce(
        makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
      );
    stubS3PutOk();

    const upperPersistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'Hero.PNG', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    await upperPersistPromise;

    const lowerPersistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'hero.png', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    await lowerPersistPromise;

    expect(mediaBranches[0]).toMatch(
      /^tina\/media-upload-uploads-hero-png-[a-z0-9]+$/
    );
    expect(mediaBranches[1]).toBe('tina/media-upload-uploads-hero-png');
  });

  it('uses the branch name confirmed by the media branch prompt', async () => {
    const selectedBranch = 'tina/custom-media-change';
    const createBranch = vi.fn(async ({ branchName }) => {
      api.branch = branchName;
      return branchName;
    });

    const { store, fetchWithToken, api, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
      autoConfirmMediaBranchPrompt: false,
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

    expect(createBranch.mock.calls[0][0].branchName).toBe(selectedBranch);
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(selectedBranch)}`
    );
  });

  it('rejects the branch prompt confirmation when branch preparation fails', async () => {
    const createBranch = vi
      .fn()
      .mockRejectedValue(new Error('There was an error creating a new branch'));

    const { store, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
      autoConfirmMediaBranchPrompt: false,
    });

    const confirmEventPromise = new Promise<any>((resolve) => {
      events.subscribe('media:workflow:confirm-branch', resolve);
    });

    const persistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'a.png', { type: 'image/png' }),
      },
    ]);

    const event = await confirmEventPromise;
    const confirmPromise = event.onConfirm('tina/custom-media-change');
    await expect(confirmPromise).rejects.toThrow(
      'There was an error creating a new branch'
    );
    await expect(persistPromise).rejects.toThrow(
      'There was an error creating a new branch'
    );
  });

  it('continues on the protected branch when the overlay chooses that action', async () => {
    const createBranch = vi.fn();
    const createPullRequest = vi.fn();
    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
      createPullRequest,
      autoConfirmMediaBranchPrompt: false,
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

    expect(createBranch).not.toHaveBeenCalled();
    expect(createPullRequest).not.toHaveBeenCalled();
    expect(fetchWithToken.mock.calls[0][0]).toContain('?branch=main');
  });

  it('continues on the protected branch when no media workflow overlay is mounted', async () => {
    const createBranch = vi.fn();
    const createPullRequest = vi.fn();
    const { store, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
      createPullRequest,
      autoConfirmMediaBranchPrompt: false,
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

    expect(createBranch).not.toHaveBeenCalled();
    expect(createPullRequest).not.toHaveBeenCalled();
    expect(fetchWithToken.mock.calls[0][0]).toContain('?branch=main');
  });

  it('resolves persist with [] when the user cancels the branch prompt', async () => {
    const createBranch = vi.fn();
    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
      autoConfirmMediaBranchPrompt: false,
    });

    events.subscribe('media:workflow:confirm-branch', (event) => {
      event.onCancel();
    });

    await expect(
      store.persist([
        {
          directory: 'uploads',
          file: new File(['x'], 'a.png', { type: 'image/png' }),
        },
      ])
    ).resolves.toEqual([]);

    expect(createBranch).not.toHaveBeenCalled();
    expect(fetchWithToken).not.toHaveBeenCalled();
  });

  it('resolves delete cleanly when the user cancels the branch prompt', async () => {
    const createBranch = vi.fn();
    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
      autoConfirmMediaBranchPrompt: false,
    });

    events.subscribe('media:workflow:confirm-branch', (event) => {
      event.onCancel();
    });

    await expect(
      store.delete({
        directory: 'images',
        filename: 'a.png',
      } as Media)
    ).resolves.toBeUndefined();

    expect(createBranch).not.toHaveBeenCalled();
    expect(fetchWithToken).not.toHaveBeenCalled();
  });

  it('does not create a media branch for an empty upload batch', async () => {
    const createBranch = vi.fn();
    const { store, fetchWithToken, authProvider } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
    });

    await expect(store.persist([])).resolves.toEqual([]);

    expect(authProvider.isAuthenticated).not.toHaveBeenCalled();
    expect(createBranch).not.toHaveBeenCalled();
    expect(fetchWithToken).not.toHaveBeenCalled();
  });

  it('skips branch preparation when not on a protected branch (regression)', async () => {
    const createBranch = vi.fn();
    const { store, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: false,
      createBranch,
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

    expect(createBranch).not.toHaveBeenCalled();
  });

  it('intercepts delete on a protected branch', async () => {
    const mediaBranch = 'tina/media-delete-images-a-png';
    const createBranch = vi.fn(async ({ branchName }) => {
      api.branch = branchName;
      return branchName;
    });
    const createPullRequest = vi.fn().mockResolvedValue({
      url: 'https://github.com/x/y/pull/3',
    });

    const { store, fetchWithToken, api } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch,
      createPullRequest,
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

    expect(createBranch).toHaveBeenCalledTimes(1);
    expect(createBranch.mock.calls[0][0].branchName).toBe(mediaBranch);
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(mediaBranch)}`
    );
    expect(createPullRequest).toHaveBeenCalledWith({
      baseBranch: 'main',
      branch: mediaBranch,
      title: 'media delete images a png (PR from TinaCMS)',
    });
  });

  it('switches the React branch after the media request succeeds', async () => {
    const eventsLog: string[] = [];

    const getIndexStatus = vi.fn(async () => {
      eventsLog.push('getIndexStatus');
      return { status: 'complete' as const };
    });
    const createPullRequest = vi.fn(async () => {
      eventsLog.push('createPullRequest');
      return { url: 'https://github.com/x/y/pull/9' };
    });

    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createBranch: vi.fn(async ({ branchName }) => {
        eventsLog.push('createBranch');
        return branchName;
      }),
      createPullRequest,
      getIndexStatus,
    });
    events.subscribe('media:workflow:complete', () => {
      eventsLog.push('media:workflow:complete');
    });

    fetchWithToken
      .mockImplementationOnce(async () => {
        eventsLog.push('upload_url');
        return makeJsonResponse(200, {
          signedUrl: 'https://s3.example/x',
          requestId: 'r1',
        });
      })
      .mockImplementationOnce(async () => {
        eventsLog.push('list');
        return makeJsonResponse(200, {
          files: [],
          directories: [],
          cursor: 0,
        });
      });
    stubS3PutOk();

    const persistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'a.png', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    await persistPromise;

    expect(eventsLog).toEqual([
      'createBranch',
      'getIndexStatus',
      'upload_url',
      'list',
      'media:workflow:complete',
      'getIndexStatus',
      'createPullRequest',
    ]);
  });

  it('waits for initial branch indexing before upload and media indexing before the pull request', async () => {
    const getIndexStatus = vi
      .fn()
      .mockResolvedValueOnce({ status: 'complete' })
      .mockResolvedValueOnce({ status: 'inprogress' })
      .mockResolvedValueOnce({ status: 'inprogress' })
      .mockResolvedValueOnce({ status: 'complete' });

    const createPullRequest = vi.fn().mockResolvedValue({
      url: 'https://github.com/x/y/pull/2',
    });

    const { store, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createPullRequest,
      getIndexStatus,
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
    await vi.advanceTimersByTimeAsync(5000);
    await vi.advanceTimersByTimeAsync(5000);
    await persistPromise;

    expect(getIndexStatus).toHaveBeenCalledTimes(4);
    expect(getIndexStatus.mock.calls[0][0]).toEqual({
      ref: 'tina/media-upload-uploads-a-png',
    });
    expect(getIndexStatus.mock.invocationCallOrder[0]).toBeLessThan(
      fetchWithToken.mock.invocationCallOrder[0]
    );

    const lastIndexCall = getIndexStatus.mock.invocationCallOrder.at(-1)!;
    const prCall = createPullRequest.mock.invocationCallOrder[0];
    expect(prCall).toBeGreaterThan(lastIndexCall);
  });

  it('switches branch and surfaces indexing failures without breaking the completed upload', async () => {
    const getIndexStatus = vi
      .fn()
      .mockResolvedValueOnce({ status: 'complete' })
      .mockResolvedValue({ status: 'failed' });
    const createPullRequest = vi.fn();

    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createPullRequest,
      getIndexStatus,
    });

    const onWorkflowError = vi.fn();
    const onWorkflowComplete = vi.fn();
    events.subscribe('media:workflow:error', onWorkflowError);
    events.subscribe('media:workflow:complete', onWorkflowComplete);

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

    await expect(persistPromise).resolves.toEqual([]);

    expect(createPullRequest).not.toHaveBeenCalled();
    expect(onWorkflowComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        branchName: 'tina/media-upload-uploads-a-png',
      })
    );
    expect(onWorkflowError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Indexing failed'),
      })
    );
  });

  it('surfaces "indexing never started" when the webhook stays unknown for too long', async () => {
    const getIndexStatus = vi
      .fn()
      .mockResolvedValueOnce({ status: 'complete' })
      .mockResolvedValue({ status: 'unknown' });
    const createPullRequest = vi.fn();

    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      createPullRequest,
      getIndexStatus,
    });

    const onWorkflowError = vi.fn();
    const onWorkflowComplete = vi.fn();
    events.subscribe('media:workflow:error', onWorkflowError);
    events.subscribe('media:workflow:complete', onWorkflowComplete);

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
    for (let i = 0; i < 23; i++) {
      await vi.advanceTimersByTimeAsync(5000);
    }

    await expect(persistPromise).resolves.toEqual([]);
    expect(createPullRequest).not.toHaveBeenCalled();
    expect(onWorkflowComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        branchName: 'tina/media-upload-uploads-a-png',
      })
    );
    expect(onWorkflowError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Indexing never started'),
      })
    );
  });
});
