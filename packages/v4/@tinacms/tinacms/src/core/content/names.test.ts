import { describe, expect, it } from 'vitest';
import {
  folderPartsInside,
  isValidFileName,
  isValidName,
  trimSlashes,
} from './names';

describe('isValidName', () => {
  it.each([
    'what?',
    'a:b',
    'a*b',
    'a"b',
    'a<b',
    'a>b',
    'a|b',
    'CON',
    'con',
    'Nul',
    'aux.md',
    'COM1',
    'lpt9.tar',
    'COM²',
    'com1.tar.md',
    '',
    '  ',
    '.hidden',
    'trailing ',
    'trailing.',
    'a/b',
    'a\\b',
    '..',
  ])('refuses %j', (name) => {
    expect(isValidName(name)).toBe(false);
  });

  it.each(['console', 'com10', 'com0', 'nullable', 'hello-world', 'Ünï'])(
    'accepts %j',
    (name) => {
      expect(isValidName(name)).toBe(true);
    }
  );

  it('refuses a name of more than 255 bytes', () => {
    expect(isValidName('a'.repeat(256))).toBe(false);
    expect(isValidName('é'.repeat(128))).toBe(false);
  });

  it('checks the stem of a file name', () => {
    expect(isValidFileName('con.md', '.md')).toBe(false);
    expect(isValidFileName('hello.md', '.md')).toBe(true);
  });
});

describe('path parts', () => {
  it('trims slashes without a pattern', () => {
    expect(trimSlashes('//a/b//')).toBe('a/b');
    expect(trimSlashes('///')).toBe('');
  });

  it('keeps every folder name when the collection directory is empty', () => {
    expect(folderPartsInside('sub/b.md', '')).toEqual(['sub']);
    expect(folderPartsInside('content/posts/a/b.md', 'content/posts')).toEqual([
      'a',
    ]);
  });
});
