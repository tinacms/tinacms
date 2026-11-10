import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditorialWorkflow } from './use-editorial-workflow';

const mocks = vi.hoisted(() => ({
  setCurrentBranch: vi.fn(),
  beforeSubmit: vi.fn(async ({ values }) => values),
  executeEditorialWorkflow: vi.fn(),
  branchExists: vi.fn(),
  success: vi.fn(),
}));

vi.mock('../react-core', () => ({
  useCMS: () => ({
    alerts: { success: mocks.success },
    api: {
      tina: {
        executeEditorialWorkflow: mocks.executeEditorialWorkflow,
        branchExists: mocks.branchExists,
        schema: {
          getCollectionByFullPath: () => ({
            name: 'rules',
            path: 'content/rules',
            ui: { beforeSubmit: mocks.beforeSubmit },
          }),
          transformPayload: (_name, values) => values,
        },
      },
    },
  }),
}));
vi.mock('@toolkit/plugin-branch-switcher', () => ({
  useBranchData: () => ({ setCurrentBranch: mocks.setCurrentBranch }),
}));
vi.mock('../../admin/api', () => ({
  CREATE_DOCUMENT_GQL: 'create',
  DELETE_DOCUMENT_GQL: 'delete',
  UPDATE_DOCUMENT_GQL: 'update',
}));
vi.mock('@tinacms/schema-tools', () => ({
  ERR_BRANCH_EXISTS: 'already exists',
  ERR_BRANCH_CONFLICT: 'conflict',
}));

const options = {
  branchName: 'tina/rules/example',
  baseBranch: 'main',
  path: 'content/rules/example.mdx',
  values: { title: 'Edited' },
  crudType: 'update',
  isDraft: true,
};

describe('editorial workflow branch naming', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    mocks.branchExists.mockResolvedValue(false);
    mocks.executeEditorialWorkflow.mockImplementation(
      async ({ branchName }) => ({
        branchName,
        pullRequestUrl: 'https://example.com/pull/1',
      })
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it('renames a generated default and displays and selects the resulting branch', async () => {
    const { result } = renderHook(() => useEditorialWorkflow());
    await act(async () => {
      expect(
        await result.current.executeWorkflow({
          ...options,
          autoRenameBranch: true,
          targetBranchExists: true,
        })
      ).toEqual({ success: true });
    });
    expect(mocks.executeEditorialWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({
        branchName: 'tina/rules/example-alpha',
        prTitle: 'rules/example alpha (PR from TinaCMS)',
        isDraft: true,
        graphQLContentOp: {
          query: 'update',
          variables: {
            collection: 'rules',
            relativePath: 'example.mdx',
            params: options.values,
          },
        },
      })
    );
    expect(mocks.setCurrentBranch).toHaveBeenCalledWith(
      'tina/rules/example-alpha'
    );
    expect(mocks.success).toHaveBeenCalledWith(
      expect.stringContaining('tina/rules/example-alpha'),
      0
    );
  });

  it('preserves the conflict error for manually managed names', async () => {
    const { result } = renderHook(() => useEditorialWorkflow());
    await act(async () => {
      expect(
        await result.current.executeWorkflow({
          ...options,
          targetBranchExists: true,
        })
      ).toEqual({
        success: false,
        error: 'A branch with this name already exists',
      });
    });
    expect(mocks.executeEditorialWorkflow).not.toHaveBeenCalled();
    expect(mocks.beforeSubmit).not.toHaveBeenCalled();
  });

  it('does not rename manual names after a server collision', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.executeEditorialWorkflow.mockRejectedValueOnce(
      Object.assign(new Error('Exists'), { errorCode: 'BRANCH_EXISTS' })
    );
    const { result } = renderHook(() => useEditorialWorkflow());
    await act(async () => {
      expect(
        await result.current.executeWorkflow({
          ...options,
          targetBranchExists: false,
        })
      ).toEqual({
        success: false,
        error: 'A branch with this name already exists',
      });
    });
    expect(mocks.executeEditorialWorkflow).toHaveBeenCalledTimes(1);
    expect(mocks.setCurrentBranch).not.toHaveBeenCalled();
  });

  it('runs beforeSubmit once across creation retries', async () => {
    mocks.executeEditorialWorkflow.mockRejectedValueOnce(
      Object.assign(new Error('Exists'), { errorCode: 'BRANCH_EXISTS' })
    );
    const { result } = renderHook(() => useEditorialWorkflow());
    await act(async () => {
      expect(
        await result.current.executeWorkflow({
          ...options,
          autoRenameBranch: true,
          targetBranchExists: false,
        })
      ).toEqual({ success: true });
    });
    expect(mocks.executeEditorialWorkflow).toHaveBeenCalledTimes(2);
    expect(mocks.beforeSubmit).toHaveBeenCalledTimes(1);
  });
});
