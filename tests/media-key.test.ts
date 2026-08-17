import { describe, it, expect } from 'vitest';

// The media-key helper is duplicated byte-for-byte across the first-party
// media adapters. These shared vectors are the single source of truth for its
// behaviour and guard against the copies drifting apart.
import {
  resolveKey as resolveKeyS3,
  resolveDirectory as resolveDirectoryS3,
  MediaKeyError as MediaKeyErrorS3,
} from '../packages/next-tinacms-s3/src/media-key';
import {
  resolveKey as resolveKeyDos,
  resolveDirectory as resolveDirectoryDos,
  MediaKeyError as MediaKeyErrorDos,
} from '../packages/next-tinacms-dos/src/media-key';
import {
  resolveKey as resolveKeyAzure,
  resolveDirectory as resolveDirectoryAzure,
  MediaKeyError as MediaKeyErrorAzure,
} from '../packages/next-tinacms-azure/src/media-key';
import {
  resolveKey as resolveKeyCloudinary,
  resolveDirectory as resolveDirectoryCloudinary,
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

const directoryAdapters = [
  ['next-tinacms-s3', resolveDirectoryS3, MediaKeyErrorS3],
  ['next-tinacms-dos', resolveDirectoryDos, MediaKeyErrorDos],
  ['next-tinacms-azure', resolveDirectoryAzure, MediaKeyErrorAzure],
  [
    'next-tinacms-cloudinary',
    resolveDirectoryCloudinary,
    MediaKeyErrorCloudinary,
  ],
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

// Multipart filenames are literal, not percent-encoded: resolveKey is called
// with { decode: false } on the upload paths. A literal "%" must be preserved
// (not decoded or rejected); traversal / absolute / backslash / empty are still
// blocked.
const allowedNoDecode: [string, string, string][] = [
  ['', '100%.png', '100%.png'],
  ['', 'report%41.png', 'report%41.png'], // NOT rewritten to reportA.png
  ['', 'my%2Ffile.png', 'my%2Ffile.png'], // %2F NOT turned into a path separator
  ['media', 'cat.png', 'media/cat.png'],
  // Delete paths now pass { decode: false } because the framework already
  // decoded the route param once. A key with a literal "%" must resolve to
  // itself (not throw URIError / get re-decoded) so the object can be deleted.
  ['media', '100%off.png', 'media/100%off.png'],
  ['media', 'a%2Fb.png', 'media/a%2Fb.png'], // %2F stays literal, no extra segment
];
const rejectedNoDecode: [string, string][] = [
  ['', '../evil.png'],
  ['', '/abs.png'],
  ['', 'a\\b.png'],
  ['', ''],
];

describe.each(adapters)(
  '%s — resolveKey({ decode: false }) for multipart filenames',
  (_name, resolveKey, MediaKeyError) => {
    it.each(allowedNoDecode)(
      'resolveKey(%j, %j, {decode:false}) === %j',
      (root, raw, expected) => {
        expect(resolveKey(root, raw, { decode: false })).toBe(expected);
      }
    );
    it.each(rejectedNoDecode)(
      'resolveKey(%j, %j, {decode:false}) throws MediaKeyError',
      (root, raw) => {
        expect(() => resolveKey(root, raw, { decode: false })).toThrow(
          MediaKeyError
        );
      }
    );
  }
);

// resolveDirectory bounds the listMedia prefix. directory flows into
// path.join(mediaRoot, prefix), which would otherwise collapse ".." and list
// objects outside mediaRoot (GHSA-xq98-p84m-r882). Empty / root is allowed;
// upward traversal, absolute paths, backslash and NUL are rejected.
const directoryAllowed: [string, string][] = [
  ['', ''], // root
  ['   ', ''], // blank => root
  ['photos', 'photos/'],
  ['photos/', 'photos/'], // trailing slash normalised
  ['/photos', 'photos/'], // leading slash stripped, not treated as absolute root
  ['photos/2026', 'photos/2026/'],
  ['a/../b', 'b/'], // inner ".." that does not escape is collapsed
  ['.', ''], // current dir => root
];
const directoryRejected: string[] = [
  '..', // walk toward bucket root
  '../uploads', // the reported vector
  '/../escape', // leading slash stripped, then traversal
  'a/../../escape', // climbs past root
  'dir\\..\\x', // backslash separator
  'with\0nul', // NUL byte
];

describe.each(directoryAdapters)(
  '%s — resolveDirectory bounds the listing prefix',
  (_name, resolveDirectory, MediaKeyError) => {
    it.each(directoryAllowed)(
      'resolveDirectory(%j) === %j',
      (raw, expected) => {
        expect(resolveDirectory(raw)).toBe(expected);
      }
    );
    it.each([undefined, null] as unknown[])(
      'resolveDirectory(%j) === "" (no directory)',
      (raw) => {
        expect(resolveDirectory(raw)).toBe('');
      }
    );
    it.each(directoryRejected)(
      'resolveDirectory(%j) throws MediaKeyError',
      (raw) => {
        expect(() => resolveDirectory(raw)).toThrow(MediaKeyError);
      }
    );
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
