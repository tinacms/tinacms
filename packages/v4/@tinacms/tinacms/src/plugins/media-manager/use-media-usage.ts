import { useQuery } from '@tanstack/react-query';
import { isSearchProvider } from '../../core/search/contract';
import { useCurrentBranch } from '../../editor/content-queries';
import {
  useMediaSlice,
  useOptionalContentSlice,
  useSchemaCollections,
  useTinaStore,
} from '../../editor/hooks';
import { readDraft } from '../../form/drafts';
import {
  type FormId,
  readFormStore,
  toDocument,
  useUnsavedFormIds,
} from '../../form/form-store';
import {
  type MediaUsage,
  type MediaUsageDeps,
  type UnsavedDocument,
  findMediaUsage,
} from './media-usage';

export const MEDIA_USAGE_STALE_MS = 30_000;

export const mediaUsageKey = (
  branch: string,
  paths: readonly string[],
  unsavedIds: readonly string[]
) => [
  'tina',
  'media',
  'usage',
  branch,
  [...paths].sort(),
  [...unsavedIds].sort(),
];

/** The open forms' live values, or the stored draft of a reloaded document. */
export const readUnsavedDocuments = (
  ids: readonly FormId[]
): UnsavedDocument[] => {
  const { forms, userId, branch } = readFormStore();
  return ids.flatMap((id) => {
    const open = forms[id];
    const values = open
      ? toDocument(open.values)
      : readDraft(id, userId, branch)?.values;
    return values ? [{ path: id, title: id, values }] : [];
  });
};

/**
 * Where each path is used. Shares one lookup per branch and path set for 30 s,
 * so the details line and the delete confirm read the same result.
 */
export function useMediaUsage(paths: readonly string[], enabled: boolean) {
  const media = useMediaSlice();
  const content = useOptionalContentSlice();
  const search = useTinaStore((state) => state.search);
  const collections = useSchemaCollections();
  const branch = useCurrentBranch() ?? '';
  const unsavedIds = useUnsavedFormIds();
  return useQuery<MediaUsage>({
    queryKey: mediaUsageKey(branch, paths, unsavedIds),
    enabled: enabled && paths.length > 0,
    staleTime: MEDIA_USAGE_STALE_MS,
    queryFn: ({ signal }) => {
      const deps: MediaUsageDeps = {
        resolveUrl: (path) => media.resolveUrl(path),
        search: isSearchProvider(search) ? search : null,
        content,
        collections: collections.map(({ name }) => name),
        unsaved: readUnsavedDocuments(unsavedIds),
      };
      return findMediaUsage(deps, paths, signal);
    },
  });
}
