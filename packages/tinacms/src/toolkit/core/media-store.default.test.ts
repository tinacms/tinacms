import type { MediaWorkflowConfirmBranchEvent } from '@toolkit/form-builder/editorial-workflow-utils';
import type { TinaCMS } from '@toolkit/tina-cms';
import { EventBus } from './event';
import type { Media, MediaUploadOptions } from './media';
import { TinaMediaStore } from './media-store.default';

type FetchWithTokenMock = ReturnType<typeof vi.fn>;
type TinaApiMock = {
  branch?: string;
  clientId: string;
  contentApiUrl: string;
  assetsApiUrl: string;
  isLocalMode: boolean;
  authProvider: {
    fetchWithToken: FetchWithTokenMock;
    isAuthenticated: ReturnType<typeof vi.fn>;
  };
  options: Record<string, unknown>;
  getRequestStatus: ReturnType<typeof vi.fn>;
  schema: { schema: { config: { media: { tina: Record<string, unknown> } } } };
  usingProtectedBranch: ReturnType<typeof vi.fn>;
  createBranch: ReturnType<typeof vi.fn>;
  createPullRequest: ReturnType<typeof vi.fn>;
  getIndexStatus: ReturnType<typeof vi.fn>;
  startMediaEditorialWorkflow: ReturnType<typeof vi.fn>;
  waitForEditorialWorkflowStatus: ReturnType<typeof vi.fn>;
  gitSettingsLink: string;
};

const makeJsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  }) as unknown as Response;

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
  startMediaEditorialWorkflow,
  waitForEditorialWorkflowStatus,
  autoConfirmMediaBranchPrompt = true,
}: {
  branch?: string | undefined;
  isLocalMode?: boolean;
  authenticated?: boolean;
  usingProtectedBranch?: boolean;
  createBranch?: ReturnType<typeof vi.fn>;
  createPullRequest?: ReturnType<typeof vi.fn>;
  getIndexStatus?: ReturnType<typeof vi.fn>;
  startMediaEditorialWorkflow?: ReturnType<typeof vi.fn>;
  waitForEditorialWorkflowStatus?: ReturnType<typeof vi.fn>;
  autoConfirmMediaBranchPrompt?: boolean;
} = {}) => {
  const fetchWithToken: FetchWithTokenMock = vi.fn();
  let startedMediaWorkflowBranch = branch;
  const authProvider = {
    fetchWithToken,
    isAuthenticated: vi.fn().mockResolvedValue(authenticated),
  };
  const api: TinaApiMock = {
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
    startMediaEditorialWorkflow:
      startMediaEditorialWorkflow ??
      vi.fn().mockImplementation(async ({ branchName }) => ({
        branchName: (startedMediaWorkflowBranch = branchName),
        requestId: 'media-workflow-1',
        status: 'queued',
      })),
    waitForEditorialWorkflowStatus:
      waitForEditorialWorkflowStatus ??
      vi.fn().mockResolvedValue({
        branchName: startedMediaWorkflowBranch,
        pullRequestUrl: 'https://github.com/x/y/pull/1',
      }),
    gitSettingsLink: 'https://app.tina.io/settings',
  };
  const events = new EventBus();
  if (autoConfirmMediaBranchPrompt) {
    events.subscribe('media:workflow:confirm-branch', (event) => {
      event.onConfirm(`tina/${event.branchName}`);
    });
  }
  const alerts = { warn: vi.fn(), success: vi.fn(), error: vi.fn() };
  const cms = { api: { tina: api }, events, alerts } as unknown as TinaCMS;
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
    startMediaEditorialWorkflow: api.startMediaEditorialWorkflow as ReturnType<
      typeof vi.fn
    >,
    waitForEditorialWorkflowStatus:
      api.waitForEditorialWorkflowStatus as ReturnType<typeof vi.fn>,
  };
};

describe('TinaMediaStore — branch query param', () => {
  describe('list()', () => {
    it('appends single-encoded branch for a simple branch', async () => {
      const { store, fetchWithToken } = buildStore({ branch: 'main' });
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
      );

      await store.list({ directory: '', thumbnailSizes: [] });

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

      await store.list({ directory: '', thumbnailSizes: [] });

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

      await store.list({ directory: '', thumbnailSizes: [] });

      const calledUrl = fetchWithToken.mock.calls[0][0];
      expect(calledUrl).not.toContain('branch=');
    });

    it('omits the branch param when branch is empty', async () => {
      const { store, fetchWithToken } = buildStore({ branch: '' });
      fetchWithToken.mockResolvedValueOnce(
        makeJsonResponse(200, { files: [], directories: [], cursor: 0 })
      );

      await store.list({ directory: '', thumbnailSizes: [] });

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

  it('starts the server workflow before upload and waits for it after upload', async () => {
    const mediaBranch = 'tina/media-upload-uploads-blog-llama-png';

    const {
      store,
      fetchWithToken,
      startMediaEditorialWorkflow,
      waitForEditorialWorkflowStatus,
    } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
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

    expect(startMediaEditorialWorkflow).toHaveBeenCalledWith({
      branchName: mediaBranch,
      baseBranch: 'main',
      prTitle: 'media upload uploads blog llama png (PR from TinaCMS)',
      operation: 'upload',
      repoPath: 'uploads/blog/llama.png',
    });

    const branchOrder = startMediaEditorialWorkflow.mock.invocationCallOrder[0];
    const uploadOrder = fetchWithToken.mock.invocationCallOrder[0];
    expect(uploadOrder).toBeGreaterThan(branchOrder);

    const workflowStatusOrder =
      waitForEditorialWorkflowStatus.mock.invocationCallOrder[0];
    expect(workflowStatusOrder).toBeGreaterThan(uploadOrder);
    expect(waitForEditorialWorkflowStatus).toHaveBeenCalledWith(
      'media-workflow-1',
      expect.any(Function)
    );
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(mediaBranch)}`
    );
  });

  it('does not fail the completed upload when the server workflow reports an error', async () => {
    const waitForEditorialWorkflowStatus = vi
      .fn()
      .mockRejectedValue(
        new Error('There was an error creating a pull request')
      );

    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      waitForEditorialWorkflowStatus,
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
    expect(waitForEditorialWorkflowStatus).toHaveBeenCalled();
    expect(onWorkflowError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'There was an error creating a pull request',
      })
    );
  });

  it('falls back to a stable branch slug when the media path has no branch-safe characters', async () => {
    const { store, fetchWithToken, startMediaEditorialWorkflow } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
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

    const mediaBranch = startMediaEditorialWorkflow.mock.calls[0][0].branchName;
    expect(mediaBranch).toMatch(/^tina\/media-upload-asset-[a-z0-9]+$/);
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(mediaBranch)}`
    );
  });

  it('keeps media branch names distinct for case-only filename differences', async () => {
    const mediaBranches: string[] = [];
    const startMediaEditorialWorkflow = vi.fn(async ({ branchName }) => {
      mediaBranches.push(branchName);
      return {
        branchName,
        requestId: `media-workflow-${mediaBranches.length}`,
        status: 'queued',
      };
    });

    const { store, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      startMediaEditorialWorkflow,
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

    const { store, fetchWithToken, events, startMediaEditorialWorkflow } =
      buildStore({
        branch: 'main',
        usingProtectedBranch: true,
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

    expect(startMediaEditorialWorkflow.mock.calls[0][0].branchName).toBe(
      selectedBranch
    );
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(selectedBranch)}`
    );
  });

  it('keeps the branch prompt retryable when branch preparation fails', async () => {
    const startMediaEditorialWorkflow = vi
      .fn()
      .mockRejectedValueOnce(
        new Error('There was an error creating a new branch')
      )
      .mockResolvedValueOnce({
        branchName: 'tina/custom-media-change-2',
        requestId: 'media-workflow-2',
        status: 'queued',
      });

    const { store, events, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      startMediaEditorialWorkflow,
      autoConfirmMediaBranchPrompt: false,
    });
    const uploadFailure = vi.fn();
    events.subscribe('media:upload:failure', uploadFailure);

    const confirmEventPromise = new Promise<MediaWorkflowConfirmBranchEvent>(
      (resolve) => {
        events.subscribe('media:workflow:confirm-branch', resolve);
      }
    );

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

    expect(uploadFailure).not.toHaveBeenCalled();
    expect(fetchWithToken).not.toHaveBeenCalled();

    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        signedUrl: 'https://s3.example/x',
        requestId: 'r1',
      })
    );
    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        files: [
          {
            filename: 'a.png',
            src: 'https://assets.tina.io/test-client/__staging/tina/custom-media-change-2/__file/uploads/a.png',
          },
        ],
        directories: [],
        cursor: 0,
      })
    );
    stubS3PutOk();

    await expect(
      event.onConfirm('tina/custom-media-change-2')
    ).resolves.toBeUndefined();
    await expect(persistPromise).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filename: 'a.png',
        }),
      ])
    );
    expect(startMediaEditorialWorkflow).toHaveBeenCalledTimes(2);
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent('tina/custom-media-change-2')}`
    );
  });

  it('continues on the protected branch when the overlay chooses that action', async () => {
    const startMediaEditorialWorkflow = vi.fn();
    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      startMediaEditorialWorkflow,
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

    expect(startMediaEditorialWorkflow).not.toHaveBeenCalled();
    expect(fetchWithToken.mock.calls[0][0]).toContain('?branch=main');
  });

  it('continues on the protected branch when no media workflow overlay is mounted', async () => {
    const startMediaEditorialWorkflow = vi.fn();
    const { store, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      startMediaEditorialWorkflow,
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

    expect(startMediaEditorialWorkflow).not.toHaveBeenCalled();
    expect(fetchWithToken.mock.calls[0][0]).toContain('?branch=main');
  });

  it('resolves persist with [] when the user cancels the branch prompt', async () => {
    const startMediaEditorialWorkflow = vi.fn();
    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      startMediaEditorialWorkflow,
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

    expect(startMediaEditorialWorkflow).not.toHaveBeenCalled();
    expect(fetchWithToken).not.toHaveBeenCalled();
  });

  it('resolves delete cleanly when the user cancels the branch prompt', async () => {
    const startMediaEditorialWorkflow = vi.fn();
    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      startMediaEditorialWorkflow,
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

    expect(startMediaEditorialWorkflow).not.toHaveBeenCalled();
    expect(fetchWithToken).not.toHaveBeenCalled();
  });

  it('does not create a media branch for an empty upload batch', async () => {
    const startMediaEditorialWorkflow = vi.fn();
    const { store, fetchWithToken, authProvider } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      startMediaEditorialWorkflow,
    });

    await expect(store.persist([])).resolves.toEqual([]);

    expect(authProvider.isAuthenticated).not.toHaveBeenCalled();
    expect(startMediaEditorialWorkflow).not.toHaveBeenCalled();
    expect(fetchWithToken).not.toHaveBeenCalled();
  });

  it('skips branch preparation when not on a protected branch (regression)', async () => {
    const startMediaEditorialWorkflow = vi.fn();
    const { store, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: false,
      startMediaEditorialWorkflow,
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

    expect(startMediaEditorialWorkflow).not.toHaveBeenCalled();
  });

  it('intercepts delete on a protected branch', async () => {
    const mediaBranch = 'tina/media-delete-images-a-png';

    const {
      store,
      fetchWithToken,
      startMediaEditorialWorkflow,
      waitForEditorialWorkflowStatus,
    } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
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

    expect(startMediaEditorialWorkflow).toHaveBeenCalledWith({
      branchName: mediaBranch,
      baseBranch: 'main',
      prTitle: 'media delete images a png (PR from TinaCMS)',
      operation: 'delete',
      repoPath: 'images/a.png',
    });
    expect(fetchWithToken.mock.calls[0][0]).toContain(
      `?branch=${encodeURIComponent(mediaBranch)}`
    );
    expect(waitForEditorialWorkflowStatus).toHaveBeenCalledWith(
      'media-workflow-1',
      expect.any(Function)
    );
  });

  it('switches the React branch after the media request succeeds', async () => {
    const eventsLog: string[] = [];

    const startMediaEditorialWorkflow = vi.fn(async ({ branchName }) => {
      eventsLog.push('startMediaEditorialWorkflow');
      return {
        branchName,
        requestId: 'media-workflow-1',
        status: 'queued',
      };
    });
    const waitForEditorialWorkflowStatus = vi.fn(async () => {
      eventsLog.push('waitForEditorialWorkflowStatus');
      return {
        branchName: 'tina/media-upload-uploads-a-png',
        pullRequestUrl: 'https://github.com/x/y/pull/9',
      };
    });

    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      startMediaEditorialWorkflow,
      waitForEditorialWorkflowStatus,
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

    // The canonical list() runs only after the workflow has catalogued the
    // asset in the branch's media index (i.e. after
    // waitForEditorialWorkflowStatus resolves), while the branch override
    // still routes the list there.
    expect(eventsLog).toEqual([
      'startMediaEditorialWorkflow',
      'upload_url',
      'waitForEditorialWorkflowStatus',
      'list',
      'media:workflow:complete',
    ]);
  });

  it('resolves the canonical uploaded entry from the post-commit listing', async () => {
    const { store, fetchWithToken } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
    });

    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        signedUrl: 'https://s3.example/x',
        requestId: 'r1',
      })
    );
    // The list() that runs after the workflow commits returns the asset now
    // present on the branch.
    fetchWithToken.mockResolvedValueOnce(
      makeJsonResponse(200, {
        files: [
          {
            filename: 'a.png',
            src: 'https://assets.example/uploads/a.png',
          },
        ],
        directories: [],
        cursor: 0,
      })
    );
    stubS3PutOk();

    const persistPromise = store.persist([
      {
        directory: 'uploads',
        file: new File(['x'], 'a.png', { type: 'image/png' }),
      },
    ]);
    await vi.advanceTimersByTimeAsync(1100);
    const result = await persistPromise;

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      filename: 'a.png',
      directory: 'uploads',
      type: 'file',
      src: 'https://assets.example/uploads/a.png',
    });
  });

  it('reflects server workflow status updates in the media workflow steps', async () => {
    const waitForEditorialWorkflowStatus = vi.fn(
      async (_requestId, onStatus) => {
        onStatus({ status: 'creating_branch' });
        onStatus({ status: 'indexing' });
        onStatus({ status: 'creating_pr' });
        onStatus({ status: 'complete' });
        return {
          branchName: 'tina/media-upload-uploads-a-png',
          pullRequestUrl: 'https://github.com/x/y/pull/2',
        };
      }
    );

    const { store, fetchWithToken, events, getIndexStatus } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      waitForEditorialWorkflowStatus,
    });
    const steps: number[] = [];
    events.subscribe('media:workflow:step', (event) => {
      steps.push(event.step);
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

    expect(getIndexStatus).not.toHaveBeenCalled();
    expect(waitForEditorialWorkflowStatus).toHaveBeenCalledWith(
      'media-workflow-1',
      expect.any(Function)
    );
    expect(steps).toEqual([1, 2, 3, 4]);
  });

  it('surfaces server workflow failures without breaking the completed upload', async () => {
    const waitForEditorialWorkflowStatus = vi
      .fn()
      .mockRejectedValue(new Error('Indexing failed'));

    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      waitForEditorialWorkflowStatus,
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

    expect(waitForEditorialWorkflowStatus).toHaveBeenCalled();
    expect(onWorkflowComplete).not.toHaveBeenCalled();
    expect(onWorkflowError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Indexing failed'),
      })
    );
  });

  it('surfaces workflow polling timeouts without breaking the completed upload', async () => {
    const waitForEditorialWorkflowStatus = vi
      .fn()
      .mockRejectedValue(new Error('Timed out waiting for workflow status'));

    const { store, fetchWithToken, events } = buildStore({
      branch: 'main',
      usingProtectedBranch: true,
      waitForEditorialWorkflowStatus,
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
    expect(waitForEditorialWorkflowStatus).toHaveBeenCalled();
    expect(onWorkflowComplete).not.toHaveBeenCalled();
    expect(onWorkflowError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          'Timed out waiting for workflow status'
        ),
      })
    );
  });
});
