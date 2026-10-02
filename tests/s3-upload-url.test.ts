import { afterEach, describe, expect, it, vi } from 'vitest';
import { S3Client } from '../packages/next-tinacms-s3/node_modules/@aws-sdk/client-s3';
import {
  UploadTypeError,
  createMediaHandler,
  getUploadUrl,
} from '../packages/next-tinacms-s3/src/handlers';

const credentials = { accessKeyId: 'a', secretAccessKey: 'b' };

const endpoints = [
  { name: 'the default endpoint', config: {} },
  {
    name: 'a path-style endpoint',
    config: { endpoint: 'http://127.0.0.1:9000', forcePathStyle: true },
  },
];

const signedHeaders = (url: string) =>
  new URL(url).searchParams.get('X-Amz-SignedHeaders');

afterEach(() => {
  vi.restoreAllMocks();
});

const notFound = () =>
  vi
    .spyOn(S3Client.prototype, 'send')
    .mockRejectedValue({ $metadata: { httpStatusCode: 404 } } as never);

const requestUploadUrl = async (
  query: Record<string, string | string[]>,
  options?: Parameters<typeof createMediaHandler>[1],
  clientConfig: Record<string, unknown> = {}
) => {
  const handler = createMediaHandler(
    {
      config: { region: 'us-east-1', credentials, ...clientConfig },
      bucket: 'media',
      authorized: async () => true,
    },
    options
  );
  const res: Record<string, any> = { statusCode: 200 };
  Object.assign(res, {
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((body: unknown) => {
      res.body = body;
      return res;
    }),
    end: vi.fn(() => res),
  });
  await handler({ method: 'GET', query } as never, res as never);
  return res;
};

describe.each(endpoints)('getUploadUrl with $name', ({ config }) => {
  const client = () =>
    new S3Client({ region: 'us-east-1', credentials, ...config });

  it('signs the content type into the upload URL', async () => {
    const url = await getUploadUrl('media', 'photo.png', 60, client(), {
      contentType: 'image/png',
    });
    expect(signedHeaders(url)).toBe('content-type;host');
  });

  it('signs the content disposition when one is set', async () => {
    const url = await getUploadUrl('media', 'logo.svg', 60, client(), {
      contentType: 'image/svg+xml',
      accept: '.svg',
    });
    expect(signedHeaders(url)).toBe('content-disposition;content-type;host');
  });

  it('the options form applies the accept rules', async () => {
    await expect(
      getUploadUrl('media', 'photo.png', 60, client(), {
        contentType: 'text/html',
      })
    ).rejects.toBeInstanceOf(UploadTypeError);
  });

  it('keeps the four-argument form unchanged', async () => {
    const url = await getUploadUrl('media', 'photo.png', 60, client());
    expect(signedHeaders(url)).toBe('host');
  });
});

describe('createMediaHandler upload URL checksum mode', () => {
  it('does not add checksum params to the upload URL by default', async () => {
    notFound();
    const res = await requestUploadUrl({
      key: 'photo.png',
      contentType: 'image/png',
    });
    const params = new URL(res.body.signedUrl).searchParams;
    expect(params.has('x-amz-checksum-crc32')).toBe(false);
    expect(params.has('x-amz-sdk-checksum-algorithm')).toBe(false);
  });

  it('keeps an operator-set checksum mode', async () => {
    notFound();
    const res = await requestUploadUrl(
      { key: 'photo.png', contentType: 'image/png' },
      undefined,
      { requestChecksumCalculation: 'WHEN_SUPPORTED' }
    );
    const params = new URL(res.body.signedUrl).searchParams;
    expect(params.has('x-amz-checksum-crc32')).toBe(true);
  });
});

describe('createMediaHandler upload URL request', () => {
  it('returns a signed URL and headers for an allowed type', async () => {
    notFound();
    const res = await requestUploadUrl({
      key: 'photo.png',
      contentType: 'image/png',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.headers).toEqual({ 'Content-Type': 'image/png' });
    expect(signedHeaders(res.body.signedUrl)).toBe('content-type;host');
  });

  it('rejects an upload type outside the allowed list', async () => {
    for (const contentType of [
      'text/html',
      'image/svg+xml',
      'application/xml',
      'Text/HTML',
      'text/html; charset=utf-8',
    ]) {
      const send = notFound();
      const res = await requestUploadUrl({ key: 'file.bin', contentType });
      expect([contentType, res.statusCode]).toEqual([contentType, 400]);
      expect(send).not.toHaveBeenCalled();
      vi.restoreAllMocks();
    }
  });

  it('checks the key extension as well as the declared type', async () => {
    notFound();
    const res = await requestUploadUrl({
      key: 'x.html',
      contentType: 'image/png',
    });
    expect(res.statusCode).toBe(400);
  });

  it('uses the key extension when no content type is sent', async () => {
    notFound();
    const png = await requestUploadUrl({ key: 'photo.png' });
    expect(png.statusCode).toBe(200);
    expect(png.body.headers['Content-Type']).toBe('image/png');
    const svg = await requestUploadUrl({ key: 'x.svg' });
    expect(svg.statusCode).toBe(400);
  });

  it('uses the first value when contentType is repeated', async () => {
    notFound();
    const first = await requestUploadUrl({
      key: 'photo.png',
      contentType: ['image/png', 'text/html'],
    });
    expect(first.statusCode).toBe(200);
    expect(first.body.headers['Content-Type']).toBe('image/png');
    const second = await requestUploadUrl({
      key: 'photo.png',
      contentType: ['text/html', 'image/png'],
    });
    expect(second.statusCode).toBe(400);
  });

  it('honours the accept option', async () => {
    notFound();
    const res = await requestUploadUrl(
      { key: 'logo.svg', contentType: 'image/svg+xml' },
      { accept: '.svg' }
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.headers).toEqual({
      'Content-Type': 'image/svg+xml',
      'Content-Disposition': 'attachment',
    });
    expect(signedHeaders(res.body.signedUrl)).toBe(
      'content-disposition;content-type;host'
    );
  });

  it('checks the type before checking whether the key exists', async () => {
    const send = notFound();
    await requestUploadUrl({ key: 'page.html', contentType: 'text/html' });
    expect(send).toHaveBeenCalledTimes(0);
  });
});
