const BRANCH_NAME_RULE = /^[A-Za-z0-9._/-]+$/;
const GIT_REFUSED = /\.\.|\/\/|^[-/]|(^|\/)\.|\.lock(\/|$)|^HEAD$/;

export const BRANCH_NAME_HINT =
  'Letters, numbers, dashes, dots and slashes. No spaces.';

/**
 * The branch in `taken` that blocks `name`, or undefined. Git keeps a branch as a file under its
 * path, so `docs` and `docs/foo` can't both exist. The match is case-sensitive.
 */
export const takenBy = (
  name: string,
  taken: readonly string[]
): string | undefined =>
  taken.find(
    (branch) =>
      branch === name ||
      branch.startsWith(`${name}/`) ||
      name.startsWith(`${branch}/`)
  );

/** Why a branch name cannot be used, or undefined when it can. */
export const branchNameError = (
  name: string,
  taken: readonly string[],
  revealEmpty: boolean
): string | undefined => {
  if (name === '') return revealEmpty ? 'Enter a branch name.' : undefined;
  if (/\s/.test(name)) {
    return 'Branch names can’t have spaces. Use dashes instead, such as docs/new-page.';
  }
  if (
    !BRANCH_NAME_RULE.test(name) ||
    /[/.]$/.test(name) ||
    GIT_REFUSED.test(name)
  ) {
    return 'Use letters, numbers, dashes, dots and slashes only, and don’t end with a slash or a dot.';
  }
  const blocker = takenBy(name, taken);
  if (blocker === name) {
    return `A branch called ${name} already exists. Pick another name.`;
  }
  if (blocker !== undefined) {
    return `A branch called ${blocker} already exists, so ${name} can’t be used. Pick another name.`;
  }
  return undefined;
};

/** The suggested name for a document's edits: `docs/<file stem>-edits`. */
export const branchNameFromPath = (path: string): string => {
  const file = path.split('/').at(-1) ?? '';
  const dot = file.lastIndexOf('.');
  const stem = dot >= 0 ? file.slice(0, dot) : file;
  const clean = stem
    .replace(/[^A-Za-z0-9._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^[-.]+|[-.]+$/g, '');
  return `docs/${clean === '' ? 'document' : clean}-edits`;
};

/**
 * `base` when it is free, else the first free `base-2`, `base-3`... With `suffixed`, `base`
 * itself is never returned, so `x` with `x-2` taken gives `x-3`. When a branch at a parent path
 * of `base` exists, no suffix is free, so the first candidate comes back and the name check flags it.
 */
export const freeName = (
  base: string,
  taken: readonly string[],
  { suffixed = false }: { suffixed?: boolean } = {}
): string => {
  if (!suffixed && takenBy(base, taken) === undefined) return base;
  if (taken.some((branch) => base.startsWith(`${branch}/`))) {
    return suffixed ? `${base}-2` : base;
  }
  let number = 2;
  while (takenBy(`${base}-${number}`, taken) !== undefined) number += 1;
  return `${base}-${number}`;
};
