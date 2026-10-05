import {
  getFinalExtension,
  isDisallowedUploadType,
  looksLikeHtml,
  shouldInspectBody,
} from './upload-type';

describe('getFinalExtension', () => {
  it('returns the lowercased final extension', () => {
    expect(getFinalExtension('photo.PNG')).toBe('png');
    expect(getFinalExtension('archive.tar.gz')).toBe('gz');
  });

  it('returns empty when there is no extension', () => {
    expect(getFinalExtension('README')).toBe('');
    expect(getFinalExtension('trailing.')).toBe('');
    expect(getFinalExtension('')).toBe('');
  });

  it('reads a leading dot as the extension', () => {
    expect(getFinalExtension('.html')).toBe('html');
    expect(getFinalExtension('.gitignore')).toBe('gitignore');
  });

  it('ignores trailing dots and whitespace', () => {
    expect(getFinalExtension('a.html.')).toBe('html');
    expect(getFinalExtension('a.html ')).toBe('html');
    expect(getFinalExtension('a.html. \t')).toBe('html');
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

  it('rejects HTML, script and web-archive types regardless of case', () => {
    for (const name of [
      'a.html',
      'a.HTM',
      'a.xhtml',
      'a.shtml',
      'a.mhtml',
      'a.js',
      'a.mjs',
      'a.cjs',
    ]) {
      expect(isDisallowedUploadType(name)).toBe(true);
    }
  });

  it('rejects the XML document family, not just .xml', () => {
    for (const name of [
      'a.xml',
      'a.xsd',
      'a.rdf',
      'a.rss',
      'a.atom',
      'a.mathml',
      'a.wsdl',
      'a.smil',
      'a.xul',
    ]) {
      expect(isDisallowedUploadType(name)).toBe(true);
    }
  });

  it('checks the final extension only', () => {
    expect(isDisallowedUploadType('a.html.png')).toBe(false);
    expect(isDisallowedUploadType('a.png.html')).toBe(true);
  });

  it('rejects a leading-dot name like .html', () => {
    expect(isDisallowedUploadType('.html')).toBe(true);
    expect(isDisallowedUploadType('.gitignore')).toBe(false);
  });

  it('rejects a trailing dot or space that hides the extension', () => {
    expect(isDisallowedUploadType('a.html.')).toBe(true);
    expect(isDisallowedUploadType('a.html ')).toBe(true);
  });

  it('rejects both readings of a colon name', () => {
    // POSIX: the whole string is the filename, so the real extension is html.
    expect(isDisallowedUploadType('a.png:b.html')).toBe(true);
    // Windows: the part before the colon is the file, a.html.
    expect(isDisallowedUploadType('a.html::$DATA')).toBe(true);
    // A colon in an otherwise safe name is fine.
    expect(isDisallowedUploadType('my:photo.png')).toBe(false);
  });
});

describe('shouldInspectBody', () => {
  it('skips text types a server serves safely', () => {
    for (const name of ['notes.md', 'a.txt', 'data.csv', 'x.json', 'c.yml']) {
      expect(shouldInspectBody(name)).toBe(false);
    }
  });

  it('inspects anything else, including extensions a server may not map', () => {
    for (const name of [
      'favicon.ico',
      'clip.mkv',
      'model.riv',
      'noext',
      'odd.foo',
    ]) {
      expect(shouldInspectBody(name)).toBe(true);
    }
  });
});

describe('looksLikeHtml', () => {
  const buf = (s: string) => Buffer.from(s, 'utf8');

  it('flags content a browser would sniff as HTML', () => {
    for (const s of [
      '<!doctype html><title>x</title>',
      '<html></html>',
      '  \n<script>1</script>',
      '<!-- c -->',
    ]) {
      expect(looksLikeHtml(buf(s))).toBe(true);
    }
  });

  it('flags a tag closed with > as well as a space', () => {
    for (const s of [
      '<a><script>1</script>',
      '<p><script>1</script>',
      '<b>x',
      '<br>',
    ]) {
      expect(looksLikeHtml(buf(s))).toBe(true);
    }
  });

  it('skips a UTF-8 BOM before the signature', () => {
    expect(looksLikeHtml(buf('﻿<html>'))).toBe(true);
  });

  it('does not flag SVG, XML or binary media', () => {
    for (const s of [
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
      '<?xml version="1.0"?><note/>',
      '\x89PNG\r\n',
      '%PDF-1.7',
      '{"a":1}',
    ]) {
      expect(looksLikeHtml(buf(s))).toBe(false);
    }
  });

  it('does not flag a longer word that merely starts with a tag name', () => {
    for (const s of ['<article>hi</article>', '<header>hi</header>']) {
      expect(looksLikeHtml(buf(s))).toBe(false);
    }
  });
});
