import { EDITORIAL_WORKFLOW_ERROR } from './editorial-workflow-constants';

export const BRANCH_WORDS = [
  'tina',
  'llama',
  'harley',
  'alpaca',
  'cria',
  'guanaco',
  'vicuna',
  'fleece',
  'wool',
  'fluff',
  'tuft',
  'tassel',
  'poncho',
  'pompom',
  'saddle',
  'paddock',
  'pasture',
  'meadow',
  'hay',
  'clover',
  'alfalfa',
  'andes',
  'altiplano',
  'puna',
  'cusco',
  'quinoa',
  'cactus',
  'trek',
  'caravan',
  'hoof',
  'humming',
  'cuddles',
];

const MAX_CREATION_ATTEMPTS = 20;
const historyPrefix = (scope: string) =>
  `tina:retired-branch:${encodeURIComponent(scope)}:`;

function browserHistory<T>(operation: (storage: Storage) => T): T {
  try {
    return operation(window.localStorage);
  } catch {
    throw Object.assign(
      new Error(
        'Unable to remember branch names in this browser. Allow site storage and try again.'
      ),
      { errorCode: EDITORIAL_WORKFLOW_ERROR.VALIDATION_FAILED }
    );
  }
}

function retiredBranchNames(scope: string): Set<string> {
  return browserHistory((storage) => {
    const prefix = historyPrefix(scope);
    const names = new Set<string>();
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (key?.startsWith(prefix)) names.add(key.slice(prefix.length));
    }
    return names;
  });
}

function retireBranchNames(scope: string, names: Iterable<string>): void {
  browserHistory((storage) => {
    const prefix = historyPrefix(scope);
    // Separate keys keep concurrent tabs from overwriting each other's history.
    for (const name of names) storage.setItem(`${prefix}${name}`, '1');
  });
}

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
  historyScope,
  create,
  signal,
}: {
  branchName: string;
  targetBranchExists: boolean;
  listBranchNames: () => Promise<string[]>;
  historyScope: string;
  create: (name: string) => Promise<T>;
  signal?: AbortSignal;
}): Promise<T> {
  signal?.throwIfAborted();
  const existing = await listBranchNames();
  signal?.throwIfAborted();
  if (targetBranchExists) existing.push(branchName);
  retireBranchNames(historyScope, existing);

  for (let attempt = 0; attempt < MAX_CREATION_ATTEMPTS; attempt++) {
    signal?.throwIfAborted();
    const candidate = availableBranchName(
      branchName,
      retiredBranchNames(historyScope)
    );
    // Reserve before sending: a timeout can leave a created branch behind.
    retireBranchNames(historyScope, [candidate]);
    let result: T;
    try {
      result = await create(candidate);
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
      continue;
    }
    retireBranchNames(historyScope, [result.branchName]);
    return result;
  }
  throw new Error('Unable to find an available branch name. Please try again.');
}
