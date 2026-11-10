import type { SearchIndexProvider, SearchRecord } from '../server';
import { SearchError, type SearchHit } from '../core/search/contract';

// A test fixture, and the example in _docs/search-plugins.md. Its index lives in
// one process, so a separate process such as `tinacms search reindex` cannot fill
// it. A real provider talks to a service.
const index = new Map<string, SearchRecord>();

const keyOf = ({ ref }: SearchRecord): string =>
  JSON.stringify([ref.collection, ref.path]);

const scoreOf = (record: SearchRecord, terms: string[]) => {
  let score = 0;
  let snippet = '';
  for (const { text, weight } of record.fields) {
    const lower = text.toLowerCase();
    for (const term of terms) {
      const at = lower.indexOf(term);
      if (at === -1) continue;
      score += weight;
      snippet ||= text.slice(Math.max(0, at - 20), at + 60);
    }
  }
  return { score, snippet };
};

export const inMemorySearchProvider = {
  async query({ query, collections, filters, limit, cursor }) {
    if (filters && Object.keys(filters).length > 0) {
      throw new SearchError('unsupported', 'This provider does text only.');
    }
    const terms = query.toLowerCase().split(/\s+/);
    const ranked: SearchHit[] = [...index.values()]
      .filter(({ ref }) => !collections || collections.includes(ref.collection))
      .map((record) => ({ ref: record.ref, ...scoreOf(record, terms) }))
      .filter(({ score }) => score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.ref.collection.localeCompare(b.ref.collection) ||
          a.ref.path.localeCompare(b.ref.path)
      );
    if (!cursor) return ranked.slice(0, limit);
    const after = ranked.findIndex(({ ref }) => JSON.stringify(ref) === cursor);
    if (after === -1) {
      throw new SearchError(
        'invalid-query',
        'The cursor is no longer in the results.'
      );
    }
    return ranked.slice(after + 1, after + 1 + limit);
  },
  async upsert(records) {
    for (const record of records) index.set(keyOf(record), record);
  },
  async replace(records) {
    index.clear();
    for (const record of records) index.set(keyOf(record), record);
  },
} satisfies SearchIndexProvider;

export const indexedRecords = (): SearchRecord[] => [...index.values()];

export const clearInMemoryIndex = (): void => index.clear();

export default inMemorySearchProvider;
