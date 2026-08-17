// Format the default branch name by removing content/ prefix and file extension
export const formatDefaultBranchName = (
  filePath: string,
  crudType: string
): string => {
  let result = filePath;

  const contentPrefix = 'content/';
  // Remove "content/" prefix if present
  if (result.startsWith(contentPrefix)) {
    result = result.substring(contentPrefix.length);
  }

  // Remove file extension
  const lastDot = result.lastIndexOf('.');
  const lastSlash = Math.max(result.lastIndexOf('/'), result.lastIndexOf('\\'));
  if (lastDot > lastSlash && lastDot > 0) {
    result = result.slice(0, lastDot);
  }

  result = normalizeBranchName(result);

  // Add deletion indicator for delete operations
  if (crudType === 'delete') {
    result = `❌-${result}`;
  }

  return result;
};

// Loop-based trims instead of anchored regexes, which CodeQL flags on this PR
const trimRefComponent = (part: string): string => {
  let result = part.replace(/\.{2,}/g, '.');
  while (result.startsWith('.')) {
    result = result.slice(1);
  }
  let previous = '';
  while (previous !== result) {
    previous = result;
    if (result.endsWith('.lock')) {
      result = result.slice(0, -'.lock'.length);
    } else if (result.endsWith('.')) {
      result = result.slice(0, -1);
    }
  }
  return result;
};

// Sanitise to a valid Git ref (check-ref-format rules): forbidden characters
// become hyphens; per path component, ".." runs collapse, leading dots and
// trailing "."/".lock" are stripped; empty components (and their slashes) drop.
export const normalizeBranchName = (name: string): string =>
  name
    .replace(/[\x00-\x20\x7f~^:?*\[\\]+/g, '-')
    .replace(/@\{/g, '-')
    .split('/')
    .map(trimRefComponent)
    .filter(Boolean)
    .join('/');

// Live-input slugifier for branch name fields: invalid special characters
// become hyphens and the result is lowercased. Slash handling stays out of it
// so nested names can still be typed; apply normalizeBranchName at submit.
export function formatBranchName(str: string): string {
  return str.replace(/[^/\w-]+/g, '-').toLowerCase();
}
