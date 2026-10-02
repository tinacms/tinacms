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

const persist = async (uploadUrlResponse: Response) => {
  const store = new S3MediaStore();
  const fetchFunction = vi.fn().mockResolvedValue(uploadUrlResponse);
  store.fetchFunction = fetchFunction;
  const file = new File(['png'], 'photo.png', { type: 'image/png' });
  const promise = store.persist([{ directory: '', file }]);
  const settled = promise.then(
    (value) => ({ value }),
    (error) => ({ error })
  );
  await vi.runAllTimersAsync();
  return { result: await settled, fetchFunction };
};

describe('S3MediaStore persist', () => {
  it('sends the file type when asking for an upload URL', async () => {
    const { fetchFunction } = await persist(
      jsonResponse(200, { signedUrl: 'https://s3/put', src: 'https://cdn/p' })
    );
    expect(fetchFunction.mock.calls[0][0]).toContain('contentType=image%2Fpng');
  });

  it('uses the headers returned with the upload URL', async () => {
    const headers = {
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment',
    };
    await persist(
      jsonResponse(200, {
        signedUrl: 'https://s3/put',
        src: 'https://cdn/p',
        headers,
      })
    );
    expect(putFetch.mock.calls[0][1].headers).toEqual(headers);
  });

  it('falls back to the file type when no headers are returned', async () => {
    await persist(
      jsonResponse(200, { signedUrl: 'https://s3/put', src: 'https://cdn/p' })
    );
    expect(putFetch.mock.calls[0][1].headers).toEqual({
      'Content-Type': 'image/png',
    });
  });

  it('surfaces a rejected type as an error', async () => {
    const { result } = await persist(
      jsonResponse(400, { message: 'This file type is not allowed.' })
    );
    expect('error' in result && (result.error as Error).message).toBe(
      'This file type is not allowed.'
    );
    expect(putFetch).not.toHaveBeenCalled();
  });
});
