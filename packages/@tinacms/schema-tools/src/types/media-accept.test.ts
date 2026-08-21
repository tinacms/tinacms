import { resolveMediaAccept } from './index';

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
});
