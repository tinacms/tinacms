import { describe, expect, it } from 'vitest';

import { branchNameError, branchNameFromPath, freeName } from './branch-name';

describe('branchNameFromPath', () => {
  it('turns the file stem into a docs branch name', () => {
    expect(branchNameFromPath('content/posts/My Page (draft).mdx')).toBe(
      'docs/My-Page-draft-edits'
    );
  });

  it('falls back to "document" when the stem is empty', () => {
    expect(branchNameFromPath('content/posts/.mdx')).toBe(
      'docs/document-edits'
    );
    expect(branchNameFromPath('content/posts/(( ))')).toBe(
      'docs/document-edits'
    );
  });

  it('always passes the shared check', () => {
    for (const path of ['a/b/ü ö.md', 'x/.hidden', 'x/a..b.md', 'x/--a--.md']) {
      expect(
        branchNameError(branchNameFromPath(path), [], true)
      ).toBeUndefined();
    }
  });
});

describe('freeName', () => {
  it('keeps a free base and skips each taken suffix in turn', () => {
    expect(freeName('x', [])).toBe('x');
    expect(freeName('x', ['x'])).toBe('x-2');
    expect(freeName('x', ['x', 'x-2', 'x-3'])).toBe('x-4');
  });

  it('never returns the bare base when suffixed', () => {
    expect(freeName('x', [], { suffixed: true })).toBe('x-2');
    expect(freeName('x', ['x-2'], { suffixed: true })).toBe('x-3');
  });
});
