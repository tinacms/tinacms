import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BRANCH_WORDS, createWorkflowBranch } from './create-workflow-branch';

const branchName = 'tina/rules/example';
const collision = () =>
  Object.assign(new Error('Already exists'), {
    errorCode: 'BRANCH_EXISTS',
  });
const tierNames = (tier = 1) =>
  BRANCH_WORDS.map(
    (word) => `${branchName}-${word}${tier === 1 ? '' : `-${tier}`}`
  );
const setup = (targetBranchExists = false) => ({
  branchName,
  targetBranchExists,
  historyScope: 'test-app',
  listBranchNames: vi.fn(async (): Promise<string[]> => []),
  create: vi.fn(async (name: string) => ({ branchName: name })),
});

describe('createWorkflowBranch', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });
  afterEach(() => vi.restoreAllMocks());

  it('keeps an available default', async () => {
    const options = setup();
    expect(await createWorkflowBranch(options)).toEqual({ branchName });
    expect(options.create).toHaveBeenCalledExactlyOnceWith(branchName);
  });

  it('selects randomly from unused themed names', async () => {
    const options = setup(true);
    options.listBranchNames.mockResolvedValue(tierNames().slice(0, 3));
    expect(await createWorkflowBranch(options)).toEqual({
      branchName: `${branchName}-alpaca`,
    });
    expect(options.listBranchNames).toHaveBeenCalledTimes(1);
  });

  it('uses Math.random to choose among the remaining names', async () => {
    vi.mocked(Math.random).mockReturnValue(0.999);
    expect(await createWorkflowBranch(setup(true))).toEqual({
      branchName: `${branchName}-${BRANCH_WORDS.at(-1)}`,
    });
  });

  it('uses the last available name before advancing tiers', async () => {
    const options = setup(true);
    options.listBranchNames.mockResolvedValue(
      tierNames().filter((name) => name !== `${branchName}-alpaca`)
    );
    expect(await createWorkflowBranch(options)).toEqual({
      branchName: `${branchName}-alpaca`,
    });
  });

  it('advances to tier two only after the first tier is exhausted', async () => {
    const options = setup(true);
    options.listBranchNames.mockResolvedValue(tierNames());
    expect(await createWorkflowBranch(options)).toEqual({
      branchName: `${branchName}-tina-2`,
    });
  });

  it('advances past fully occupied numbered tiers', async () => {
    const options = setup(true);
    options.listBranchNames.mockResolvedValue([
      ...tierNames(),
      ...tierNames(2),
    ]);
    expect(await createWorkflowBranch(options)).toEqual({
      branchName: `${branchName}-tina-3`,
    });
  });

  it('keeps a deleted generated name retired across separate saves', async () => {
    await createWorkflowBranch(setup(true));
    const next = setup();
    expect(await createWorkflowBranch(next)).toEqual({
      branchName: `${branchName}-llama`,
    });
  });

  it('remembers observed existing names even after they are deleted', async () => {
    const options = setup(true);
    options.listBranchNames.mockResolvedValue(tierNames());
    await createWorkflowBranch(options);
    expect(await createWorkflowBranch(setup())).toEqual({
      branchName: `${branchName}-llama-2`,
    });
  });

  it('keeps history isolated between apps', async () => {
    await createWorkflowBranch(setup());
    expect(
      await createWorkflowBranch({ ...setup(), historyScope: 'other-app' })
    ).toEqual({ branchName });
  });

  it('remembers the canonical branch name returned by the server', async () => {
    const options = setup();
    options.create.mockResolvedValueOnce({ branchName: `${branchName}-tina` });
    await createWorkflowBranch(options);
    expect(await createWorkflowBranch(setup())).toEqual({
      branchName: `${branchName}-llama`,
    });
  });

  it('retries concurrent creation collisions using a different available name', async () => {
    const options = setup(true);
    options.create.mockRejectedValueOnce(collision());
    expect(await createWorkflowBranch(options)).toEqual({
      branchName: `${branchName}-llama`,
    });
    expect(options.create.mock.calls).toEqual([
      [`${branchName}-tina`],
      [`${branchName}-llama`],
    ]);
  });

  it('retries within a numbered tier after a concurrent creation collision', async () => {
    const options = setup(true);
    options.listBranchNames.mockResolvedValue(tierNames());
    options.create.mockRejectedValueOnce(collision());
    expect(await createWorkflowBranch(options)).toEqual({
      branchName: `${branchName}-llama-2`,
    });
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
    expect(await createWorkflowBranch(setup())).toEqual({
      branchName: `${branchName}-tina`,
    });
  });

  it('does not retry ambiguous failures', async () => {
    const options = setup();
    const error = new Error('Branch already exists');
    options.create.mockRejectedValue(error);
    await expect(createWorkflowBranch(options)).rejects.toBe(error);
    expect(options.create).toHaveBeenCalledTimes(1);
  });

  it('bounds retries when every creation reports a collision', async () => {
    const options = setup();
    options.create.mockRejectedValue(collision());
    await expect(createWorkflowBranch(options)).rejects.toMatchObject({
      errorCode: 'BRANCH_EXISTS',
    });
    expect(options.create).toHaveBeenCalledTimes(20);
    expect(new Set(options.create.mock.calls.map(([name]) => name)).size).toBe(
      20
    );
  });

  it('does not create anything if the branch list cannot be loaded', async () => {
    const options = setup();
    const error = new Error('Unavailable');
    options.listBranchNames.mockRejectedValue(error);
    await expect(createWorkflowBranch(options)).rejects.toBe(error);
    expect(options.create).not.toHaveBeenCalled();
  });

  it('does not create anything if browser history cannot be persisted', async () => {
    const options = setup();
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });
    await expect(createWorkflowBranch(options)).rejects.toMatchObject({
      errorCode: 'VALIDATION_FAILED',
    });
    expect(options.create).not.toHaveBeenCalled();
  });

  it('does not start after cancellation', async () => {
    const options = setup();
    const controller = new AbortController();
    controller.abort();
    await expect(
      createWorkflowBranch({ ...options, signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(options.listBranchNames).not.toHaveBeenCalled();
    expect(options.create).not.toHaveBeenCalled();
  });

  it('does not reserve or create a branch if cancelled while loading names', async () => {
    const options = setup(true);
    const controller = new AbortController();
    options.listBranchNames.mockImplementation(async () => {
      controller.abort();
      return [];
    });
    await expect(
      createWorkflowBranch({ ...options, signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(options.create).not.toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
  });
});
