import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../packages/next-tinacms-s3/node_modules/tinacms', () => ({
  DEFAULT_MEDIA_UPLOAD_TYPES: 'image/png',
  sanitizeFilename: (name: string) => name,
}));

import { S3MediaStore } from '../packages/next-tinacms-s3/src/s3-media-store';

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as Response;

let putFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  putFetch = vi.fn().mockResolvedValue(jsonResponse(200, {}));
  vi.stubGlobal('fetch', putFetch);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const persist = async (uploadUrlResponse: Response, file: File) => {
  const store = new S3MediaStore();
  const fetchFunction = vi.fn().mockResolvedValue(uploadUrlResponse);
  store.fetchFunction = fetchFunction;
  const settled = store.persist([{ directory: '', file }]).then(
    (value) => ({ value }),
    (error) => ({ error })
  );
  await vi.runAllTimersAsync();
  return { result: await settled, fetchFunction };
};

const png = () => new File(['png'], 'photo.png', { type: 'image/png' });

describe('S3MediaStore.persist', () => {
  it('sends the file type when asking for an upload URL', async () => {
    const { fetchFunction } = await persist(
      jsonResponse(200, { signedUrl: 'https://s3/put', src: 'https://cdn/x' }),
      png()
    );
    const url = new URL(fetchFunction.mock.calls[0][0], 'http://localhost');
    expect(url.searchParams.get('key')).toBe('photo.png');
    expect(url.searchParams.get('contentType')).toBe('image/png');
  });

  it('sends application/octet-stream when the file has no type', async () => {
    const { fetchFunction } = await persist(
      jsonResponse(200, { signedUrl: 'https://s3/put', src: 'https://cdn/x' }),
      new File(['x'], 'data.bin')
    );
    const url = new URL(fetchFunction.mock.calls[0][0], 'http://localhost');
    expect(url.searchParams.get('contentType')).toBe(
      'application/octet-stream'
    );
  });

  it('uses the headers returned with the upload URL', async () => {
    await persist(
      jsonResponse(200, {
        signedUrl: 'https://s3/put',
        src: 'https://cdn/x',
        headers: { 'Content-Type': 'image/x-png' },
      }),
      png()
    );
    expect(putFetch).toHaveBeenCalledWith(
      'https://s3/put',
      expect.objectContaining({ headers: { 'Content-Type': 'image/x-png' } })
    );
  });

  it('falls back to the file type when no headers are returned', async () => {
    await persist(
      jsonResponse(200, { signedUrl: 'https://s3/put', src: 'https://cdn/x' }),
      png()
    );
    expect(putFetch).toHaveBeenCalledWith(
      'https://s3/put',
      expect.objectContaining({ headers: { 'Content-Type': 'image/png' } })
    );
  });

  it('surfaces a rejected type as an error', async () => {
    const { result } = await persist(
      jsonResponse(415, { message: 'Unsupported file type' }),
      png()
    );
    expect((result as { error: Error }).error.message).toBe(
      'Unsupported file type'
    );
    expect(putFetch).not.toHaveBeenCalled();
  });
});
