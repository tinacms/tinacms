import { describe, expect, it } from 'vitest';
import { formatDefaultBranchName, normalizeBranchName } from './branch-name';

describe('formatDefaultBranchName', () => {
  it('strips the content/ prefix and file extension', () => {
    expect(formatDefaultBranchName('content/articles/foo.mdx', 'update')).toBe(
      'articles/foo'
    );
  });

  it('collapses the doubled slash from a trailing-slash collection path', () => {
    expect(formatDefaultBranchName('content/articles//foo.mdx', 'create')).toBe(
      'articles/foo'
    );
  });

  it('keeps paths without the content/ prefix', () => {
    expect(formatDefaultBranchName('pages/about.md', 'update')).toBe(
      'pages/about'
    );
  });

  it('adds the deletion indicator after normalisation', () => {
    expect(formatDefaultBranchName('content/articles//foo.mdx', 'delete')).toBe(
      '❌-articles/foo'
    );
  });
});

describe('normalizeBranchName', () => {
  it('collapses repeated and leading/trailing slashes', () => {
    expect(normalizeBranchName('//foo//bar//')).toBe('foo/bar');
  });

  it('returns an empty string for slash-only input', () => {
    expect(normalizeBranchName('///')).toBe('');
  });

  it('replaces whitespace with hyphens', () => {
    expect(normalizeBranchName('my branch name')).toBe('my-branch-name');
    expect(normalizeBranchName('a\tb\nc')).toBe('a-b-c');
  });

  it('replaces Git-forbidden punctuation with hyphens', () => {
    expect(normalizeBranchName('a~b^c:d?e*f[g')).toBe('a-b-c-d-e-f-g');
    expect(normalizeBranchName('a\\b')).toBe('a-b');
  });

  it('collapses runs of forbidden characters into a single hyphen', () => {
    expect(normalizeBranchName('a ~ b')).toBe('a-b');
  });

  it('replaces the @{ sequence but keeps a plain @', () => {
    expect(normalizeBranchName('a@{b')).toBe('a-b');
    expect(normalizeBranchName('v@2')).toBe('v@2');
  });

  it('collapses dot runs so no component contains ..', () => {
    expect(normalizeBranchName('a..b')).toBe('a.b');
    expect(normalizeBranchName('a...b')).toBe('a.b');
  });

  it('strips leading dots from each component', () => {
    expect(normalizeBranchName('.hidden/.foo')).toBe('hidden/foo');
  });

  it('strips trailing dots and .lock suffixes', () => {
    expect(normalizeBranchName('foo.')).toBe('foo');
    expect(normalizeBranchName('foo.lock')).toBe('foo');
    expect(normalizeBranchName('foo.lock.lock')).toBe('foo');
    expect(normalizeBranchName('foo.block')).toBe('foo.block');
  });

  it('drops components that normalise to empty', () => {
    expect(normalizeBranchName('a/./b')).toBe('a/b');
  });

  it('leaves already-valid names untouched', () => {
    expect(normalizeBranchName('articles/foo-bar_baz.v2')).toBe(
      'articles/foo-bar_baz.v2'
    );
  });
});
