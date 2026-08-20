import { describe, expect, it } from 'vitest';
import { previewRename, sanitizeFilename, splitFilename } from './utils';

describe('sanitizeFilename', () => {
  it('returns simple ASCII names unchanged', () => {
    expect(sanitizeFilename('photo.jpg')).toBe('photo.jpg');
    expect(sanitizeFilename('My-File_01.PNG')).toBe('My-File_01.PNG');
  });

  it('NFC-normalizes decomposed Unicode', () => {
    const decomposed = 'image-a\u0308.jpg';
    const result = sanitizeFilename(decomposed);
    expect(result).toBe('image-ä.jpg');
    expect(result.normalize('NFC')).toBe(result);
    expect(result).not.toContain('\u0308');
  });

  it('strips directory components, keeping only the filename', () => {
    expect(sanitizeFilename('a/b/c.txt')).toBe('c.txt');
    expect(sanitizeFilename('a\\b\\c.txt')).toBe('c.txt');
  });

  it('removes control characters', () => {
    expect(sanitizeFilename('he\u0000llo\u0007.txt')).toBe('hello.txt');
  });

  it('replaces Windows-reserved characters with hyphens', () => {
    expect(sanitizeFilename('a<b>c:d"e|f?g*.txt')).toBe('a-b-c-d-e-f-g.txt');
  });

  it('collapses whitespace runs into a single hyphen', () => {
    expect(sanitizeFilename('hello   world\tagain.txt')).toBe(
      'hello-world-again.txt'
    );
  });

  it('trims leading and trailing dots/hyphens/whitespace from the base', () => {
    expect(sanitizeFilename('   ...weird---.jpg')).toBe('weird.jpg');
  });

  it('keeps the final extension after the last dot', () => {
    expect(sanitizeFilename('archive.tar.gz')).toBe('archive.tar.gz');
  });

  it('falls back to "file" when the base would otherwise be empty', () => {
    expect(sanitizeFilename('....jpg')).toBe('file.jpg');
    expect(sanitizeFilename('')).toBe('file');
  });

  it('handles names without an extension', () => {
    expect(sanitizeFilename('README')).toBe('README');
    expect(sanitizeFilename('  hello world  ')).toBe('hello-world');
  });

  it('NFC-normalizes a decomposed name from a macOS-style upload', () => {
    // macOS exposes filenames in NFD form (e.g. "a" + combining diaeresis).
    const decomposed = 'Aufforstungsfläche.jpg'.normalize('NFD');
    const result = sanitizeFilename(decomposed);
    expect(result).toBe('Aufforstungsfläche.jpg'.normalize('NFC'));
    expect(result.normalize('NFC')).toBe(result);
  });

  it('replaces URL-breaking characters with hyphens', () => {
    expect(sanitizeFilename('a#b%c&d.jpg')).toBe('a-b-c-d.jpg');
  });

  it('collapses runs of generated separators into one hyphen', () => {
    expect(sanitizeFilename('a<>b.jpg')).toBe('a-b.jpg');
  });

  it('caps the base length while preserving the extension', () => {
    const result = sanitizeFilename(`${'a'.repeat(500)}.jpg`);
    expect(result.endsWith('.jpg')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(204);
  });
});

describe('splitFilename', () => {
  it('splits on the final dot', () => {
    expect(splitFilename('a.b.jpg')).toEqual({ base: 'a.b', ext: '.jpg' });
  });

  it('treats a leading dot as part of the base, not an extension', () => {
    expect(splitFilename('.gitignore')).toEqual({
      base: '.gitignore',
      ext: '',
    });
  });

  it('returns an empty extension for a trailing dot', () => {
    expect(splitFilename('photo.')).toEqual({ base: 'photo.', ext: '' });
  });

  it('agrees with sanitizeFilename about what the extension is', () => {
    for (const name of ['a.b.jpg', '.gitignore', 'photo.', 'plain']) {
      const { ext } = splitFilename(name);
      expect(sanitizeFilename(name).endsWith(ext)).toBe(true);
    }
  });
});

describe('previewRename', () => {
  it('keeps the extension when the base contains dots', () => {
    const { sanitized } = previewRename('report.v2', 'report.pdf');
    expect(sanitized).toBe('report.v2.pdf');
  });

  it('never lets the base rewrite or drop the extension', () => {
    expect(previewRename('a/b/c.png', 'photo.jpg').sanitized).toBe('c.png.jpg');
    expect(previewRename('///', 'photo.jpg').sanitized).toBe('file.jpg');
  });

  it('produces a name that sanitizeFilename leaves alone', () => {
    for (const [input, current] of [
      ['my photo', 'a.jpg'],
      ['réport', 'a.PDF'],
      ['a#b&c', 'a.jpg'],
    ]) {
      const { sanitized } = previewRename(input, current);
      expect(sanitizeFilename(sanitized)).toBe(sanitized);
    }
  });

  it('trims surrounding whitespace before validating', () => {
    const { sanitized, valid } = previewRename('  renamed  ', 'photo.jpg');
    expect(sanitized).toBe('renamed.jpg');
    expect(valid).toBe(true);
  });

  it('is invalid and hints when the input is empty', () => {
    const { valid, hint, preview } = previewRename('   ', 'photo.jpg');
    expect(valid).toBe(false);
    expect(hint).toBe('Enter a file name.');
    expect(preview).toBeNull();
  });

  it('is invalid and hints when the input sanitizes away entirely', () => {
    const { valid, hint } = previewRename('///', 'photo.jpg');
    expect(valid).toBe(false);
    expect(hint).toMatch(/isn't valid/);
  });

  it('still allows the literal fallback name to be typed', () => {
    const { valid, hint } = previewRename('file', 'photo.jpg');
    expect(valid).toBe(true);
    expect(hint).toBeNull();
  });

  it('is invalid when the result matches the current name', () => {
    const { valid, hint } = previewRename('photo', 'photo.jpg');
    expect(valid).toBe(false);
    expect(hint).toBeNull();
  });

  it('only previews when the result differs from what was typed', () => {
    expect(previewRename('renamed', 'photo.jpg').preview).toBeNull();
    expect(previewRename('my photo', 'photo.jpg').preview).toBe('my-photo.jpg');
  });
});
