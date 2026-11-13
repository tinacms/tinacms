import {
  type DocumentConnection,
  type DocumentSummary,
  type FolderSummary,
  type ListSort,
} from '../../core/content/contract';
import { shownNameOf } from '../../core/content/list-query';
import { extensionOf, nameOf, trimSlashes } from '../../core/content/names';

export const PAGE_SIZE = 50;
export const FILTER_DELAY_MS = 250;
export const NEW_DOCUMENT_PBI = '#TBD';

export type StatusView = 'all' | 'unsaved' | 'saved';
export type SortKey = 'title' | 'status' | 'updated';
export type SortDirection = 'asc' | 'desc';
export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export const DEFAULT_SORT: SortState = { key: 'updated', direction: 'desc' };
export const DEFAULT_SERVER_SORT: ListSort = {
  by: 'updatedAt',
  direction: 'desc',
};

const FIRST_DIRECTION: Record<SortKey, SortDirection> = {
  title: 'asc',
  status: 'asc',
  updated: 'desc',
};

/** The sort a press on a head asks for: the other direction on the sorted head, else the head's own first direction. */
export const nextSort = (current: SortState, key: SortKey): SortState => {
  if (current.key === key) {
    return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { key, direction: FIRST_DIRECTION[key] };
};

/** Status sort lives in the browser, so the server keeps the last sort it was given. */
export const serverSortOf = (sort: SortState, last: ListSort): ListSort => {
  if (sort.key === 'title') return { by: 'title', direction: sort.direction };
  if (sort.key === 'updated') {
    return { by: 'updatedAt', direction: sort.direction };
  }
  return last;
};

export interface FolderRow {
  kind: 'folder';
  key: string;
  folder: FolderSummary;
}

export interface DocumentRow {
  kind: 'document';
  key: string;
  path: string;
  name: string;
  unsaved: boolean;
  /** A new document that has no file yet. */
  isCopy: boolean;
  updatedAt?: Date;
  author?: string;
}

export type TableRow = FolderRow | DocumentRow;

const dateOf = (updatedAt: string | undefined): Date | undefined => {
  if (!updatedAt) return undefined;
  const time = Date.parse(updatedAt);
  return Number.isFinite(time) ? new Date(time) : undefined;
};

const documentRowOf = (
  summary: DocumentSummary,
  unsavedIds: ReadonlySet<string>
): DocumentRow => ({
  kind: 'document',
  key: summary.path,
  path: summary.path,
  name: shownNameOf(summary),
  unsaved: unsavedIds.has(summary.path),
  isCopy: false,
  updatedAt: dateOf(summary.updatedAt),
  author: summary.lastAuthor?.name || undefined,
});

const copyRowOf = (path: string): DocumentRow => ({
  kind: 'document',
  key: path,
  path,
  name: nameOf(path),
  unsaved: true,
  isCopy: true,
});

export interface BuildRowsInput {
  connection: DocumentConnection | undefined;
  /** Paths of the new documents in this folder that have no file yet. */
  copyPaths: readonly string[];
  unsavedIds: ReadonlySet<string>;
  isFirstPage: boolean;
  filter: string;
  view: StatusView;
  sort: SortState;
}

const matchesFilter = (name: string, filter: string): boolean =>
  filter === '' ||
  name
    .normalize('NFKC')
    .toLowerCase()
    .includes(filter.normalize('NFKC').toLowerCase());

const byStatus =
  (direction: SortDirection) =>
  (left: DocumentRow, right: DocumentRow): number => {
    if (left.unsaved === right.unsaved) return 0;
    const order = left.unsaved ? 1 : -1;
    return direction === 'asc' ? order : -order;
  };

/**
 * The rows of one page: unsaved copies first, then the folders (page 1 only), then the loaded
 * documents. The status views and the Status sort cover this page and the copies only.
 */
export const buildRows = ({
  connection,
  copyPaths,
  unsavedIds,
  isFirstPage,
  filter,
  view,
  sort,
}: BuildRowsInput): TableRow[] => {
  const copies = isFirstPage
    ? copyPaths
        .filter((path) => matchesFilter(nameOf(path), filter))
        .map(copyRowOf)
    : [];
  const documents = (connection?.edges ?? [])
    .map(({ node }) => documentRowOf(node, unsavedIds))
    .filter((row) => !copies.some((copy) => copy.path === row.path));
  const inView = (row: DocumentRow) =>
    view === 'all' || (view === 'unsaved' ? row.unsaved : !row.unsaved);
  const shown = [...copies, ...documents].filter(inView);
  const ordered =
    sort.key === 'status' ? [...shown].sort(byStatus(sort.direction)) : shown;
  const folders: FolderRow[] =
    isFirstPage && view === 'all'
      ? (connection?.folders ?? []).map((folder) => ({
          kind: 'folder',
          key: `folder:${folder.path}`,
          folder,
        }))
      : [];
  const unsavedCopies = ordered.filter((row) => row.isCopy);
  const documentRows = ordered.filter((row) => !row.isCopy);
  return [...unsavedCopies, ...folders, ...documentRows];
};

export interface ViewCounts {
  all: number;
  unsaved: number;
  saved: number;
}

/** All is the server's total; Unsaved and Saved count the loaded page and the copies. */
export const countsOf = (
  connection: DocumentConnection | undefined,
  copyPaths: readonly string[],
  unsavedIds: ReadonlySet<string>,
  isFirstPage: boolean
): ViewCounts => {
  const loaded = (connection?.edges ?? []).map(({ node }) => node.path);
  const copies = isFirstPage
    ? copyPaths.filter((path) => !loaded.includes(path))
    : [];
  const unsaved =
    loaded.filter((path) => unsavedIds.has(path)).length + copies.length;
  return {
    all: connection?.totalCount ?? 0,
    unsaved,
    saved: loaded.length - loaded.filter((path) => unsavedIds.has(path)).length,
  };
};

export interface NameParts {
  /** The path up to and including the last `/`, or `''`. */
  dir: string;
  stem: string;
  /** The extension with its dot, or `''`. */
  extension: string;
}

export const namePartsOf = (path: string): NameParts => {
  const name = nameOf(path);
  const extension = extensionOf(name);
  return {
    dir: path.slice(0, path.length - name.length),
    stem: name.slice(0, name.length - extension.length),
    extension,
  };
};

export const joinFolder = (parent: string, name: string): string =>
  parent === '' ? name : `${parent}/${name}`;

/** Whether the loaded page shows any document with a last-edited time. TinaCloud lists carry none. */
export const hasEditTimes = (connection: DocumentConnection): boolean =>
  connection.edges.some(({ node }) => dateOf(node.updatedAt) !== undefined);

const lastPartOf = (path: string): string => path.split('/').at(-1) ?? path;

/**
 * The path shown in the File column: from the collection folder's last part
 * (`docs/intro.mdx` for a collection at `content/docs`). A path outside the collection folder, or
 * a collection with none, shows as the provider gives it.
 */
export const fileOf = (
  collectionPath: string | undefined,
  documentPath: string
): string => {
  const root = trimSlashes(collectionPath ?? '');
  if (root === '' || !documentPath.startsWith(`${root}/`)) return documentPath;
  return `${lastPartOf(root)}/${documentPath.slice(root.length + 1)}`;
};

/** The File column of a folder row: its path from the collection folder's last part, ending in `/`. */
export const folderFileOf = (
  collectionPath: string | undefined,
  folderPath: string
): string => {
  const root = trimSlashes(collectionPath ?? '');
  return root === '' ? `${folderPath}/` : `${lastPartOf(root)}/${folderPath}/`;
};

export const plural = (count: number, one: string, many: string): string =>
  `${count} ${count === 1 ? one : many}`;

export interface CountTextInput {
  connection: DocumentConnection | undefined;
  /** The scope's `totalCount` from its last read with no text filter. */
  unfilteredTotal: number | undefined;
  filter: string;
  view: StatusView;
  /** Document rows of the chosen status on the loaded page, plus unsaved copies. */
  viewCount: number;
}

/**
 * The count above the table. All with no filter lists the folders and the total under them; a text
 * filter or a status view counts matches against the scope's documents.
 */
export const countTextOf = ({
  connection,
  unfilteredTotal,
  filter,
  view,
  viewCount,
}: CountTextInput): string => {
  if (!connection) return '';
  const documents = connection.totalCount;
  const scopeTotal = unfilteredTotal ?? documents;
  if (view !== 'all')
    return `${viewCount} of ${plural(scopeTotal, 'document', 'documents')}`;
  if (filter !== '') {
    return `${documents} of ${plural(scopeTotal, 'document', 'documents')}`;
  }
  const folders = connection.folders;
  const total =
    documents + folders.reduce((sum, folder) => sum + folder.documentCount, 0);
  const parts = [
    ...(folders.length === 0
      ? []
      : [plural(folders.length, 'folder', 'folders')]),
    plural(documents, 'document', 'documents'),
  ];
  const listed = parts.join(', ');
  return total === documents ? listed : `${listed} · ${total} in total`;
};
