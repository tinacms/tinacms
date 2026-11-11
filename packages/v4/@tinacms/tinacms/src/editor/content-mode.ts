import { useOptionalContentSlice } from './hooks';

/** Where edits go: files on this computer, a branch, or a provider that has neither. */
export type ContentMode = 'local' | 'branches' | 'none';

// Read from the content provider, not the `branch` slice: the slice is filled
// after the first draw, and the provider is known before it.
export function useContentMode(): ContentMode {
  const content = useOptionalContentSlice();
  if (content?.local) return 'local';
  return content?.branches ? 'branches' : 'none';
}
