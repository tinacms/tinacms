import { describe, expect, it } from 'vitest';
import { carryOpenFolders, foldersThrough } from './collection-tree';

const folder = (path: string, documentCount = 1) => ({
  path,
  name: path.split('/').at(-1) as string,
  documentCount,
});

describe('foldersThrough', () => {
  it('lists each folder above and including the folder', () => {
    expect(foldersThrough('a/b')).toEqual(['a', 'a/b']);
    expect(foldersThrough('')).toEqual([]);
  });
});

describe('carryOpenFolders', () => {
  it('moves open state, below it too, to a folder renamed in place', () => {
    const next = carryOpenFolders(
      new Set(['a', 'a/b']),
      [folder('a', 2)],
      [folder('z', 2)]
    );
    expect([...next].sort()).toEqual(['z', 'z/b']);
  });

  it('drops an open folder that vanished without a matching new one', () => {
    const next = carryOpenFolders(
      new Set(['a', 'c']),
      [folder('a'), folder('c')],
      [folder('c')]
    );
    expect([...next]).toEqual(['c']);
  });

  it('drops the open state when the document counts differ', () => {
    const next = carryOpenFolders(
      new Set(['a']),
      [folder('a', 1)],
      [folder('z', 2)]
    );
    expect(next.size).toBe(0);
  });
});
