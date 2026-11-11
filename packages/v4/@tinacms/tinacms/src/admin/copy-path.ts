/** Copies text to the clipboard. Resolves false when the clipboard is missing or refuses. */
export const copyPath = async (path: string): Promise<boolean> => {
  if (!navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(path);
    return true;
  } catch {
    return false;
  }
};
