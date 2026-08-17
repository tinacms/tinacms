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

// Sanitise to a valid Git ref (check-ref-format rules): forbidden characters
// become hyphens; per path component, ".." runs collapse, leading dots and
// trailing "."/".lock" are stripped; empty components (and their slashes) drop.
export const normalizeBranchName = (name: string): string =>
  name
    .replace(/[\x00-\x20\x7f~^:?*\[\\]+/g, '-')
    .replace(/@\{/g, '-')
    .split('/')
    .map((part) =>
      part
        .replace(/\.{2,}/g, '.')
        .replace(/^\.+/, '')
        .replace(/(\.lock|\.)+$/, '')
    )
    .filter(Boolean)
    .join('/');
