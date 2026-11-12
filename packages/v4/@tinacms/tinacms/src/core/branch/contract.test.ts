import { describe, expect, it, vi } from 'vitest';
import { branchSliceOf } from './contract';

const sliceWith = (saveToNewBranch: unknown) =>
  branchSliceOf({
    branch: { list: [], protected: [], switchTo: () => {}, saveToNewBranch },
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
