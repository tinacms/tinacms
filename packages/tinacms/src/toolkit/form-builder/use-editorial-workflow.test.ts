import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditorialWorkflow } from './use-editorial-workflow';

const mocks = vi.hoisted(() => ({
  setCurrentBranch: vi.fn(),
  beforeSubmit: vi.fn(async ({ values }) => values),
  executeEditorialWorkflow: vi.fn(),
  branchExists: vi.fn(),
  listBranches: vi.fn(),
  success: vi.fn(),
  hasExplicitListenerFor: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock('../react-core', () => ({
  useCMS: () => ({
    alerts: { success: mocks.success },
    events: {
      hasExplicitListenerFor: mocks.hasExplicitListenerFor,
      dispatch: mocks.dispatch,
    },
    api: {
      tina: {
        executeEditorialWorkflow: mocks.executeEditorialWorkflow,
        branchExists: mocks.branchExists,
        listBranches: mocks.listBranches,
        clientId: 'test-app',
        contentApiBase: 'https://example.com',
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
    mocks.listBranches.mockResolvedValue([]);
    mocks.hasExplicitListenerFor.mockReturnValue(false);
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
    mocks.listBranches.mockResolvedValue([{ protected: false }]);
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
        branchName: 'tina/rules/example-tina',
        prTitle: 'rules/example tina (PR from TinaCMS)',
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
      'tina/rules/example-tina'
    );
    expect(mocks.success).toHaveBeenCalledWith(
      expect.stringContaining('tina/rules/example-tina'),
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

describe('editorial workflow completion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.branchExists.mockResolvedValue(false);
    mocks.executeEditorialWorkflow.mockImplementation(
      async ({ branchName }) => ({
        branchName,
        pullRequestUrl: 'https://example.com/pull/1',
      })
    );
    window.location.hash = '';
  });
  afterEach(() => vi.restoreAllMocks());

  const run = async (overrides: Record<string, unknown>) => {
    const { result } = renderHook(() => useEditorialWorkflow());
    await act(async () => {
      await result.current.executeWorkflow({
        ...options,
        targetBranchExists: false,
        ...overrides,
      });
    });
  };

  it('hands the created pull request to a mounted prompt instead of a toast', async () => {
    mocks.hasExplicitListenerFor.mockReturnValue(true);

    await run({ path: 'content/rules/team/example.mdx', crudType: 'create' });

    expect(mocks.hasExplicitListenerFor).toHaveBeenCalledWith(
      'editorial-workflow:complete'
    );
    expect(mocks.dispatch).toHaveBeenCalledWith({
      type: 'editorial-workflow:complete',
      branchName: 'tina/rules/example',
      pullRequestUrl: 'https://example.com/pull/1',
      isDraft: true,
      collection: 'rules',
      relativePath: 'team/example.mdx',
      crudType: 'create',
    });
    expect(mocks.success).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('');
  });

  it('reports a ready-for-review pull request as not a draft', async () => {
    mocks.hasExplicitListenerFor.mockReturnValue(true);

    await run({ isDraft: false });

    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ isDraft: false })
    );
  });

  it("reports the server's draft-first default as a draft", async () => {
    mocks.hasExplicitListenerFor.mockReturnValue(true);

    await run({ isDraft: undefined });

    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ isDraft: true })
    );
  });

  it('falls back to the toast and the collection list without a mounted prompt', async () => {
    mocks.hasExplicitListenerFor.mockReturnValue(false);

    await run({ path: 'content/rules/team/example.mdx', crudType: 'create' });

    expect(mocks.dispatch).not.toHaveBeenCalled();
    expect(mocks.success).toHaveBeenCalledWith(
      expect.stringContaining('https://example.com/pull/1'),
      0
    );
    expect(window.location.hash).toBe('#/collections/rules/team');
  });
});
