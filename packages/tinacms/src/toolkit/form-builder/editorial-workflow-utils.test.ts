import { describe, expect, it, vi } from 'vitest';
import {
  EDITORIAL_WORKFLOW_ERROR,
  EDITORIAL_WORKFLOW_EVENT_LOG_DOCS_URL,
  EditorialWorkflowErrorDetails,
} from './editorial-workflow-constants';
import {
  checkBranchGuard,
  collectionLabelResolver,
  getEditorialWorkflowError,
  messageText,
  plainMessage,
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
  it('names the page that failed, not its repo path', () => {
    const { messageParts, link } = getEditorialWorkflowError(
      workflowError('index failed: content/posts/hello.mdx', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
        file: 'content/posts/hello.mdx',
      })
    );
    const message = messageText(messageParts);

    expect(message).toContain('hello');
    expect(message).not.toContain('content/posts/hello.mdx');
    expect(message).not.toContain('.mdx');
    expect(link).toEqual({
      url: EDITORIAL_WORKFLOW_EVENT_LOG_DOCS_URL,
      label: 'How to resolve this',
    });
  });

  it('names the collection the failing file belongs to', () => {
    const { messageParts } = getEditorialWorkflowError(
      workflowError('index failed', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
        file: 'content/posts/hello.mdx',
      }),
      collectionLabelResolver({
        getCollectionByFullPath: () => ({ name: 'post', label: 'Blog Posts' }),
      })
    );
    const message = messageText(messageParts);

    expect(message).toContain('Blog Posts');
  });

  it('resolves the collection from the failing file, not the edited one', () => {
    const seen: string[] = [];
    getEditorialWorkflowError(
      workflowError('index failed', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
        file: 'content/posts/hello.mdx',
      }),
      collectionLabelResolver({
        getCollectionByFullPath: (file) => {
          seen.push(file);
          return { name: 'post' };
        },
      })
    );

    expect(seen).toEqual(['content/posts/hello.mdx']);
  });

  it('falls back to the collection name when it has no label', () => {
    const { messageParts } = getEditorialWorkflowError(
      workflowError('index failed', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
        file: 'content/posts/hello.mdx',
      }),
      collectionLabelResolver({
        getCollectionByFullPath: () => ({ name: 'post' }),
      })
    );
    const message = messageText(messageParts);

    expect(message).toContain('post');
  });

  it('omits the collection when the lookup throws, as the real schema does', () => {
    const { messageParts } = getEditorialWorkflowError(
      workflowError('index failed', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
        file: 'content/posts/hello.mdx',
      }),
      collectionLabelResolver({
        getCollectionByFullPath: () => {
          throw new Error('Unable to find collection for file at x');
        },
      } as unknown as Parameters<typeof collectionLabelResolver>[0])
    );
    const message = messageText(messageParts);

    expect(message).toContain('hello');
    expect(message).not.toContain(' in ');
  });

  it('emphasises the page and collection', () => {
    const { messageParts } = getEditorialWorkflowError(
      workflowError('index failed', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
        file: 'content/posts/hello.mdx',
      }),
      collectionLabelResolver({
        getCollectionByFullPath: () => ({ name: 'post', label: 'Blog Posts' }),
      })
    );
    const message = messageText(messageParts);

    expect(
      messageParts?.filter((part) => part.emphasis).map((part) => part.text)
    ).toEqual(['\u201chello\u201d', 'Blog Posts']);
    expect(message).toBe(
      "We couldn't save your changes, because there's a problem with \u201chello\u201d in Blog Posts.\n\nFix that page, then save again."
    );
  });

  it('falls back to generic wording when no file is named', () => {
    const { messageParts, link } = getEditorialWorkflowError(
      workflowError('index failed', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
      })
    );
    const message = messageText(messageParts);

    expect(message).toContain('your content');
    expect(link?.url).toBe(EDITORIAL_WORKFLOW_EVENT_LOG_DOCS_URL);
  });

  it('does not print the raw server copy for an indexing failure', () => {
    const { messageParts } = getEditorialWorkflowError(
      workflowError('[see docs](https://tina.io/x) raw server copy', {
        errorCode: EDITORIAL_WORKFLOW_ERROR.INDEXING_FAILED,
        file: 'content/posts/hello.mdx',
      })
    );
    const message = messageText(messageParts);

    expect(message).not.toContain('raw server copy');
    expect(message).not.toContain('](');
  });

  it('shows the server message for a code it does not recognise', () => {
    const { messageParts, link } = getEditorialWorkflowError(
      workflowError('Something the CMS has never heard of', {
        errorCode: 'SOMETHING_NEW',
      })
    );
    const message = messageText(messageParts);

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
    ).toEqual({
      messageParts: plainMessage('A branch with this name already exists'),
    });
  });
});
