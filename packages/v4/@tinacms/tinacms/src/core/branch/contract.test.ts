import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { ContentProvider } from '../content/contract';
import { branchSliceOf } from './contract';

const sliceWith = (saveToNewBranch: unknown) =>
  branchSliceOf({
    branch: { list: [], protected: [], switchTo: () => {}, saveToNewBranch },
  });

describe('BranchSource', () => {
  it('needs only list and defaultBranch', () => {
    const branches = {
      list: async () => [],
      defaultBranch: async () => 'main',
    };
    expectTypeOf(branches).toExtend<NonNullable<ContentProvider['branches']>>();
  });
});

describe('branchSliceOf create fields', () => {
  it('leaves create and creating undefined for a provider that cannot create', () => {
    const slice = branchSliceOf({
      branch: { list: [], protected: [], switchTo: () => {} },
    });
    expect(slice?.create).toBeUndefined();
    expect(slice?.creating).toBeUndefined();
    expect(slice?.createResult).toBeUndefined();
  });

  it('keeps a well-formed creating record and drops a malformed one', () => {
    const base = { list: [], protected: [], switchTo: () => {} };
    const creating = {
      name: 'cms/x',
      from: 'main',
      startedOn: undefined,
      phase: 'making',
    };
    expect(branchSliceOf({ branch: { ...base, creating } })?.creating).toEqual(
      creating
    );
    expect(
      branchSliceOf({
        branch: { ...base, creating: { ...creating, phase: 'x' } },
      })?.creating
    ).toBeUndefined();
  });
});

describe('branchSliceOf createResult', () => {
  it('keeps the branch the create started on', () => {
    const base = { list: [], protected: [], switchTo: () => {} };
    const createResult = {
      name: 'cms/x',
      from: 'main',
      startedOn: 'docs',
      outcome: 'ready',
    };
    expect(
      branchSliceOf({ branch: { ...base, createResult } })?.createResult
    ).toEqual(createResult);
  });
});

describe('branchSliceOf', () => {
  it('passes saveToNewBranch through when it is a function', async () => {
    const action = vi.fn().mockResolvedValue({
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    });
    const request = {
      name: 'docs/hello-edits',
      from: 'main',
      collection: 'post',
      path: 'content/posts/hello.mdx',
      value: { title: 'Hello' },
    };
    await expect(
      sliceWith(action)?.saveToNewBranch?.(request)
    ).resolves.toEqual({
      path: 'content/posts/hello.mdx',
      document: { title: 'Hello' },
    });
    expect(action).toHaveBeenCalledWith(request);
  });

  it.each([undefined, 'create', { name: 'x' }])(
    'leaves saveToNewBranch undefined for %o',
    (value) => {
      const slice = sliceWith(value);
      expect(slice).toBeDefined();
      expect(slice?.saveToNewBranch).toBeUndefined();
    }
  );
});
