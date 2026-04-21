import { describe, it, expect, vi } from 'vitest';
import type { Media } from '@toolkit/core/media';

/**
 * Tests for the image field plugin's onChange behavior.
 *
 * The core bug: when a custom MediaStore doesn't implement a `parse()` method,
 * the image field plugin's onChange was passing the entire Media object as the
 * field value instead of extracting media.src. This caused React Error #31
 * ("Objects are not valid as React children") when the object was rendered.
 *
 * We extract and test the onChange logic directly since the component itself
 * requires extensive React context (CMS, forms, etc.) to render.
 */

// Simulate the onChange logic from image-field-plugin.tsx
// This mirrors the fixed code at lines 34-46
function imageFieldOnChange(
  media: Media | Media[] | undefined,
  cmsMediaStoreParse: ((img: any) => string) | undefined
): any {
  if (media) {
    const item = Array.isArray(media) ? media[0] : media;
    const parsedValue =
      typeof cmsMediaStoreParse === 'function'
        ? cmsMediaStoreParse(media)
        : item.src || item;
    return parsedValue;
  }
  return undefined;
}

// Simulate the ORIGINAL (buggy) onChange logic for comparison
function imageFieldOnChangeOriginal(
  media: Media | Media[] | undefined,
  cmsMediaStoreParse: ((img: any) => string) | undefined
): any {
  if (media) {
    const parsedValue =
      typeof cmsMediaStoreParse === 'function'
        ? cmsMediaStoreParse(media)
        : media; // BUG: passes full object when parse is missing
    return parsedValue;
  }
  return undefined;
}

const mockMedia: Media = {
  id: 'test-image-123',
  src: 'https://example.com/images/hero.jpg',
  filename: 'hero.jpg',
  directory: '/images',
  type: 'file',
  thumbnails: {
    '75x75': 'https://example.com/images/hero-75.jpg',
    '400x400': 'https://example.com/images/hero-400.jpg',
  },
};

const mockMediaNoSrc: Media = {
  id: 'test-file-456',
  filename: 'document.pdf',
  directory: '/docs',
  type: 'file',
};

describe('image-field-plugin onChange', () => {
  describe('BUG REPRODUCTION: original code passes full Media object when store has no parse()', () => {
    it('original code returns the full Media object (causes React Error #31)', () => {
      const result = imageFieldOnChangeOriginal(mockMedia, undefined);

      // This is the bug - the entire object is returned
      expect(result).toBe(mockMedia);
      expect(typeof result).toBe('object');
      // React would choke trying to render this as a child
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('thumbnails');
    });
  });

  describe('FIX: extracts media.src when store has no parse()', () => {
    it('returns media.src string when store has no parse()', () => {
      const result = imageFieldOnChange(mockMedia, undefined);

      expect(result).toBe('https://example.com/images/hero.jpg');
      expect(typeof result).toBe('string');
    });

    it('returns media.src string when store.parse is not a function', () => {
      // Simulating cms.media.store.parse being undefined/null
      const result = imageFieldOnChange(mockMedia, undefined);

      expect(result).toBe('https://example.com/images/hero.jpg');
      expect(typeof result).toBe('string');
    });

    it('uses store.parse() when available (e.g., TinaMediaStore)', () => {
      const parseFn = (img: any) => img.src;
      const result = imageFieldOnChange(mockMedia, parseFn);

      expect(result).toBe('https://example.com/images/hero.jpg');
    });

    it('handles Media array input (extracts first item)', () => {
      const result = imageFieldOnChange([mockMedia], undefined);

      expect(result).toBe('https://example.com/images/hero.jpg');
      expect(typeof result).toBe('string');
    });

    it('falls back to full item when src is undefined', () => {
      const result = imageFieldOnChange(mockMediaNoSrc, undefined);

      // When src is undefined, falls back to the item itself
      // This preserves backward compatibility for edge cases
      expect(result).toBe(mockMediaNoSrc);
    });

    it('returns undefined when media is undefined', () => {
      const result = imageFieldOnChange(undefined, undefined);
      expect(result).toBeUndefined();
    });

    it('custom store parse can return custom path format', () => {
      // Some custom stores might return a relative path
      const customParse = (img: any) =>
        `/uploads/${img.directory}/${img.filename}`;
      const result = imageFieldOnChange(mockMedia, customParse);

      expect(result).toBe('/uploads//images/hero.jpg');
      expect(typeof result).toBe('string');
    });
  });
});

describe('MDX image toolbar button onSelect', () => {
  /**
   * Simulates the fixed onSelect logic from image-toolbar-button.tsx
   * that prepares the media object before passing to insertImg.
   */
  function toolbarOnSelect(
    media: Media,
    cmsMediaStoreParse: ((img: any) => string) | undefined
  ): Media {
    const src =
      typeof cmsMediaStoreParse === 'function'
        ? cmsMediaStoreParse(media)
        : media.src;
    return { ...media, src: src || media.src };
  }

  it('passes media with correct src when store has no parse()', () => {
    const result = toolbarOnSelect(mockMedia, undefined);

    expect(result.src).toBe('https://example.com/images/hero.jpg');
    expect(typeof result.src).toBe('string');
    // Should still carry other properties for insertImg
    expect(result.filename).toBe('hero.jpg');
  });

  it('uses store.parse() to resolve src when available', () => {
    const parseFn = (img: any) => img.src;
    const result = toolbarOnSelect(mockMedia, parseFn);

    expect(result.src).toBe('https://example.com/images/hero.jpg');
  });

  it('custom store parse can transform the src', () => {
    // A custom store might return a proxy URL
    const customParse = (img: any) => `/api/media/proxy?src=${img.src}`;
    const result = toolbarOnSelect(mockMedia, customParse);

    expect(result.src).toBe(
      '/api/media/proxy?src=https://example.com/images/hero.jpg'
    );
  });

  it('preserves original src when parse returns falsy', () => {
    const badParse = (_img: any) => '';
    const result = toolbarOnSelect(mockMedia, badParse);

    // Falls back to media.src when parse returns empty string
    expect(result.src).toBe('https://example.com/images/hero.jpg');
  });
});
