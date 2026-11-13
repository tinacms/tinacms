import { useQuery } from '@tanstack/react-query';
import {
  ContentError,
  type DocumentSummary,
  type FolderSummary,
} from '../core/content/contract';
import {
  CONTENT_STALE_TIME,
  contentKeys,
  useCurrentBranch,
} from './content-queries';
import { useContentSlice } from './hooks';

const LEVEL_KEY_PART = 'level';

const EMPTY_DOCUMENTS: DocumentSummary[] = [];
const EMPTY_FOLDERS: FolderSummary[] = [];

const toContentError = (cause: unknown): ContentError => {
  if (cause instanceof ContentError) return cause;
  if (cause instanceof TypeError) {
    return new ContentError('network', cause.message);
  }
  if (cause instanceof Error) {
    return new ContentError('backend-failure', cause.message);
  }
  return new ContentError('backend-failure', String(cause));
};

interface LevelData {
  documents: DocumentSummary[];
  folders: FolderSummary[];
}

export interface CollectionLevel {
  folders: FolderSummary[];
  documents: DocumentSummary[];
  /** True until the level has data, so a failed level is not loading. */
  isLoading: boolean;
  error: ContentError | null;
  refetch: () => void;
  /** Whether the level has been read: folders are only compared once they are. */
  loaded: boolean;
}

/**
 * One level of a collection for the navigator tree: the folders and documents
 * directly in `folder` (`''` is the top), every entry, in path order. The key
 * sits under the collection's list key, so any invalidation of that prefix
 * after a write refreshes the open levels.
 */
export const useCollectionLevel = (
  collection: string,
  folder: string
): CollectionLevel => {
  const content = useContentSlice();
  const branch = useCurrentBranch();
  const query = useQuery<LevelData, ContentError>({
    queryKey: [...contentKeys.list(collection, branch), LEVEL_KEY_PART, folder],
    queryFn: async () => {
      try {
        const { edges, folders } = await content.list(collection, { folder });
        return { documents: edges.map(({ node }) => node), folders };
      } catch (cause) {
        throw toContentError(cause);
      }
    },
    staleTime: CONTENT_STALE_TIME,
  });
  return {
    folders: query.data?.folders ?? EMPTY_FOLDERS,
    documents: query.data?.documents ?? EMPTY_DOCUMENTS,
    isLoading: query.isPending,
    error: query.error,
    refetch: () => void query.refetch(),
    loaded: query.data !== undefined,
  };
};

/** Every folder that holds the folder: `a/b` gives `a` and `a/b`. */
export const foldersThrough = (folder: string): string[] => {
  const parts = folder === '' ? [] : folder.split('/');
  return parts.map((_, index) => parts.slice(0, index + 1).join('/'));
};

const isSameOrBelow = (path: string, folder: string): boolean =>
  path === folder || path.startsWith(`${folder}/`);

/**
 * The open folders after a level was read again. A folder that vanished is
 * dropped with everything open below it, unless exactly one folder vanished
 * and one appeared with the same document count: that is a rename, and the
 * open state moves to the new name.
 */
export const carryOpenFolders = (
  open: ReadonlySet<string>,
  before: readonly FolderSummary[],
  after: readonly FolderSummary[]
): ReadonlySet<string> => {
  const vanished = before.filter(
    ({ path }) => !after.some((folder) => folder.path === path)
  );
  if (vanished.length === 0) return open;
  const appeared = after.filter(
    ({ path }) => !before.some((folder) => folder.path === path)
  );
  const [gone] = vanished;
  const [added] = appeared;
  const renamed =
    vanished.length === 1 &&
    appeared.length === 1 &&
    gone !== undefined &&
    added !== undefined &&
    gone.documentCount === added.documentCount
      ? { from: gone.path, to: added.path }
      : null;
  const next = new Set<string>();
  for (const path of open) {
    const dropped = vanished.some(({ path: gonePath }) =>
      isSameOrBelow(path, gonePath)
    );
    if (!dropped) next.add(path);
    else if (renamed && isSameOrBelow(path, renamed.from)) {
      next.add(`${renamed.to}${path.slice(renamed.from.length)}`);
    }
  }
  return next;
};
