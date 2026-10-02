import { MEDIA_MIME_TYPES } from './types/index';
import {
  checkUploadType,
  DEFAULT_MEDIA_ACCEPT,
  isUploadNameAllowed,
  MEDIA_EXTENSION_MIME_TYPES,
  uploadExtensions,
} from './upload-type';

const EXACT_ENTRY_EXTENSIONS = [
  'html',
  'htm',
  'shtml',
  'xhtml',
  'xht',
  'svg',
  'svgz',
  'xml',
  'xsl',
  'xslt',
  'js',
  'mjs',
  'cjs',
  'css',
  'swf',
  'mht',
  'mhtml',
  'hta',
  'mpd',
  'rdf',
  'atom',
  'rss',
  'opml',
];

const EXACT_ENTRY_TYPES = [
  'text/html',
  'application/xhtml+xml',
  'image/svg+xml',
  'text/xml',
  'application/xml',
  'text/xsl',
  'text/css',
  'application/dash+xml',
  'application/rss+xml',
  'application/atom+xml',
  'application/rdf+xml',
  'application/x-shockwave-flash',
  'application/hta',
  'multipart/related',
  'multipart/x-mixed-replace',
  'application/ecmascript',
  'application/javascript',
  'application/x-ecmascript',
  'application/x-javascript',
  'text/ecmascript',
  'text/javascript',
  'text/javascript1.0',
  'text/javascript1.1',
  'text/javascript1.2',
  'text/javascript1.3',
  'text/javascript1.4',
  'text/javascript1.5',
  'text/jscript',
  'text/livescript',
  'text/x-ecmascript',
  'text/x-javascript',
];

const WILDCARD_ACCEPTS = ['*', '*/*', 'image/*', 'text/*', 'application/*'];

const DEFAULT_EXTENSIONS = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'avif',
  'ico',
  'tiff',
  'bmp',
  'heic',
  'pdf',
  'json',
  'txt',
  'csv',
  'md',
  'vtt',
  'mp3',
  'wav',
  'ogg',
  'mp4',
  'webm',
  'mov',
];

describe('checkUploadType', () => {
  it('admits the types in the default list', () => {
    for (const ext of DEFAULT_EXTENSIONS) {
      expect(checkUploadType({ filename: `file.${ext}` })).toMatchObject({
        allowed: true,
        restricted: false,
        contentType: MEDIA_EXTENSION_MIME_TYPES[ext],
      });
    }
    expect(
      checkUploadType({
        filename: 'favicon.ico',
        contentType: 'image/vnd.microsoft.icon',
      })
    ).toEqual({
      allowed: true,
      restricted: false,
      contentType: 'image/vnd.microsoft.icon',
    });
  });

  it('needs an exact entry for some types', () => {
    const table: [
      string,
      string | undefined,
      string,
      boolean,
      string | undefined,
    ][] = [
      ['logo.svg', undefined, '.svg', true, undefined],
      ['logo.svg', undefined, 'image/svg+xml', true, undefined],
      ['logo.svg', 'image/svg+xml', '.svg', true, undefined],
      ['logo.svg', 'text/html', '.svg', false, 'svg'],
      ['x.png', 'text/html', '.png', false, 'png'],
      ['x.html', 'image/png', 'image/png', false, 'html'],
      ['x.html.png', 'image/png', 'image/png', false, 'html'],
      ['x.svg', undefined, 'image/*', false, 'svg'],
      ['x.html', undefined, 'text/*, *', false, 'html'],
      ['x.html', undefined, '.html', true, undefined],
    ];
    for (const [filename, contentType, accept, allowed, extension] of table) {
      const result = checkUploadType({ filename, contentType }, accept);
      if (allowed) {
        expect(result).toMatchObject({ allowed: true, restricted: true });
      } else {
        expect(result).toEqual({ allowed: false, reason: 'type', extension });
      }
    }
  });

  it('does not let a wildcard admit a type that needs an exact entry', () => {
    for (const accept of [undefined, ...WILDCARD_ACCEPTS]) {
      for (const ext of EXACT_ENTRY_EXTENSIONS) {
        expect(checkUploadType({ filename: `x.${ext}` }, accept).allowed).toBe(
          false
        );
      }
      for (const contentType of EXACT_ENTRY_TYPES) {
        expect(
          checkUploadType({ filename: 'x.bin', contentType }, accept).allowed
        ).toBe(false);
      }
    }
  });

  it('checks a declared type against the extension', () => {
    expect(
      checkUploadType(
        { filename: 'logo.svg', contentType: 'text/html' },
        '.svg, text/html'
      )
    ).toMatchObject({ allowed: true, restricted: true });
    expect(
      checkUploadType({ filename: 'logo.svg', contentType: 'text/xml' }, '.svg')
    ).toEqual({ allowed: false, reason: 'type', extension: 'svg' });
    expect(
      checkUploadType(
        { filename: 'photo.png', contentType: 'image/svg+xml' },
        'image/png'
      )
    ).toEqual({ allowed: false, reason: 'type', extension: 'png' });
  });

  it('rejects file names the filesystem would change', () => {
    const names = [
      '',
      '.',
      '..',
      'a/b.png',
      'a\\b.png',
      '.html',
      '.htaccess',
      'x.html.',
      'x.html ',
      'x.png ',
      'x.png:s.html',
      'x\u0000.png',
      'x\u001f.png',
      'x\u007f.png',
    ];
    for (const filename of names) {
      expect(isUploadNameAllowed(filename)).toBe(false);
      expect(checkUploadType({ filename }, '*')).toEqual({
        allowed: false,
        reason: 'name',
        extension: '',
      });
    }
    expect(isUploadNameAllowed('photo.png')).toBe(true);
    expect(isUploadNameAllowed('LICENSE')).toBe(true);
  });

  it('normalizes the declared content type', () => {
    for (const contentType of [
      'Text/HTML',
      'text/html; charset=utf-8',
      '  text/html  ',
    ]) {
      expect(
        checkUploadType({ filename: 'x.bin', contentType }, '*').allowed
      ).toBe(false);
      expect(
        checkUploadType({ filename: 'x.bin', contentType }, 'text/html')
      ).toEqual({ allowed: true, restricted: true, contentType: 'text/html' });
    }
    expect(
      checkUploadType({
        filename: 'photo.png',
        contentType: 'Image/PNG; foo=bar',
      })
    ).toEqual({ allowed: true, restricted: false, contentType: 'image/png' });
  });

  it('rejects a malformed content type', () => {
    const malformed = [
      'text/html,',
      'text/html x',
      'text/',
      '/html',
      'texthtml',
      'text/html/x',
      'te xt/plain',
      ';charset=utf-8',
      '*/*',
      'image/*',
      'unknown/unknown',
      'application/unknown',
    ];
    for (const contentType of malformed) {
      expect(checkUploadType({ filename: 'x.txt', contentType }, '*')).toEqual({
        allowed: false,
        reason: 'type',
        extension: 'txt',
      });
    }
  });

  it('uses the extension when no content type is declared', () => {
    expect(checkUploadType({ filename: 'photo.png' })).toEqual({
      allowed: true,
      restricted: false,
      contentType: 'image/png',
    });
    expect(checkUploadType({ filename: 'blob', contentType: '  ' })).toEqual({
      allowed: true,
      restricted: false,
      contentType: 'application/octet-stream',
    });
  });

  it('parses accept like the media manager', () => {
    expect(
      checkUploadType({ filename: 'a.pdf' }, ' Image/PNG , APPLICATION/PDF ')
        .allowed
    ).toBe(true);
    expect(
      checkUploadType({ filename: 'a.pdf' }, ['image/png', 'application/pdf'])
        .allowed
    ).toBe(true);
    expect(
      checkUploadType({ filename: 'a.pdf' }, ['image/png, application/pdf'])
        .allowed
    ).toBe(true);
    expect(checkUploadType({ filename: 'a.pdf' }, 'image/png').allowed).toBe(
      false
    );
    expect(checkUploadType({ filename: 'a.PDF' }, '.pdf').allowed).toBe(true);
    expect(checkUploadType({ filename: 'a.pdf' }, '*').allowed).toBe(true);
    expect(checkUploadType({ filename: 'a.pdf' }, 'image, .png').allowed).toBe(
      false
    );
  });

  it('falls back to the default list when accept has no valid entry', () => {
    for (const accept of ['', '  ', [], ['image'], ', ,']) {
      expect(checkUploadType({ filename: 'a.png' }, accept).allowed).toBe(true);
      expect(checkUploadType({ filename: 'a.html' }, accept).allowed).toBe(
        false
      );
      expect(checkUploadType({ filename: 'a.zip' }, accept).allowed).toBe(true);
    }
  });

  it('admits unknown extensions through application/octet-stream', () => {
    for (const filename of [
      'archive.zip',
      'font.woff2',
      'LICENSE',
      'file.constructor',
      'file.__proto__',
      'file.hasOwnProperty',
    ]) {
      expect(checkUploadType({ filename })).toEqual({
        allowed: true,
        restricted: false,
        contentType: 'application/octet-stream',
      });
      expect(checkUploadType({ filename }, 'image/png').allowed).toBe(false);
    }
  });

  it('has a MIME type for every listed extension', () => {
    for (const ext of [
      ...DEFAULT_EXTENSIONS,
      ...EXACT_ENTRY_EXTENSIONS,
      ...Object.keys(MEDIA_MIME_TYPES),
    ]) {
      expect(MEDIA_EXTENSION_MIME_TYPES[ext]).toMatch(
        /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/
      );
    }
    const tableTypes = new Set(Object.values(MEDIA_EXTENSION_MIME_TYPES));
    for (const entry of DEFAULT_MEDIA_ACCEPT) {
      if (
        entry.endsWith('/*') ||
        entry === 'application/octet-stream' ||
        entry === 'image/vnd.microsoft.icon'
      ) {
        continue;
      }
      expect(tableTypes).toContain(entry);
    }
  });
});

describe('uploadExtensions', () => {
  it('reads every extension in a file name', () => {
    expect(uploadExtensions('photo.PNG')).toEqual(['png']);
    expect(uploadExtensions('x.html.png')).toEqual(['html', 'png']);
    expect(uploadExtensions('LICENSE')).toEqual([]);
    for (const filename of ['x.html.png', 'x.HTML.jpg']) {
      expect(checkUploadType({ filename })).toEqual({
        allowed: false,
        reason: 'type',
        extension: 'html',
      });
    }
  });

  it('reads the extension from the literal file name', () => {
    expect(uploadExtensions('x.png#.html')).toEqual(['png#', 'html']);
    expect(uploadExtensions('x.png?.html')).toEqual(['png?', 'html']);
    for (const filename of ['x.png#.html', 'x.png?.html']) {
      expect(checkUploadType({ filename })).toEqual({
        allowed: false,
        reason: 'type',
        extension: 'html',
      });
    }
  });
});
