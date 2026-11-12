import { absoluteUrlOf, mediaNameOf } from './media-types';

type ResolveUrl = (path: string) => string;

/** Writes the text to the clipboard. Resolves false when the clipboard is missing or refuses. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const absoluteUrlsOf = (
  paths: readonly string[],
  resolveUrl: ResolveUrl
): string => paths.map((path) => absoluteUrlOf(resolveUrl(path))).join('\n');

async function downloadOne(url: string, name: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed with ${response.status}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = name;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Saves each file under its own name, one after another. Returns how many failed. */
export async function downloadFiles(
  paths: readonly string[],
  resolveUrl: ResolveUrl
): Promise<number> {
  let failed = 0;
  for (const path of paths) {
    try {
      await downloadOne(resolveUrl(path), mediaNameOf(path));
    } catch {
      failed += 1;
    }
  }
  return failed;
}
