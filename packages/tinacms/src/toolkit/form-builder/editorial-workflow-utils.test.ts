import { describe, expect, it, vi } from 'vitest';
import { checkBranchGuard } from './editorial-workflow-utils';

describe('checkBranchGuard', () => {
  it('resolves base + target existence from a single branchesExist call', async () => {
    const branchesExist = vi.fn().mockResolvedValue({
      main: true,
      'tina/new-branch': false,
    });

    const result = await checkBranchGuard(
      { branchesExist },
      'main',
      'tina/new-branch',
      'test'
    );

    expect(result).toEqual({
      baseBranchExists: true,
      targetBranchExists: false,
    });
    expect(branchesExist).toHaveBeenCalledTimes(1);
    expect(branchesExist).toHaveBeenCalledWith(['main', 'tina/new-branch'], {
      signal: undefined,
    });
  });

  it('fails open when the lookup throws: base treated as existing, target as absent', async () => {
    const branchesExist = vi.fn().mockRejectedValue(new Error('network down'));

    const result = await checkBranchGuard(
      { branchesExist },
      'main',
      'tina/new-branch',
      'test'
    );

    expect(result).toEqual({
      baseBranchExists: true,
      targetBranchExists: false,
    });
  });

  it('fails open when the request is aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const branchesExist = vi
      .fn()
      .mockRejectedValue(new DOMException('aborted', 'AbortError'));

    const result = await checkBranchGuard(
      { branchesExist },
      'main',
      'tina/new-branch',
      'test',
      controller.signal
    );

    expect(result).toEqual({
      baseBranchExists: true,
      targetBranchExists: false,
    });
  });
});
