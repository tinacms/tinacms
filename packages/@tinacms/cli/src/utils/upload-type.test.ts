import { getFinalExtension, isDisallowedUploadType } from './upload-type';

describe('getFinalExtension', () => {
  it('returns the lowercased final extension', () => {
    expect(getFinalExtension('photo.PNG')).toBe('png');
    expect(getFinalExtension('archive.tar.gz')).toBe('gz');
  });

  it('returns empty when there is no extension', () => {
    expect(getFinalExtension('README')).toBe('');
    expect(getFinalExtension('.gitignore')).toBe('');
    expect(getFinalExtension('trailing.')).toBe('');
    expect(getFinalExtension('')).toBe('');
  });

  it('ignores directory segments', () => {
    expect(getFinalExtension('a/b/c.jpg')).toBe('jpg');
    expect(getFinalExtension('a\\b\\c.jpg')).toBe('jpg');
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
