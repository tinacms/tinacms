import type { TinaCMS } from '@toolkit/tina-cms';
import { describe, expect, it, vi } from 'vitest';
import { EDITORIAL_WORKFLOW_STATUS } from './editorial-workflow-constants';
import { runEditorialWorkflow } from './run-editorial-workflow';

const makeCms = (
  executeEditorialWorkflow: (args: {
    onStatusUpdate: (status: { status: string }) => void;
  }) => Promise<unknown>
) =>
  ({
    api: {
      tina: {
        executeEditorialWorkflow,
        schema: {
          getCollectionByFullPath: () => ({
            name: 'post',
            path: 'content/posts',
          }),
          transformPayload: (_name: string, values: unknown) => values,
        },
      },
    },
  }) as unknown as TinaCMS;

const baseOptions = {
  branchName: 'tina/hello-updates',
  baseBranch: 'main',
  path: 'content/posts/hello.md',
  values: { title: 'Hello' },
  crudType: 'update',
  targetBranchExists: false,
};

describe('runEditorialWorkflow', () => {
  it('fails before starting when the target branch exists', async () => {
    const onStart = vi.fn();
    const execute = vi.fn();

    const outcome = await runEditorialWorkflow(makeCms(execute), {
      ...baseOptions,
      targetBranchExists: true,
      onStart,
      onStep: vi.fn(),
    });

    expect(outcome).toMatchObject({ status: 'failed', started: false });
    expect(onStart).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  it('maps server statuses to the three steps', async () => {
    const onStep = vi.fn();
    const cms = makeCms(async ({ onStatusUpdate }) => {
      for (const status of [
        EDITORIAL_WORKFLOW_STATUS.CREATING_BRANCH,
        EDITORIAL_WORKFLOW_STATUS.INDEXING,
        EDITORIAL_WORKFLOW_STATUS.CREATING_PR,
        EDITORIAL_WORKFLOW_STATUS.COMPLETE,
      ]) {
        onStatusUpdate({ status });
      }
      return { branchName: 'tina/hello-updates', pullRequestUrl: 'pr-url' };
    });

    const outcome = await runEditorialWorkflow(cms, {
      ...baseOptions,
      onStart: vi.fn(),
      onStep,
    });

    expect(onStep.mock.calls.map(([step]) => step)).toEqual([1, 2, 3, 4]);
    expect(outcome).toEqual({
      status: 'succeeded',
      branchName: 'tina/hello-updates',
      pullRequestUrl: 'pr-url',
      warning: undefined,
      redirectHash: undefined,
    });
  });

  it('reports failures after starting as started', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const cms = makeCms(async () => {
      throw new Error('boom');
    });

    const outcome = await runEditorialWorkflow(cms, {
      ...baseOptions,
      onStart: vi.fn(),
      onStep: vi.fn(),
    });

    expect(outcome).toMatchObject({ status: 'failed', started: true });
  });

  it('returns the collection list as the redirect for a new document', async () => {
    const cms = makeCms(async () => ({ branchName: 'tina/new-post' }));

    const outcome = await runEditorialWorkflow(cms, {
      ...baseOptions,
      path: 'content/posts/2026/new.md',
      crudType: 'create',
      onStart: vi.fn(),
      onStep: vi.fn(),
    });

    expect(outcome).toMatchObject({ redirectHash: '#/collections/post/2026' });
  });
});
