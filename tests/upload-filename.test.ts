import { describe, it, expect } from 'vitest';

// Shared vectors for the duplicated safeUploadName copies: guard against the
// copies drifting apart and against a directory component slipping through.
import { safeUploadName as dos } from '../packages/next-tinacms-dos/src/upload-filename';
import { safeUploadName as cloudinary } from '../packages/next-tinacms-cloudinary/src/upload-filename';

const adapters = [
  ['next-tinacms-dos', dos],
  ['next-tinacms-cloudinary', cloudinary],
] as const;

// [input, expected] — a crafted upload filename must reduce to a bare basename
// so path.join(os.tmpdir(), name) cannot escape the temp directory.
const vectors: [string, string][] = [
  ['photo.png', 'photo.png'],
  ['../../etc/cron.d/evil', 'evil'], // POSIX traversal
  ['..\\..\\windows\\evil', 'evil'], // Windows-style traversal
  ['/etc/passwd', 'passwd'], // absolute POSIX
  ['a/b/c.png', 'c.png'], // nested path
  ['..', ''], // pure traversal collapses (matches busboy)
  ['.', ''], // current dir collapses
  ['', ''], // empty stays empty
  ['100%.png', '100%.png'], // literal percent preserved
  ['my%2Ffile.png', 'my%2Ffile.png'], // %2F stays literal, not a separator
];

describe.each(adapters)(
  '%s — safeUploadName strips directory components',
  (_name, safeUploadName) => {
    it.each(vectors)('safeUploadName(%j) === %j', (input, expected) => {
      expect(safeUploadName(input)).toBe(expected);
    });
    it.each(vectors)(
      'safeUploadName(%j) contains no path separator',
      (input) => {
        expect(safeUploadName(input)).not.toMatch(/[/\\]/);
      }
    );
  }
);

describe('both adapter copies behave identically (anti-drift)', () => {
  it.each(vectors)('same outcome for %j', (input) => {
    expect(dos(input)).toBe(cloudinary(input));
  });
});
