import { describe, expect, it } from 'vitest';
import { isDisallowedUploadType, sanitizeFilename } from './utils';

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

describe('isDisallowedUploadType', () => {
  it('allows common media types, including SVG', () => {
    for (const name of [
      'photo.png',
      'clip.mp4',
      'doc.pdf',
      'model.riv',
      'logo.svg',
      'logo.svgz',
    ]) {
      expect(isDisallowedUploadType(name)).toBe(false);
    }
  });

  it('rejects active document types regardless of case', () => {
    for (const name of ['a.html', 'a.HTM', 'a.js', 'a.mjs', 'a.xml', 'a.xhtml']) {
      expect(isDisallowedUploadType(name)).toBe(true);
    }
  });

  it('checks the final extension only', () => {
    expect(isDisallowedUploadType('a.html.png')).toBe(false);
    expect(isDisallowedUploadType('a.png.html')).toBe(true);
  });
});
