import type { CollectionList } from '../../editor/collection-lists';

export interface RecentRow {
  collection: string;
  path: string;
  title: string;
  unsaved: boolean;
  updatedAt?: Date;
  author?: string;
}

const fileNameOf = (path: string): string => {
  const name = path.slice(path.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(0, dot) : name;
};

// A string that does not parse as a date counts as no date.
const dateOf = (updatedAt: string | undefined): Date | undefined => {
  if (!updatedAt) return undefined;
  const time = Date.parse(updatedAt);
  return Number.isFinite(time) ? new Date(time) : undefined;
};

const byPath = (left: RecentRow, right: RecentRow): number => {
  if (left.path < right.path) return -1;
  return left.path > right.path ? 1 : 0;
};

/**
 * The rows of Recent documents: the editor's unsaved documents in path order,
 * then every other document that has a date, newest first. A document with no
 * date and no unsaved edits has no row.
 */
export const recentRowsOf = (
  lists: readonly CollectionList[],
  unsavedIds: ReadonlySet<string>
): RecentRow[] => {
  const seen = new Set<string>();
  const unsaved: RecentRow[] = [];
  const dated: RecentRow[] = [];
  for (const { collection, documents } of lists) {
    for (const summary of documents) {
      if (seen.has(summary.path)) continue;
      seen.add(summary.path);
      const row = {
        collection,
        path: summary.path,
        title: summary.title || fileNameOf(summary.path),
      };
      if (unsavedIds.has(summary.path)) {
        unsaved.push({ ...row, unsaved: true });
        continue;
      }
      const updatedAt = dateOf(summary.updatedAt);
      if (!updatedAt) continue;
      dated.push({
        ...row,
        unsaved: false,
        updatedAt,
        author: summary.lastAuthor?.name || undefined,
      });
    }
  }
  return [
    ...unsaved.sort(byPath),
    ...dated.sort(
      (left, right) =>
        (right.updatedAt?.getTime() ?? 0) - (left.updatedAt?.getTime() ?? 0) ||
        byPath(left, right)
    ),
  ];
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now", then minutes, hours and up to seven days ago, then the date. In the browser's locale. */
export const relativeTimeOf = (date: Date, now: number): string => {
  const elapsed = now - date.getTime();
  if (elapsed < MINUTE) return 'just now';
  const relative = new Intl.RelativeTimeFormat(undefined, {
    numeric: 'always',
  });
  if (elapsed < HOUR) {
    return relative.format(-Math.floor(elapsed / MINUTE), 'minute');
  }
  if (elapsed < DAY)
    return relative.format(-Math.floor(elapsed / HOUR), 'hour');
  if (elapsed <= 7 * DAY) {
    return relative.format(-Math.floor(elapsed / DAY), 'day');
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
    date
  );
};

export const exactTimeOf = (date: Date): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
