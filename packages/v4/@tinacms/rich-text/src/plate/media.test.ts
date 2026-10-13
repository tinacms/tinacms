import { describe, expect, it } from 'vitest';
import { isImage } from './media';

/**
 * `isImage` decides whether an upload becomes an inline image or a download
 * link. A wrong answer either hides a picture behind a filename or points an
 * `img` tag at a file the browser cannot draw.
 */
describe('isImage', () => {
  it.each(['gif', 'jpg', 'jpeg', 'tiff', 'png', 'svg', 'webp', 'avif'])(
    'accepts a .%s file',
    (extension) => {
      expect(isImage(`/uploads/photo.${extension}`)).toBe(true);
    }
  );

  it('ignores the case of the extension', () => {
    expect(isImage('/uploads/PHOTO.PNG')).toBe(true);
  });

  /**
   * An image CDN appends a query string. Matching only at the end of the
   * string would send every resized image down the download-link path.
   */
  it('accepts an image that carries a query string', () => {
    expect(isImage('https://cdn.test/photo.png?w=800&h=600')).toBe(true);
  });

  it.each(['pdf', 'zip', 'mp4', 'docx', 'txt'])(
    'rejects a .%s file',
    (extension) => {
      expect(isImage(`/uploads/report.${extension}`)).toBe(false);
    }
  );

  it('rejects a file with no extension', () => {
    expect(isImage('/uploads/report')).toBe(false);
  });

  /**
   * The extension must end the path. A directory whose own name ends in an
   * image extension says nothing about the file inside it.
   */
  it('rejects an image extension that belongs to a parent directory', () => {
    expect(isImage('/uploads/logo.png/report.pdf')).toBe(false);
  });

  it('rejects a file whose real extension follows an image extension', () => {
    expect(isImage('/uploads/photo.png.pdf')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isImage('')).toBe(false);
  });
});
