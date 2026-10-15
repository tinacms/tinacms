import {
  MEDIA_EXTENSIONS,
  MEDIA_MIME_TYPES,
  resolveMediaAccept,
} from './index';

describe('resolveMediaAccept', () => {
  it('treats undefined as no filter', () => {
    expect(resolveMediaAccept(undefined)).toEqual([]);
  });

  it('resolves a single extension', () => {
    expect(resolveMediaAccept('pdf')).toEqual(['pdf']);
  });

  it('expands a category into its extensions', () => {
    expect(resolveMediaAccept('video')).toEqual(['mp4', 'webm', 'mov']);
  });

  it('dedupes when a category and one of its extensions overlap', () => {
    expect(
      resolveMediaAccept(['png', 'image']).filter((e) => e === 'png')
    ).toHaveLength(1);
  });

  it('drops unknown values instead of disabling the filter', () => {
    expect(resolveMediaAccept(['pgn' as never, 'png'])).toEqual(['png']);
  });

  it('accepts both spellings of jpeg from either one', () => {
    expect(resolveMediaAccept('jpeg').sort()).toEqual(['jpeg', 'jpg']);
    expect(resolveMediaAccept('jpg').sort()).toEqual(['jpeg', 'jpg']);
  });

  it('does not alias an extension that has no alias', () => {
    expect(resolveMediaAccept('png')).toEqual(['png']);
  });
});

describe('MEDIA_MIME_TYPES', () => {
  it('covers every filterable extension', () => {
    for (const ext of MEDIA_EXTENSIONS) {
      expect(MEDIA_MIME_TYPES[ext]).toBeTruthy();
    }
  });
});
