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

// Live-input slugifier: invalid-char runs collapse to one hyphen, lowercased; slashes
// pass through so nested names stay typable. Loop, not regex, to stay off CodeQL's radar.
export function formatBranchName(str: string): string {
  let result = '';
  let replacingInvalidChars = false;

  for (const char of str.toLowerCase()) {
    const code = char.charCodeAt(0);
    const isValid =
      char === '/' ||
      char === '-' ||
      char === '_' ||
      (code >= 48 && code <= 57) ||
      (code >= 97 && code <= 122);

    if (isValid) {
      result += char;
      replacingInvalidChars = false;
    } else if (!replacingInvalidChars) {
      result += '-';
      replacingInvalidChars = true;
    }
  }

  return result;
}
