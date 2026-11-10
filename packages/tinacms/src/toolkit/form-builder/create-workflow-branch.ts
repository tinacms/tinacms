import { EDITORIAL_WORKFLOW_ERROR } from './editorial-workflow-constants';

export const BRANCH_WORDS = [
  'tina',
  'llama',
  'harley',
  'napoleon',
  'pedro',
  'kip',
  'deb',
  'rico',
  'lafawnduh',
  'summer',
  'trisha',
  'rex',
  'dynamite',
  'preston',
  'idaho',
  'tots',
  'liger',
  'nunchucks',
  'bowstaff',
  'skills',
  'quesadilla',
  'chapstick',
  'glamour',
  'dance',
  'moonboots',
  'election',
  'vote',
  'sweet',
  'sledgehammer',
  'football',
  'dojo',
  'mustache',
];

const MAX_CREATION_ATTEMPTS = 20;
function availableBranchName(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let tier = 1; ; tier++) {
    const candidates = BRANCH_WORDS.map(
      (word) => `${base}-${word}${tier === 1 ? '' : `-${tier}`}`
    ).filter((name) => !taken.has(name));
    if (candidates.length) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }
}

export async function createWorkflowBranch<T extends { branchName: string }>({
  branchName,
  targetBranchExists,
  listBranchNames,
  create,
  signal,
}: {
  branchName: string;
  targetBranchExists: boolean;
  listBranchNames: () => Promise<string[]>;
  create: (name: string) => Promise<T>;
  signal?: AbortSignal;
}): Promise<T> {
  signal?.throwIfAborted();
  const existing = new Set(await listBranchNames());
  signal?.throwIfAborted();
  if (targetBranchExists) existing.add(branchName);

  for (let attempt = 0; attempt < MAX_CREATION_ATTEMPTS; attempt++) {
    signal?.throwIfAborted();
    const candidate = availableBranchName(branchName, existing);
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
        attempt === MAX_CREATION_ATTEMPTS - 1
      )
        throw error;
      existing.add(candidate);
    }
  }
  throw new Error('Unable to find an available branch name. Please try again.');
}
