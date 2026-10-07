import { PassThrough } from 'node:stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { S3Client } from '../packages/next-tinacms-dos/node_modules/@aws-sdk/client-s3';
import { createMediaHandler } from '../packages/next-tinacms-dos/src/handlers';

const boundary = 'tina-test-boundary';

afterEach(() => {
  vi.restoreAllMocks();
});

// Sends a real multipart body through multer, so the part's Content-Type is the browser-declared type.
const upload = async (filename: string, declaredType: string) => {
  const send = vi
    .spyOn(S3Client.prototype, 'send')
    .mockResolvedValue({} as never);
  const body = Buffer.from(
    [
      `--${boundary}`,
      'Content-Disposition: form-data; name="directory"',
      '',
      '',
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${filename}"`,
      `Content-Type: ${declaredType}`,
      '',
      '<html><script>alert(1)</script></html>',
      `--${boundary}--`,
      '',
    ].join('\r\n')
  );
  const req = Object.assign(new PassThrough(), {
    method: 'POST',
    query: {},
    headers: {
      'content-type': `multipart/form-data; boundary=${boundary}`,
      'content-length': String(body.length),
    },
  });
  req.end(body);
  const res: Record<string, any> = { statusCode: 200 };
  Object.assign(res, {
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((json: unknown) => {
      res.body = json;
      return res;
    }),
    end: vi.fn(() => res),
  });
  const handler = createMediaHandler({
    config: {
      region: 'us-east-1',
      endpoint: 'https://sgp1.digitaloceanspaces.com',
      credentials: { accessKeyId: 'a', secretAccessKey: 'b' },
    },
    bucket: 'media',
    authorized: async () => true,
  });
  await handler(req as never, res as never);
  return { res, send };
};

describe('next-tinacms-dos upload content type', () => {
  it.each(['text/html', 'image/svg+xml', 'multipart/x-mixed-replace'])(
    'refuses a .png declared as %s',
    async (declaredType) => {
      const { res, send } = await upload('photo.png', declaredType);
      expect(res.statusCode).toBe(415);
      expect(send).not.toHaveBeenCalled();
    }
  );

  it('stores the declared type when it is allowed', async () => {
    const { res, send } = await upload('photo.png', 'image/png');
    expect(res.statusCode).toBe(200);
    expect(send.mock.calls[0][0].input).toMatchObject({
      Key: 'photo.png',
      ContentType: 'image/png',
    });
  });
});
