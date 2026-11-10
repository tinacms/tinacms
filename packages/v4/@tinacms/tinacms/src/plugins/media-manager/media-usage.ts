import type {
  ContentProvider,
  DocumentSummary,
} from '../../core/content/contract';
import type { SearchProvider } from '../../core/search/contract';
import type { TinaDocument } from '../../core/schema/types';

export interface MediaUse {
  title: string;
  collection?: string;
  documentPath?: string;
  mine: boolean;
}

export interface MediaUsage {
  /** True when the saved-document search ran without error. It never proves a file unused. */
  searched: boolean;
  uses: Map<string, MediaUse[]>;
}

/** A document with edits that are not saved yet, read from an open form or a stored draft. */
export interface UnsavedDocument {
  path: string;
  title: string;
  collection?: string;
  values: TinaDocument;
}

export interface MediaUsageDeps {
  resolveUrl: (path: string) => string;
  search: SearchProvider | null;
  content: Pick<ContentProvider, 'get' | 'list'> | null;
  collections: readonly string[];
  unsaved: readonly UnsavedDocument[];
}

export const MAX_CONCURRENT_SEARCHES = 4;
export const MAX_HITS_PER_FILE = 20;
export const USAGE_TIMEOUT_MS = 10_000;

const mentionsAny = (value: unknown, needles: readonly string[]): boolean => {
  if (typeof value === 'string') {
    return needles.some((needle) => value.includes(needle));
  }
  if (Array.isArray(value)) return value.some((v) => mentionsAny(v, needles));
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some((v) => mentionsAny(v, needles));
  }
  return false;
};

const fileName = (path: string) => path.slice(path.lastIndexOf('/') + 1);

interface KnownDocument {
  collection: string;
  summary: DocumentSummary;
}

const unsavedUses = (
  deps: MediaUsageDeps,
  paths: readonly string[]
): Map<string, MediaUse[]> => {
  const uses = new Map<string, MediaUse[]>();
  for (const path of paths) {
    const needles = [path, deps.resolveUrl(path)];
    const found = deps.unsaved
      .filter(({ values }) => mentionsAny(values, needles))
      .map(
        (doc): MediaUse => ({
          title: doc.title,
          collection: doc.collection,
          documentPath: doc.path,
          mine: true,
        })
      );
    if (found.length > 0) uses.set(path, found);
  }
  return uses;
};

const mergeUses = (
  saved: Map<string, MediaUse[]>,
  unsaved: Map<string, MediaUse[]>
): Map<string, MediaUse[]> => {
  const merged = new Map<string, MediaUse[]>();
  for (const path of new Set([...saved.keys(), ...unsaved.keys()])) {
    const savedUses = saved.get(path) ?? [];
    const savedPaths = new Set(savedUses.map((use) => use.documentPath));
    merged.set(path, [
      ...savedUses,
      ...(unsaved.get(path) ?? []).filter(
        (use) => !savedPaths.has(use.documentPath)
      ),
    ]);
  }
  return merged;
};

/**
 * Finds the documents that use each media path: the editor's unsaved edits, and
 * saved documents when a search provider exists. Search hints are re-read from
 * content before they count. It never throws; a failed, timed-out or aborted
 * lookup returns `searched: false` with the unsaved uses.
 */
export async function findMediaUsage(
  deps: MediaUsageDeps,
  paths: readonly string[],
  signal: AbortSignal
): Promise<MediaUsage> {
  const unsaved = unsavedUses(deps, paths);
  const fallback: MediaUsage = { searched: false, uses: unsaved };
  const { search, content } = deps;
  if (!search || !content || paths.length === 0 || signal.aborted) {
    return fallback;
  }

  const inner = new AbortController();
  const stop = () => inner.abort();
  signal.addEventListener('abort', stop);
  const timer = setTimeout(stop, USAGE_TIMEOUT_MS);
  const stopped = new Promise<'stopped'>((resolve) => {
    inner.signal.addEventListener('abort', () => resolve('stopped'));
  });

  const saved = new Map<string, MediaUse[]>();
  const run = async (): Promise<'done' | 'failed'> => {
    try {
      const known = new Map<string, KnownDocument>();
      const lists = await Promise.all(
        deps.collections.map(async (collection) => ({
          collection,
          summaries: await content.list(collection),
        }))
      );
      for (const { collection, summaries } of lists) {
        for (const summary of summaries) {
          known.set(summary.path, { collection, summary });
        }
      }

      let next = 0;
      const worker = async () => {
        while (next < paths.length && !inner.signal.aborted) {
          const path = paths[next++];
          const needles = [path, deps.resolveUrl(path)];
          const hits = await search.search(fileName(path));
          const seen = new Set<string>();
          for (const hit of hits.slice(0, MAX_HITS_PER_FILE)) {
            const doc = known.get(hit.ref);
            if (!doc || seen.has(hit.ref)) continue;
            seen.add(hit.ref);
            if (inner.signal.aborted) return;
            const entry = await content.get(doc.collection, hit.ref);
            if (!entry || !mentionsAny(entry.document, needles)) continue;
            saved.set(path, [
              ...(saved.get(path) ?? []),
              {
                title: doc.summary.title ?? doc.summary.path,
                collection: doc.collection,
                documentPath: doc.summary.path,
                mine: false,
              },
            ]);
          }
        }
      };
      await Promise.all(
        Array.from(
          { length: Math.min(MAX_CONCURRENT_SEARCHES, paths.length) },
          worker
        )
      );
      return 'done';
    } catch {
      return 'failed';
    }
  };

  try {
    const outcome = await Promise.race([run(), stopped]);
    if (outcome !== 'done') return fallback;
    return { searched: true, uses: mergeUses(saved, unsaved) };
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', stop);
    inner.abort();
  }
}
