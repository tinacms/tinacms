import { describe, it, expect } from 'vitest';

// The content type check is duplicated byte-for-byte in the two adapters that
// store a browser-declared type. These vectors guard against the copies drifting.
import { resolveUploadContentType as s3 } from '../packages/next-tinacms-s3/src/upload-content-type';
import { resolveUploadContentType as dos } from '../packages/next-tinacms-dos/src/upload-content-type';

const copies = [
  ['next-tinacms-s3', s3],
  ['next-tinacms-dos', dos],
] as const;

// [key, sent type, stored type or null for a 415] — one table both copies must agree on.
const vectors: [string, string | undefined, string | null][] = [
  ['photo.png', 'image/png', 'image/png'],
  ['photo.png', 'Image/PNG', 'image/png'],
  ['data.bin', 'application/octet-stream', 'application/octet-stream'],
  ['logo.svg', 'image/svg+xml', 'image/svg+xml'],
  ['photo.png', undefined, 'image/png'],
  ['data.bin', undefined, null],
  ['photo.png', 'image/svg+xml', null],
  ['photo.png', 'text/html', null],
  ['photo.png', 'application/xhtml+xml', null],
  ['photo.png', 'text/xml', null],
  ['photo.png', 'text/javascript', null],
  ['photo.png', 'message/rfc822', null],
  ['photo.png', 'multipart/x-mixed-replace', null],
  ['photo.png', 'multipart/related', null],
  ['photo.png', 'unknown/unknown', null],
  ['photo.png', 'image/png; charset=utf-8', null],
];

describe.each(copies)('%s resolveUploadContentType', (_name, resolve) => {
  it.each(vectors)('%s sent as %j -> %j', (key, sent, expected) => {
    expect(resolve(key, sent)).toBe(expected);
  });
});

describe('the two copies behave identically (anti-drift)', () => {
  it.each(vectors)('same outcome for %s sent as %j', (key, sent) => {
    const outcomes = copies.map(([, fn]) => fn(key, sent));
    expect(new Set(outcomes).size).toBe(1);
  });
});
