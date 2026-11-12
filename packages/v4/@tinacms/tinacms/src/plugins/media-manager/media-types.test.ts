import { describe, expect, it } from 'vitest';
import {
  DEFAULT_UPLOAD_RULES,
  MEDIA_EXTENSIONS,
  type UploadRules,
  extensionsForCategory,
  mimeTypeOfPath,
  previewRename,
  resolveMediaAccept,
  sanitizeFilename,
  typeBadgeOf,
  uploadRejectionOf,
  uploadRulesOf,
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
  it('expands a category, and an extension to every extension with its MIME type', () => {
    expect(resolveMediaAccept(['video', 'jpeg'])).toEqual([
      'mp4',
      'webm',
      'mov',
      'jpg',
      'jpeg',
    ]);
  });

  it('accepts a single value or nothing', () => {
    expect(resolveMediaAccept('png')).toEqual(['png']);
    expect(resolveMediaAccept()).toEqual([]);
  });
});

describe('uploadRejectionOf', () => {
  const rules = (mimeTypes: string[], extensions: string[] = []) => ({
    mimeTypes,
    extensions,
  });

  it('accepts a file that matches a MIME type or an extension', () => {
    const png = new File(['12345'], 'a.PNG', { type: 'image/png' });
    expect(uploadRejectionOf(png, rules(['image/*']), undefined)).toBeNull();
    expect(uploadRejectionOf(png, rules([], ['png']), undefined)).toBeNull();
  });

  it('names each reason a file is rejected', () => {
    const png = new File(['12345'], 'a.png', { type: 'image/png' });
    expect(uploadRejectionOf(png, rules(['application/pdf'], ['pdf']), 4)).toBe(
      'Invalid file type, File too large'
    );
  });

  it('reads the MIME type from the extension when the browser gives none', () => {
    const svg = new File(['x'], 'logo.svg');
    expect(
      uploadRejectionOf(svg, rules(['image/svg+xml']), undefined)
    ).toBeNull();
  });
});

describe('the type check when the rules name extensions', () => {
  const file = (name: string, type = '') => new File(['x'], name, { type });
  const image = uploadRulesOf(extensionsForCategory('image'));
  const accepts = (candidate: File, upload: UploadRules) =>
    uploadRejectionOf(candidate, upload, undefined) === null;

  it('judges a known extension by the type of the extension, not the reported type', () => {
    expect(accepts(file('notes.pdf', 'image/png'), image)).toBe(false);
    expect(accepts(file('logo.svg'), image)).toBe(true);
    expect(accepts(file('a.PNG', 'image/png'), image)).toBe(true);
  });

  it.each(['x.constructor', 'x.__proto__', 'x.toString', 'x.hasOwnProperty'])(
    'reads %s as an extension the table does not know',
    (name) => {
      const both = { mimeTypes: ['image/*'], extensions: ['pdf'] };
      expect(mimeTypeOfPath(name)).toBe('');
      expect(accepts(file(name, 'image/png'), both)).toBe(true);
      expect(accepts(file(name, 'application/zip'), both)).toBe(false);
      expect(accepts(file(name), DEFAULT_UPLOAD_RULES)).toBe(false);
      expect(accepts(file(name, 'image/png'), image)).toBe(true);
    }
  );

  it('judges an extension the table does not know by the reported type', () => {
    expect(accepts(file('photo.jfif', 'image/jpeg'), image)).toBe(true);
    expect(accepts(file('tool.exe', 'image/png'), image)).toBe(true);
    expect(accepts(file('tool.exe', 'application/x-msdownload'), image)).toBe(
      false
    );
  });

  it('keeps one MIME type or one extension when both lists are set', () => {
    const both = { mimeTypes: ['image/*'], extensions: ['pdf'] };
    expect(accepts(file('hero.png', 'application/octet-stream'), both)).toBe(
      true
    );
    expect(accepts(file('notes.pdf', 'image/png'), both)).toBe(true);
    expect(accepts(file('clip.mp4', 'image/png'), both)).toBe(false);
  });

  it('refuses every other type for a list of extensions alone', () => {
    const table = { mimeTypes: [], extensions: [...MEDIA_EXTENSIONS] };
    expect(
      accepts(
        file(
          'notes.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ),
        table
      )
    ).toBe(false);
    expect(accepts(file('tool.exe', 'image/png'), table)).toBe(false);
    expect(accepts(file('song.mp3', 'audio/mpeg'), table)).toBe(true);
    expect(accepts(file('hero.jpg', 'image/jpeg'), table)).toBe(true);
  });

  it('answers as before for rules that hold MIME types only', () => {
    expect(accepts(file('clip.ogg', 'video/ogg'), DEFAULT_UPLOAD_RULES)).toBe(
      true
    );
    expect(
      accepts(
        file(
          'notes.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ),
        DEFAULT_UPLOAD_RULES
      )
    ).toBe(true);
    expect(accepts(file('notes.pdf', 'image/png'), DEFAULT_UPLOAD_RULES)).toBe(
      true
    );
    expect(
      accepts(
        file('tool.exe', 'application/x-msdownload'),
        DEFAULT_UPLOAD_RULES
      )
    ).toBe(false);
  });
});

describe('the media type table', () => {
  it('holds the same extensions and categories as before', () => {
    expect([...MEDIA_EXTENSIONS]).toEqual([
      'jpg',
      'jpeg',
      'png',
      'gif',
      'webp',
      'svg',
      'avif',
      'ico',
      'mp4',
      'webm',
      'mov',
      'mp3',
      'wav',
      'ogg',
      'pdf',
      'json',
      'csv',
      'txt',
    ]);
    expect(extensionsForCategory('image')).toHaveLength(8);
    expect(extensionsForCategory('video')).toEqual(['mp4', 'webm', 'mov']);
    expect(extensionsForCategory('audio')).toEqual(['mp3', 'wav', 'ogg']);
    expect(extensionsForCategory('document')).toEqual([
      'pdf',
      'json',
      'csv',
      'txt',
    ]);
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
