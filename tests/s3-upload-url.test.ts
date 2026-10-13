import { afterEach, describe, expect, it, vi } from 'vitest';
import { S3Client } from '../packages/next-tinacms-s3/node_modules/@aws-sdk/client-s3';
import {
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

const stubSend = () =>
  vi
    .spyOn(S3Client.prototype, 'send')
    .mockRejectedValue({ $metadata: { httpStatusCode: 404 } } as never);

const requestUploadUrl = async (
  query: Record<string, string | string[]>,
  clientConfig: Record<string, unknown> = {}
) => {
  const handler = createMediaHandler({
    config: { region: 'us-east-1', credentials, ...clientConfig },
    bucket: 'media',
    authorized: async () => true,
  });
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

  it('keeps the four-argument form unchanged', async () => {
    const url = await getUploadUrl('media', 'photo.png', 60, client());
    expect(signedHeaders(url)).toBe('host');
  });
});

describe('createMediaHandler upload URL route', () => {
  it('returns a signed URL and headers for an allowed type', async () => {
    stubSend();
    const res = await requestUploadUrl({
      key: 'photo.png',
      contentType: 'image/png',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.headers).toEqual({ 'Content-Type': 'image/png' });
    expect(signedHeaders(res.body.signedUrl)).toBe('content-type;host');
  });

  it('normalizes the case of the content type', async () => {
    stubSend();
    const res = await requestUploadUrl({
      key: 'photo.png',
      contentType: 'Image/PNG',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.headers).toEqual({ 'Content-Type': 'image/png' });
  });

  it('allows a file with no known type as application/octet-stream', async () => {
    stubSend();
    const res = await requestUploadUrl({
      key: 'data.bin',
      contentType: 'application/octet-stream',
    });
    expect(res.statusCode).toBe(200);
  });

  it('allows an SVG type for an SVG key', async () => {
    stubSend();
    const res = await requestUploadUrl({
      key: 'logo.svg',
      contentType: 'image/svg+xml',
    });
    expect(res.statusCode).toBe(200);
  });

  it.each([
    ['photo.png', ''],
    ['photo.png', '*/*'],
    ['photo.png', 'unknown/unknown'],
    ['photo.png', 'application/unknown'],
    ['data.bin', undefined],
    ['notes', undefined],
    ['file.constructor', undefined],
    ['file.__proto__', undefined],
    ['file.toString', undefined],
    ['photo.png', 'not a type'],
    ['photo.png', 'image/png; charset=utf-8'],
    ['photo.png', 'text/html'],
    ['photo.png', 'Text/HTML'],
    ['photo.png', 'application/xhtml+xml'],
    ['photo.png', 'application/xml'],
    ['photo.png', 'text/xml'],
    ['photo.png', 'application/rss+xml'],
    ['photo.png', 'text/xsl'],
    ['photo.png', 'text/javascript'],
    ['photo.png', 'application/javascript'],
    ['photo.png', 'application/x-javascript'],
    ['photo.png', 'application/ecmascript'],
    ['photo.png', 'message/rfc822'],
    ['photo.png', 'multipart/related'],
    ['photo.png', 'multipart/x-mixed-replace'],
    ['photo.png', 'multipart/mixed'],
    ['photo.png', 'image/svg+xml'],
    ['photo.html', 'image/png'],
  ])('rejects key %j with content type %j', async (key, contentType) => {
    const send = stubSend();
    const query: Record<string, string> = { key };
    if (contentType !== undefined) query.contentType = contentType;
    const res = await requestUploadUrl(query);
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBeLessThan(500);
    expect(res.body.signedUrl).toBeUndefined();
    expect(send).not.toHaveBeenCalled();
  });

  it.each([
    ['photo.png', 'image/png'],
    ['photo.JPG', 'image/jpeg'],
    ['dir/clip.mp4', 'video/mp4'],
    ['doc.pdf', 'application/pdf'],
    ['logo.svg', 'image/svg+xml'],
  ])(
    'uses the key extension when no content type is sent: %s',
    async (key, expected) => {
      stubSend();
      const res = await requestUploadUrl({ key });
      expect(res.statusCode).toBe(200);
      expect(res.body.headers).toEqual({ 'Content-Type': expected });
      expect(signedHeaders(res.body.signedUrl)).toBe('content-type;host');
    }
  );

  it('uses the first value when contentType is repeated', async () => {
    stubSend();
    const allowed = await requestUploadUrl({
      key: 'photo.png',
      contentType: ['image/png', 'text/html'],
    });
    expect(allowed.statusCode).toBe(200);
    expect(allowed.body.headers).toEqual({ 'Content-Type': 'image/png' });

    const rejected = await requestUploadUrl({
      key: 'photo.png',
      contentType: ['text/html', 'image/png'],
    });
    expect(rejected.statusCode).toBe(415);
  });
});

describe('createMediaHandler media URLs', () => {
  it('encodes a plus in the src of a new upload', async () => {
    stubSend();
    const res = await requestUploadUrl({
      key: 'c++.png',
      contentType: 'image/png',
    });
    expect(res.body.src).toBe(
      'https://media.s3.us-east-1.amazonaws.com/c%2B%2B.png'
    );
  });

  it('encodes a plus in the src of a listed file', async () => {
    vi.spyOn(S3Client.prototype, 'send').mockResolvedValue({
      Contents: [{ Key: 'c++.png' }],
    } as never);
    const res = await requestUploadUrl({});
    expect(res.body.items[0].src).toBe(
      'https://media.s3.us-east-1.amazonaws.com/c%2B%2B.png'
    );
  });
});

describe('createMediaHandler upload URL checksum mode', () => {
  it('does not add checksum params to the upload URL by default', async () => {
    stubSend();
    const res = await requestUploadUrl({
      key: 'photo.png',
      contentType: 'image/png',
    });
    const params = new URL(res.body.signedUrl).searchParams;
    expect(params.has('x-amz-checksum-crc32')).toBe(false);
    expect(params.has('x-amz-sdk-checksum-algorithm')).toBe(false);
  });

  it('keeps an operator-set checksum mode', async () => {
    stubSend();
    const res = await requestUploadUrl(
      { key: 'photo.png', contentType: 'image/png' },
      { requestChecksumCalculation: 'WHEN_SUPPORTED' }
    );
    const params = new URL(res.body.signedUrl).searchParams;
    expect(params.has('x-amz-sdk-checksum-algorithm')).toBe(true);
  });
});
