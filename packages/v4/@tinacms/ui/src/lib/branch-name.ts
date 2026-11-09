const BRANCH_NAME_RULE = /^[A-Za-z0-9._/-]+$/;

export const BRANCH_NAME_HINT =
  'Letters, numbers, dashes, dots and slashes. No spaces.';

/** Why a branch name cannot be used, or undefined when it can. The match against `taken` is exact. */
export const branchNameError = (
  name: string,
  taken: readonly string[],
  revealEmpty: boolean
): string | undefined => {
  if (name === '') return revealEmpty ? 'Enter a branch name.' : undefined;
  if (/\s/.test(name)) {
    return 'Branch names can’t have spaces. Use dashes instead, such as docs/new-page.';
  }
  if (!BRANCH_NAME_RULE.test(name) || /[/.]$/.test(name)) {
    return 'Use letters, numbers, dashes, dots and slashes only, and don’t end with a slash or a dot.';
  }
  if (taken.includes(name)) {
    return `A branch called ${name} already exists. Pick another name.`;
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
    .replace(/^[-.]+|[-.]+$/g, '');
  return `docs/${clean === '' ? 'document' : clean}-edits`;
};

/**
 * `base` when it is free, else the first free `base-2`, `base-3`... With `suffixed`, `base`
 * itself is never returned, so `x` with `x-2` taken gives `x-3`.
 */
export const freeName = (
  base: string,
  taken: readonly string[],
  { suffixed = false }: { suffixed?: boolean } = {}
): string => {
  if (!suffixed && !taken.includes(base)) return base;
  let number = 2;
  while (taken.includes(`${base}-${number}`)) number += 1;
  return `${base}-${number}`;
};
