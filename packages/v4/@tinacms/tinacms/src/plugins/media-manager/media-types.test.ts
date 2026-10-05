import { describe, expect, it } from 'vitest';
import {
  previewRename,
  resolveMediaAccept,
  sanitizeFilename,
  typeBadgeOf,
  uploadRejectionOf,
} from './media-types';

describe('sanitizeFilename', () => {
  it('replaces unsafe characters and keeps the extension', () => {
    expect(sanitizeFilename('my #1 photo?.JPG')).toBe('my-1-photo.JPG');
    expect(sanitizeFilename('image-a\u0308.jpg')).toBe('image-\u00e4.jpg');
    expect(sanitizeFilename('***.png')).toBe('file.png');
  });
});

describe('previewRename', () => {
  it('previews the sanitized name and keeps the old extension', () => {
    expect(previewRename('new name.gif', 'old.png')).toMatchObject({
      sanitized: 'new-name.gif.png',
      valid: true,
      preview: 'new-name.gif.png',
    });
  });

  it('rejects an empty, unchanged or stripped name', () => {
    expect(previewRename('  ', 'old.png')).toMatchObject({
      valid: false,
      hint: 'Enter a file name.',
    });
    expect(previewRename('old', 'old.png').valid).toBe(false);
    expect(previewRename('???', 'old.png').hint).toBe(
      "That name isn't valid. Try using letters, numbers or hyphens."
    );
  });
});

describe('resolveMediaAccept', () => {
  it('expands categories and aliases, and drops unknown values', () => {
    expect(resolveMediaAccept(['video', 'jpeg'])).toEqual([
      'mp4',
      'webm',
      'mov',
      'jpeg',
      'jpg',
    ]);
  });
});

describe('uploadRejectionOf', () => {
  it('matches MIME patterns, extensions and the size limit', () => {
    const png = new File(['12345'], 'a.png', { type: 'image/png' });
    expect(uploadRejectionOf(png, ['image/*'], undefined)).toBeNull();
    expect(uploadRejectionOf(png, ['.PNG'], undefined)).toBeNull();
    expect(uploadRejectionOf(png, ['application/pdf'], 4)).toBe(
      'Invalid file type, File too large'
    );
  });

  it('reads the MIME type from the extension when the browser gives none', () => {
    const svg = new File(['x'], 'logo.svg');
    expect(uploadRejectionOf(svg, ['image/svg+xml'], undefined)).toBeNull();
  });
});

describe('typeBadgeOf', () => {
  it('names the extension, and shows jpg as JPEG', () => {
    expect(typeBadgeOf('posts/a.jpg')).toBe('JPEG');
    expect(typeBadgeOf('a.webp')).toBe('WEBP');
    expect(typeBadgeOf('.env')).toBeNull();
    expect(typeBadgeOf('README')).toBeNull();
  });
});
