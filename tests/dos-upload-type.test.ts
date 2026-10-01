import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const upload = vi.hoisted(() => ({
  file: undefined as
    | { path: string; mimetype: string; originalname: string }
    | undefined,
}));

// Mock via the path handlers.ts resolves: pnpm nests multer under the package.
vi.mock('../packages/next-tinacms-dos/node_modules/multer', () => {
  const multer = () => ({
    single: () => (req: any, _res: unknown, cb: (err?: unknown) => void) => {
      req.file = upload.file;
      req.body = { directory: '' };
      cb();
    },
  });
  multer.diskStorage = () => ({});
  return { default: multer };
});

import { S3Client } from '../packages/next-tinacms-dos/node_modules/@aws-sdk/client-s3';
import {
  createMediaHandler,
  type DOSOptions,
} from '../packages/next-tinacms-dos/src/handlers';

const config = {
  config: {
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    region: 'us-east-1',
    credentials: { accessKeyId: 'a', secretAccessKey: 'b' },
  },
  bucket: 'media',
  authorized: async () => true,
};

let tmpDir: string;
let send: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dos-upload-'));
  send = vi.spyOn(S3Client.prototype, 'send').mockResolvedValue({} as never);
  upload.file = undefined;
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const stage = (name: string, mimetype: string) => {
  const filePath = path.join(tmpDir, name);
  fs.writeFileSync(filePath, 'data');
  upload.file = { path: filePath, mimetype, originalname: name };
  return filePath;
};

const post = async (options?: DOSOptions) => {
  const handler = createMediaHandler(config, options);
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
    send: vi.fn(() => res),
    end: vi.fn(() => res),
  });
  await handler({ method: 'POST', body: {} } as never, res as never);
  return res;
};

const putInput = () => send.mock.calls[0][0].input;

describe('next-tinacms-dos upload type', () => {
  it('stores an allowed upload with the normalized content type', async () => {
    stage('photo.png', 'Image/PNG');
    const res = await post();
    expect(res.statusCode).toBe(200);
    expect(send).toHaveBeenCalledTimes(1);
    expect(putInput().ContentType).toBe('image/png');
    expect(putInput().ContentDisposition).toBeUndefined();
  });

  it('rejects an upload type outside the allowed list', async () => {
    stage('page.html', 'text/html');
    const res = await post();
    expect(res.statusCode).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('checks the key extension as well as the declared type', async () => {
    stage('page.html', 'image/png');
    expect((await post()).statusCode).toBe(400);
    stage('photo.png', 'image/svg+xml');
    expect((await post()).statusCode).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('removes the temp file when an upload is rejected', async () => {
    const filePath = stage('page.html', 'text/html');
    await post();
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it('returns 400 when no file is sent', async () => {
    const res = await post();
    expect(res.statusCode).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it('honours the accept option', async () => {
    stage('logo.svg', 'image/svg+xml');
    const res = await post({ accept: '.svg' });
    expect(res.statusCode).toBe(200);
    expect(putInput().ContentType).toBe('image/svg+xml');
    expect(putInput().ContentDisposition).toBe('attachment');
  });

  it('does not repeat the submitted type in the error message', async () => {
    stage('page.bin', 'text/html; charset=utf-8');
    const res = await post();
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      message:
        'This file type is not allowed. To allow it, add it to the accept option of createMediaHandler.',
    });
    expect(JSON.stringify(res.body)).not.toContain('text/html');
  });
});
