import type { Media, MediaUploadOptions } from './media';
import { TinaMediaStore } from './media-store.default';

type FetchWithTokenMock = ReturnType<typeof vi.fn>;

const makeJsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  }) as any;

const buildStore = ({
  branch = 'main',
  isLocalMode = false,
  authenticated = true,
}: {
  branch?: string | undefined;
  isLocalMode?: boolean;
  authenticated?: boolean;
} = {}) => {
  const fetchWithToken: FetchWithTokenMock = vi.fn();
  const authProvider = {
    fetchWithToken,
    isAuthenticated: vi.fn().mockResolvedValue(authenticated),
  };
  const api = {
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
  };
  const cms = { api: { tina: api } } as any;
  const store = new TinaMediaStore(cms);
  return { store, fetchWithToken, api };
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
