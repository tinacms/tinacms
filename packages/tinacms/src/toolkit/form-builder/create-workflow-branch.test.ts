import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWorkflowBranch } from './create-workflow-branch';

const branchName = 'tina/rules/example';
const collision = () =>
  Object.assign(new Error('Already exists'), {
    errorCode: 'BRANCH_EXISTS',
  });

const setup = (targetBranchExists = false) => ({
  branchName,
  targetBranchExists,
  branchExists: vi.fn(async (_name: string) => false),
  create: vi.fn(async (name: string) => ({ branchName: name })),
});

describe('createWorkflowBranch', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps an available default and avoids another existence check', async () => {
    const options = setup();
    expect(await createWorkflowBranch(options)).toEqual({ branchName });
    expect(options.branchExists).not.toHaveBeenCalled();
    expect(options.create).toHaveBeenCalledExactlyOnceWith(branchName);
  });

  it('adds a random word when the default exists', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const options = setup(true);
    expect(await createWorkflowBranch(options)).toEqual({
      branchName: `${branchName}-alpha`,
    });
    expect(options.create).toHaveBeenCalledExactlyOnceWith(
      `${branchName}-alpha`
    );
  });

  it('tries a different word without stacking suffixes when a word is taken', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const options = setup(true);
    options.branchExists.mockResolvedValueOnce(true);
    await createWorkflowBranch(options);
    expect(options.branchExists.mock.calls.map(([name]) => name)).toEqual([
      `${branchName}-alpha`,
      `${branchName}-birch`,
    ]);
    expect(options.create).toHaveBeenCalledExactlyOnceWith(
      `${branchName}-birch`
    );
  });

  it('retries a creation collision after a successful existence check', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const options = setup(true);
    options.create.mockRejectedValueOnce(collision());
    expect(await createWorkflowBranch(options)).toEqual({
      branchName: `${branchName}-birch`,
    });
    expect(options.create).toHaveBeenCalledTimes(2);
  });

  it('retries when the default is created concurrently', async () => {
    const options = setup();
    options.create.mockRejectedValueOnce(collision());
    await createWorkflowBranch(options);
    expect(options.create).toHaveBeenCalledTimes(2);
    expect(options.create.mock.calls[1][0]).toMatch(
      /^tina\/rules\/example-[a-z]+$/
    );
  });

  it.each([
    'INDEXING_FAILED',
    'BRANCH_HIERARCHY_CONFLICT',
    'WORKFLOW_STATUS_FAILED',
  ])('does not retry %s failures', async (errorCode) => {
    const options = setup();
    const error = Object.assign(new Error('Failed'), { errorCode });
    options.create.mockRejectedValue(error);
    await expect(createWorkflowBranch(options)).rejects.toBe(error);
    expect(options.create).toHaveBeenCalledTimes(1);
  });

  it('does not retry an ambiguous error mentioning an existing branch', async () => {
    const options = setup();
    const error = new Error('Branch already exists');
    options.create.mockRejectedValue(error);
    await expect(createWorkflowBranch(options)).rejects.toBe(error);
    expect(options.create).toHaveBeenCalledTimes(1);
  });

  it('falls back to eight UUID characters after five word collisions', async () => {
    const options = setup(true);
    options.branchExists
      .mockResolvedValue(true)
      .mockImplementation(async (name) => !/-[0-9a-f]{8}$/.test(name));
    const result = await createWorkflowBranch(options);
    expect(result.branchName).toMatch(/^tina\/rules\/example-[0-9a-f]{8}$/);
    expect(options.branchExists).toHaveBeenCalledTimes(6);
    expect(options.create).toHaveBeenCalledTimes(1);
  });

  it('stops after the shortened UUID also collides during creation', async () => {
    const options = setup();
    options.create.mockRejectedValue(collision());
    await expect(createWorkflowBranch(options)).rejects.toMatchObject({
      errorCode: 'BRANCH_EXISTS',
    });
    expect(options.create).toHaveBeenCalledTimes(7);
    expect(new Set(options.create.mock.calls.map(([name]) => name)).size).toBe(
      7
    );
  });

  it('stops when every candidate already exists', async () => {
    const options = setup(true);
    options.branchExists.mockResolvedValue(true);
    await expect(createWorkflowBranch(options)).rejects.toMatchObject({
      errorCode: 'BRANCH_EXISTS',
    });
    expect(options.branchExists).toHaveBeenCalledTimes(6);
    expect(options.create).not.toHaveBeenCalled();
  });

  it('does not start after cancellation', async () => {
    const options = setup();
    const controller = new AbortController();
    controller.abort();
    await expect(
      createWorkflowBranch({ ...options, signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(options.create).not.toHaveBeenCalled();
  });

  it('does not create a branch if cancelled during an existence check', async () => {
    const options = setup(true);
    const controller = new AbortController();
    options.branchExists.mockImplementation(async () => {
      controller.abort();
      return false;
    });
    await expect(
      createWorkflowBranch({ ...options, signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(options.create).not.toHaveBeenCalled();
  });
});
