import { describe, it, expect } from 'vitest';

// The media-key helper is duplicated byte-for-byte across the first-party
// media adapters. These shared vectors are the single source of truth for its
// behaviour and guard against the copies drifting apart.
import {
  resolveKey as resolveKeyS3,
  MediaKeyError as MediaKeyErrorS3,
} from '../packages/next-tinacms-s3/src/media-key';
import {
  resolveKey as resolveKeyDos,
  MediaKeyError as MediaKeyErrorDos,
} from '../packages/next-tinacms-dos/src/media-key';
import {
  resolveKey as resolveKeyAzure,
  MediaKeyError as MediaKeyErrorAzure,
} from '../packages/next-tinacms-azure/src/media-key';
import {
  resolveKey as resolveKeyCloudinary,
  MediaKeyError as MediaKeyErrorCloudinary,
} from '../packages/next-tinacms-cloudinary/src/media-key';

// Each adapter ships its own byte-identical copy of the helper, so each has
// its own MediaKeyError class. Assert against the matching class per adapter.
const adapters = [
  ['next-tinacms-s3', resolveKeyS3, MediaKeyErrorS3],
  ['next-tinacms-dos', resolveKeyDos, MediaKeyErrorDos],
  ['next-tinacms-azure', resolveKeyAzure, MediaKeyErrorAzure],
  ['next-tinacms-cloudinary', resolveKeyCloudinary, MediaKeyErrorCloudinary],
] as const;

// [mediaRoot, rawKey, expected]
const allowed: [string, string, string][] = [
  // Exhibit A: an arbitrary bucket-root key is contained within mediaRoot.
  ['media', 'index.html', 'media/index.html'],
  // Exhibit B: a foreign/cross-tenant key cannot escape mediaRoot.
  ['media', 'backups/db.sql', 'media/backups/db.sql'],
  [
    'media',
    'tenant-victim/posts/announcement.mdx',
    'media/tenant-victim/posts/announcement.mdx',
  ],
  // Delete path sends the full object key — must not be prefixed twice.
  ['media', 'media/photo.png', 'media/photo.png'],
  // A prefix-lookalike directory is not mistaken for the root.
  ['media', 'media-evil/x.png', 'media/media-evil/x.png'],
  // Ordinary relative upload key.
  ['media', 'photos/cat.png', 'media/photos/cat.png'],
  // Inner ".." that does not escape is collapsed, not rejected.
  ['media', 'a/../b.png', 'media/b.png'],
  // mediaRoot with surrounding slashes is normalised.
  ['/media/', 'photos/cat.png', 'media/photos/cat.png'],
  // No boundary configured (azure/cloudinary today): normalised, returned as-is.
  ['', 'foo/bar.png', 'foo/bar.png'],
];

// [mediaRoot, rawKey]
const rejected: [string, unknown][] = [
  ['media', ''],
  ['media', '   '],
  ['media', '../outside.txt'], // traversal
  ['media', '/etc/passwd'], // absolute (POSIX)
  ['media', 'C:/windows/win.ini'], // absolute (Windows drive)
  ['media', '%2e%2e/secret'], // percent-encoded traversal
  ['media', '..%2foutside'], // mixed-encoded traversal
  ['media', 'dir\\..\\x'], // backslash separator
  ['media', 'a/../../escape'], // traversal that climbs past the root
  ['', '../x'], // traversal even without a boundary
  ['', '/abs'], // absolute even without a boundary
  ['media', undefined], // non-string
  ['media', null], // non-string
];

describe.each(adapters)('%s — resolveKey allows and scopes', (_name, resolveKey) => {
  it.each(allowed)('resolveKey(%j, %j) === %j', (root, raw, expected) => {
    expect(resolveKey(root, raw)).toBe(expected);
  });
});

describe.each(adapters)(
  '%s — resolveKey rejects',
  (_name, resolveKey, MediaKeyError) => {
    it.each(rejected)('resolveKey(%j, %j) throws MediaKeyError', (root, raw) => {
      expect(() => resolveKey(root, raw as any)).toThrow(MediaKeyError);
    });
  }
);

describe('the four adapter copies behave identically (anti-drift)', () => {
  const allInputs: [string, unknown][] = [
    ...allowed.map(([root, raw]) => [root, raw] as [string, unknown]),
    ...rejected,
  ];

  it.each(allInputs)('same outcome across all adapters for (%j, %j)', (root, raw) => {
    const outcomes = adapters.map(([, fn]) => {
      try {
        return `ok:${fn(root, raw as any)}`;
      } catch (e) {
        return `err:${(e as Error).name}`;
      }
    });
    // Every copy must agree with the first.
    for (const outcome of outcomes) {
      expect(outcome).toBe(outcomes[0]);
    }
  });
});
