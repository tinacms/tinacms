import { EDITORIAL_WORKFLOW_ERROR } from './editorial-workflow-constants';

const BRANCH_WORDS = [
  'alpha',
  'birch',
  'coral',
  'daisy',
  'eagle',
  'fern',
  'grove',
  'harley',
  'heron',
  'iris',
  'jade',
  'kiwi',
  'lark',
  'maple',
  'otter',
  'panda',
  'pearl',
  'robin',
  'sage',
  'turtle',
  'willow',
];

const WORD_ATTEMPTS = 5;
const NUMBER_ATTEMPTS = 20;
const MAX_RENAMES = WORD_ATTEMPTS + NUMBER_ATTEMPTS;

export async function createWorkflowBranch<T>({
  branchName,
  targetBranchExists,
  branchExists,
  create,
  signal,
}: {
  branchName: string;
  targetBranchExists: boolean;
  branchExists: (name: string) => Promise<boolean>;
  create: (name: string) => Promise<T>;
  signal?: AbortSignal;
}): Promise<T> {
  const words = [...BRANCH_WORDS];
  let candidate = branchName;

  for (let attempt = 0; attempt <= MAX_RENAMES; attempt++) {
    signal?.throwIfAborted();
    const exists =
      attempt === 0 ? targetBranchExists : await branchExists(candidate);
    signal?.throwIfAborted();

    if (!exists) {
      try {
        return await create(candidate);
      } catch (error) {
        // Only a confirmed creation collision is safe to retry: other failures
        // may have already written content or opened a pull request.
        if (
          typeof error !== 'object' ||
          error === null ||
          !('errorCode' in error) ||
          error.errorCode !== EDITORIAL_WORKFLOW_ERROR.BRANCH_EXISTS ||
          attempt === MAX_RENAMES
        ) {
          throw error;
        }
      }
    }

    if (attempt === MAX_RENAMES) break;
    const suffix =
      attempt < WORD_ATTEMPTS
        ? words.splice(Math.floor(Math.random() * words.length), 1)[0]
        : attempt - WORD_ATTEMPTS + 1;
    candidate = `${branchName}-${suffix}`;
  }

  throw Object.assign(new Error('A branch with this name already exists'), {
    errorCode: EDITORIAL_WORKFLOW_ERROR.BRANCH_EXISTS,
  });
}
