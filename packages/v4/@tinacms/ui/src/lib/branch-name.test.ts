import { execFileSync } from 'node:child_process';

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

  it('never suggests a name Git refuses', () => {
    expect(branchNameFromPath('docs/a..b.md')).toBe('docs/a.b-edits');
    expect(branchNameFromPath('docs/a...b.md')).toBe('docs/a.b-edits');
  });

  it('always passes the shared check', () => {
    for (const path of [
      'a/b/ü ö.md',
      'x/.hidden',
      'x/a..b.md',
      'x/--a--.md',
      'x/a.lock.md',
      'x/HEAD.md',
      'x/.git.md',
    ]) {
      expect(
        branchNameError(branchNameFromPath(path), [], true)
      ).toBeUndefined();
    }
  });
});

const gitAccepts = (name: string): boolean => {
  try {
    execFileSync('git', ['check-ref-format', '--branch', name], {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
};

const names = [
  'main',
  'docs/new-page',
  'a.b',
  'a-b',
  'a_b',
  'a.locked',
  'docs/a-.lock-x',
  'docs/HEAD',
  'HEADS',
  'head',
  'a/b/c',
  '1',
  'a..b',
  'docs//a',
  '-a',
  'a/-b',
  'docs/a.lock',
  'a.lock/b',
  'a.lock',
  '.draft',
  'docs/.draft',
  'docs/./a',
  'a/.b/c',
  '.',
  '..',
  '/draft',
  '/docs/x',
  'docs/',
  'docs/a/',
  'a.',
  'docs/a.',
  'HEAD',
  '@{x}',
  'a@{b',
  'a b',
  'a~b',
  'a^b',
  'a:b',
  'a?b',
  'a*b',
  'a[b',
  'a\\b',
  'a\u0001b',
];

// Git accepts these but the helper keeps its narrower letters-numbers-dashes-dots-slashes charset.
const narrowerThanGit = ['@', 'a@b', 'ü'];

describe('branchNameError', () => {
  it.each(names)('agrees with git check-ref-format on %j', (name) => {
    const error = branchNameError(name, [], false);
    expect(error === undefined).toBe(gitAccepts(name));
  });

  it.each(narrowerThanGit)('stays stricter than git on %j', (name) => {
    expect(gitAccepts(name)).toBe(true);
    expect(branchNameError(name, [], false)).toMatch(/^Use letters/);
  });

  it.each(['a..b', 'docs//a', '-a', 'docs/a.lock', '.draft', '/draft', 'HEAD'])(
    'gives the not-allowed wording for %s',
    (name) => {
      expect(branchNameError(name, [], true)).toMatch(/^Use letters/);
    }
  );
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
