import { describe, expect, it } from 'vitest';

// The Cloudinary listMedia handler builds a Search API expression of the form
// folder="<directory>". Cloudinary treats a quoted term literally except for
// `"` and `*`, which stay special and must be backslash-escaped, so a caller
// supplied directory has to be escaped before it is interpolated.
// See https://cloudinary.com/documentation/search_expressions
import { escapeSearchValue } from '../packages/next-tinacms-cloudinary/src/search-expression';

describe('escapeSearchValue', () => {
  it('leaves an ordinary directory untouched', () => {
    expect(escapeSearchValue('photos/2026')).toBe('photos/2026');
  });

  it('escapes a double quote so it cannot close the quoted term', () => {
    expect(escapeSearchValue('x" OR public_id="')).toBe(
      'x\\" OR public_id=\\"'
    );
  });

  it('escapes an asterisk so it is matched literally', () => {
    expect(escapeSearchValue('holiday*')).toBe('holiday\\*');
  });

  it('escapes a backslash so it cannot escape the escaping', () => {
    expect(escapeSearchValue('a\\b')).toBe('a\\\\b');
  });

  it('escapes a backslash before a quote rather than consuming it', () => {
    expect(escapeSearchValue('a\\"b')).toBe('a\\\\\\"b');
  });

  it('escapes every occurrence, not just the first', () => {
    expect(escapeSearchValue('a"b"c')).toBe('a\\"b\\"c');
  });

  it('returns an empty string unchanged', () => {
    expect(escapeSearchValue('')).toBe('');
  });

  it('produces a folder term that stays a single quoted value', () => {
    const directory = 'uploads" OR public_id="*';
    expect(`folder="${escapeSearchValue(directory)}"`).toBe(
      'folder="uploads\\" OR public_id=\\"\\*"'
    );
  });
});
