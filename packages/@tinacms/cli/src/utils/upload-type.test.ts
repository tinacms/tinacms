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
  it('allows common media types', () => {
    for (const name of ['photo.png', 'clip.mp4', 'doc.pdf', 'model.riv']) {
      expect(isDisallowedUploadType(name)).toBe(false);
    }
  });

  it('rejects active document types regardless of case', () => {
    for (const name of ['a.html', 'a.HTM', 'a.svg', 'a.svgz', 'a.js', 'a.xml']) {
      expect(isDisallowedUploadType(name)).toBe(true);
    }
  });

  it('checks the final extension only', () => {
    expect(isDisallowedUploadType('a.html.png')).toBe(false);
    expect(isDisallowedUploadType('a.png.html')).toBe(true);
  });
});
