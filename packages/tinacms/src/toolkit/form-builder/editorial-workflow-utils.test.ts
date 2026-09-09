import { describe, expect, it, vi } from 'vitest';
import {
  EDITORIAL_WORKFLOW_ERROR,
  EDITORIAL_WORKFLOW_EVENT_LOG_DOCS_URL,
  EditorialWorkflowErrorDetails,
} from './editorial-workflow-constants';
import {
  checkBranchGuard,
  getEditorialWorkflowError,
  getEditorialWorkflowErrorMessage,
} from './editorial-workflow-utils';

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

const workflowError = (
  message: string,
  extras: Partial<EditorialWorkflowErrorDetails> = {}
): EditorialWorkflowErrorDetails =>
  Object.assign(new Error(message), extras) as EditorialWorkflowErrorDetails;

describe('getEditorialWorkflowError', () => {
  it('names the file that failed to index', () => {
    const { message, link } = getEditorialWorkflowError(
      workflowError('index failed: content/posts/hello.mdx', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
        filepath: 'content/posts/hello.mdx',
      })
    );

    expect(message).toContain('content/posts/hello.mdx');
    expect(link).toEqual({
      url: EDITORIAL_WORKFLOW_EVENT_LOG_DOCS_URL,
      label: 'What causes this?',
    });
  });

  it('falls back to generic wording when no file is named', () => {
    const { message, link } = getEditorialWorkflowError(
      workflowError('index failed', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
      })
    );

    expect(message).toContain('your content');
    expect(link?.url).toBe(EDITORIAL_WORKFLOW_EVENT_LOG_DOCS_URL);
  });

  it('does not print the raw server copy for an indexing failure', () => {
    const { message } = getEditorialWorkflowError(
      workflowError('[see docs](https://tina.io/x) raw server copy', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
        filepath: 'content/posts/hello.mdx',
      })
    );

    expect(message).not.toContain('raw server copy');
    expect(message).not.toContain('](');
  });

  it('shows the server message for a code it does not recognise', () => {
    const { message, link } = getEditorialWorkflowError(
      workflowError('Something the CMS has never heard of', {
        errorCode: 'WORKFLOW_FAILED',
      })
    );

    expect(message).toBe('Something the CMS has never heard of');
    expect(link).toBeUndefined();
  });

  it('offers no link for the branch errors it already mapped', () => {
    expect(
      getEditorialWorkflowError(
        workflowError('whatever', {
          errorCode: EDITORIAL_WORKFLOW_ERROR.BRANCH_EXISTS,
        })
      )
    ).toEqual({ message: 'A branch with this name already exists' });
  });
});

describe('getEditorialWorkflowErrorMessage', () => {
  it('still returns just the message string', () => {
    expect(
      getEditorialWorkflowErrorMessage(
        workflowError('Invalid branch name', {
          errorCode: EDITORIAL_WORKFLOW_ERROR.VALIDATION_FAILED,
        })
      )
    ).toBe('Invalid branch name');
  });
});
