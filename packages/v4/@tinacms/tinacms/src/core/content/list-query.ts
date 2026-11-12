import {
  type DocumentConnection,
  type DocumentSummary,
  type FolderSummary,
  type ListQuery,
  ProviderRefusalError,
} from './contract';

export const MAX_LIST_PAGE = 200;

const PLACEHOLDER = /^\.gitkeep\./;

/** The last part of a path. */
export const nameOf = (path: string): string => path.split('/').at(-1) ?? path;

/** The name the table shows: the title, else the file name. */
export const shownNameOf = (summary: DocumentSummary): string =>
  summary.title ? summary.title : nameOf(summary.path);

const normalise = (text: string): string =>
  text.normalize('NFKC').toLowerCase();

interface Ordered {
  key: string | null;
  path: string;
}

const keyOf = (
  summary: DocumentSummary,
  by: 'title' | 'updatedAt'
): string | null => {
  if (by === 'title') return normalise(shownNameOf(summary));
  return summary.updatedAt ?? null;
};

// An undated document sorts after every dated one, in both directions. Ties sort by path.
const compareOrdered =
  (direction: 'asc' | 'desc') =>
  (a: Ordered, b: Ordered): number => {
    if (a.key !== b.key) {
      if (a.key === null) return 1;
      if (b.key === null) return -1;
      const order = a.key < b.key ? -1 : 1;
      return direction === 'asc' ? order : -order;
    }
    if (a.path === b.path) return 0;
    return a.path < b.path ? -1 : 1;
  };

const encodeCursor = (ordered: Ordered): string =>
  btoa(encodeURIComponent(JSON.stringify(ordered)));

const decodeCursor = (cursor: string): Ordered => {
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(atob(cursor)));
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'path' in parsed &&
      typeof parsed.path === 'string' &&
      'key' in parsed
    ) {
      const { key } = parsed;
      if (key === null) return { key: null, path: parsed.path };
      if (typeof key === 'string') return { key, path: parsed.path };
    }
  } catch {
    // Falls through to the refusal below.
  }
  throw new ProviderRefusalError('validation', 'The page cursor is not valid.');
};

export interface QueryDocumentsInput {
  /** Every document the collection owns, at every depth. Placeholders are dropped here. */
  summaries: readonly DocumentSummary[];
  /** The collection's `path`, without a trailing `/`. */
  root: string;
  /** Folders with no document in them, in folder path form. */
  emptyFolders?: readonly string[];
  query?: ListQuery;
}

const folderPartsOf = (path: string, root: string): string[] =>
  path
    .slice(root.length + 1)
    .split('/')
    .slice(0, -1);

/**
 * Applies folder scope, filter, sort and paging to a list of summaries. The local
 * Data Layer and the TinaCloud client share it, so the two cannot drift.
 */
export const queryDocuments = ({
  summaries,
  root,
  emptyFolders = [],
  query = {},
}: QueryDocumentsInput): DocumentConnection => {
  if (query.first !== undefined) {
    if (
      !Number.isInteger(query.first) ||
      query.first < 1 ||
      query.first > MAX_LIST_PAGE
    ) {
      throw new ProviderRefusalError(
        'validation',
        `\`first\` must be a whole number from 1 to ${MAX_LIST_PAGE}.`
      );
    }
  }
  const documents = summaries.filter(
    (summary) => !PLACEHOLDER.test(nameOf(summary.path))
  );
  const needle = query.filter ? normalise(query.filter) : '';
  const matches = (name: string) => normalise(name).includes(needle);

  const scope = query.folder;
  const scopeParts =
    scope === undefined || scope === '' ? [] : scope.split('/');
  const inScope = (parts: string[]): boolean =>
    parts.length === scopeParts.length &&
    scopeParts.every((part, index) => parts[index] === part);

  const scoped =
    scope === undefined
      ? documents
      : documents.filter((summary) =>
          inScope(folderPartsOf(summary.path, root))
        );
  const matching = scoped.filter(
    (summary) =>
      needle === '' ||
      matches(shownNameOf(summary)) ||
      matches(nameOf(summary.path))
  );

  const folders: FolderSummary[] = [];
  if (scope !== undefined) {
    const counts = new Map<string, number>();
    const known = (name: string) => {
      if (!counts.has(name)) counts.set(name, 0);
    };
    for (const summary of documents) {
      const parts = folderPartsOf(summary.path, root);
      const startsWithScope = scopeParts.every(
        (part, index) => parts[index] === part
      );
      if (startsWithScope && parts.length > scopeParts.length) {
        const name = parts[scopeParts.length] as string;
        known(name);
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
    for (const folder of emptyFolders) {
      const parts = folder.split('/');
      const startsWithScope = scopeParts.every(
        (part, index) => parts[index] === part
      );
      if (startsWithScope && parts.length > scopeParts.length) {
        known(parts[scopeParts.length] as string);
      }
    }
    for (const [name, documentCount] of counts) {
      if (needle !== '' && !matches(name)) continue;
      folders.push({
        path: [...scopeParts, name].join('/'),
        name,
        documentCount,
      });
    }
    folders.sort((a, b) => a.name.localeCompare(b.name));
  }

  const sort = query.sort;
  const ordered = matching.map((node) => ({
    node,
    order: {
      key: sort ? keyOf(node, sort.by) : null,
      path: node.path,
    } satisfies Ordered,
  }));
  if (sort) {
    const compare = compareOrdered(sort.direction);
    ordered.sort((a, b) => compare(a.order, b.order));
  } else {
    ordered.sort((a, b) => (a.node.path < b.node.path ? -1 : 1));
  }

  let start = 0;
  if (query.after !== undefined) {
    const after = decodeCursor(query.after);
    if (sort) {
      const compare = compareOrdered(sort.direction);
      start = ordered.findIndex(({ order }) => compare(order, after) > 0);
    } else {
      start = ordered.findIndex(({ node }) => node.path > after.path);
    }
    if (start === -1) start = ordered.length;
  }
  const end = query.first === undefined ? ordered.length : start + query.first;
  const page = ordered.slice(start, end);
  const last = page.at(-1);

  return {
    edges: page.map(({ node, order }) => ({
      node,
      cursor: encodeCursor(order),
    })),
    pageInfo: {
      hasNextPage: end < ordered.length,
      endCursor: last ? encodeCursor(last.order) : null,
    },
    totalCount: matching.length,
    folders,
  };
};
