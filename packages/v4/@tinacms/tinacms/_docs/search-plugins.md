# Search plugins

A search plugin supplies the `search` capability. `search` is a singleton
capability, and it is optional: a project installs one plugin that provides
`search`, or none. A second one throws an error at boot, unless it declares
`overrides`. Refer to [plugins.md](./plugins.md#capabilities). Refer to
[ADR-021](../../../../../adr/v4/021-search-capability-contract.md) for the
decision.

Search reads an index that the provider owns. The index lags the content, so a
result is a hint. A result names a document, and the caller reads the real
document through `content`.

## The contract

`search(query, options)` returns `Promise<SearchHit[]>`.

| `options` field | Role |
|---|---|
| `limit` | Required. An integer from 1 to 100. |
| `collections` | Optional. Search only these collections. The list is not empty, and each name is a searchable collection. |
| `filters` | Optional. Field name to a string, number or boolean. At most 10 keys. A provider that cannot apply a filter throws `SearchError('unsupported')`. It never ignores the filter. |
| `cursor` | Optional. `JSON.stringify(lastHit.ref)` of the previous page. |

A `SearchHit` is `{ ref, score, snippet }`. A filter key reaches the provider
as it was sent, including `__proto__`, so a provider checks the keys it accepts.

- `ref` is `{ collection, path }`. `path` is the path that
  `content.get(collection, path)` takes, so the caller re-fetches the document
  with no conversion.
- `score` is a number. A larger number ranks higher.
- `snippet` is plain text, or an empty string. Render it as text, never as HTML.

Hits come back in rank order. Equal scores sort by `collection`, then by
`path`. A page shorter than `limit` is the last page. The provider returns the
hits ranked after the `cursor` ref. If the ref is no longer in the results, the
provider throws `SearchError('invalid-query')`, and the caller starts again at
page 1.

Core refuses a bad request before the provider runs: an empty query, a query
over 256 characters, a bad `limit`, `collections`, `filters` or `cursor`. The
error code is `invalid-query`.

### Errors

Search throws `SearchError` (`@tinacms/tinacms` and `@tinacms/tinacms/client`).
Check the `code`, never the message.

| Code | Status | Meaning |
|---|---|---|
| `invalid-query` | 422 | The request is not valid. |
| `unsupported` | 422 | The provider does not support a filter. |
| `unavailable` | 503 | The backend is not reachable, or the site has no `search/query` route. |
| `backend-failure` | 502, 500 | Any other failure. A throw that is not a `SearchError` answers 500, and its message never reaches the response. |

## Search on the website

A website is the main user of search. `createSearchClient`
(`@tinacms/tinacms/client`) gives the same `search` call over Capability RPC. It
needs no session, so an anonymous visitor can search the published content.

```ts
import { createSearchClient } from '@tinacms/tinacms/client';

const { search } = createSearchClient({ rpcUrl: '/api/tina' });

const hits = await search('release notes', { limit: 10, collections: ['post'] });
```

Then fetch each hit through `content`, and drop the hits whose document is
gone. Do not render the index text as content.

- Browser code passes the site-relative `rpcUrl` (`/api/tina` by default).
  Server code passes an absolute URL.
- The RPC handler adds no CORS headers. A browser calls search from the same
  origin as the handler only.
- In local development, the site's mounted RPC handler serves `search/query`.
  The Local Data Layer's Vite plugin serves only `content/update`. Mount the
  handler route, or local search fails with `unavailable`.
- `search/query` is a `publicOp`: it needs no session. Every field in `fields`
  becomes searchable by anyone. Rate limiting the route is the job of the host.

## Write a provider

`defineSearchPlugin` (`@tinacms/tinacms`) turns a server module and the
searchable fields into a plugin. It supplies the client slice, the public
`search/query` op, the save-time indexing hook and the shape checks.

```ts
// tina/config.ts
import { defineConfig, defineSearchPlugin } from '@tinacms/tinacms';

const acmeSearch = (options: { fields: Record<string, Record<string, number>> }) =>
  defineSearchPlugin({
    name: 'acme:search',
    fields: options.fields,
    server: () => import('./acme-search.server'),
  });

export default defineConfig({
  plugins: [
    acmeSearch({
      fields: {
        post: { title: 3, excerpt: 2, body: 1 },
        page: { title: 3, body: 1 },
      },
    }),
  ],
  schema: { collections: [/* ... */] },
});
```

The server module is the only place that holds the keys of the backend (ADR-015).
Its default export is a `SearchIndexProvider`:

| Method | Role |
|---|---|
| `query({ query, collections?, filters?, limit, cursor? })` | Returns the hits. |
| `upsert(records)` | Adds or replaces these documents. |
| `replace(records)` | Makes the index exactly these documents. |

Only core calls `upsert` and `replace`, in the same process. No HTTP route
reaches them. Import the types from `@tinacms/tinacms/server` with `import type`
only, because that entry loads a node-only module. The server module must
import no node module that a browser build could reach.

### Records

A provider gets records, never raw documents. A `SearchRecord` is
`{ ref, fields: { name, weight, text }[] }`.

- `text` is plain text. A string field is used as it is. A rich-text field
  arrives as source text (MDX or markdown), or as a rich-text tree. Core reads
  the source with the codec of the collection format, then flattens the text
  leaves in document order, with a newline after each block. The text of a
  component's `children` prop is included. Other component props, image alt
  text, link URLs and markdown syntax are left out. Raw HTML adds its visible
  text: comments and `<script>` and `<style>` elements go with their contents,
  and every other tag goes with its attribute values. A block tag such as `<p>`
  or `<td>` leaves a space, and any other tag leaves nothing, so `H<sub>2</sub>O`
  reads `H2O`. Then `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, `&apos;`,
  `&nbsp;` and numeric entities decode. Other entities, such as `&copy;`, stay
  as written. A `<` that starts no tag stays as visible text. Runs of spaces
  collapse to one space. A rich-text field
  that does not parse fails the save hook (one after-save warning) and the
  reindex (exit 1, naming the file). Core never indexes its raw source.
- An empty field is left out of `fields`. A record is always sent for a saved
  document, even with no fields, so the provider replaces the old entry.

### Searchable fields

`fields` maps a collection name to its searchable fields, and each field to a
weight (a finite number above 0). A field is searchable when it is a top-level
`string` or `rich-text` field. Any other type fails `tinacms codegen` with a
message that names the plugin, the collection and the field. An unknown
collection, an unknown field and a bad weight fail the same way.

`fields` is provider config. It is not written to `tina-lock.json`. A
collection in `fields` that lists no `searchIndex()` is allowed. Only
`tinacms search reindex` feeds its index.

### Example provider

This provider keeps its index in memory. It is a test fixture. Its index lives
in one process, so `tinacms search reindex`, which runs in another process,
cannot fill it. A real provider talks to a service.

```ts
// acme-search.server.ts
import {
  SearchError,
  type SearchHit,
} from '@tinacms/tinacms';
import type {
  SearchIndexProvider,
  SearchRecord,
} from '@tinacms/tinacms/server';

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
      throw new SearchError('invalid-query', 'The cursor is no longer in the results.');
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
```

## Keep the index current

### On save

List `searchIndex()` in the `hooks` of a collection to index its saves.

```ts
import { searchIndex } from '@tinacms/tinacms';

export const post = {
  name: 'post',
  path: 'content/posts',
  format: 'mdx',
  hooks: [searchIndex()],
  fields: [/* ... */],
};
```

The collection must be in `fields`, or codegen fails.

- The hook indexes a save only when the save lands on the default branch of the
  content provider. A save to a working branch indexes nothing. A local save
  indexes nothing, because the Local Data Layer has no branches. Search covers
  the published content only (ADR-021 §3).
- The hook uses the permission the save already needed. An `editor` save
  indexes the document.
- When `upsert` throws, the save stays and the editor sees one after-save
  warning.
- `searchIndex()` makes the collection server-hooked (ADR-028). Its saves go
  through the Backend, so a site with no server runtime cannot save the
  collection. Leave the hook off, and use `tinacms search reindex` instead.
- Core has no hook for a delete or a rename. A removed document leaves the index
  on the next reindex. The re-fetch rule hides it until then.

### Reindex

```sh
tinacms search reindex [--root <dir>] [--config <path>]
```

The command reads every document of each collection in `fields` from the
checkout, and calls `replace` once. It prints the number of documents for each
collection, then the total.

- Run it on a checkout of the default branch. That is the published content.
- Set `--root` to the root that the content provider uses. A different root
  gives different paths, and one document gets two index entries.
- It runs `onInit` of every plugin before the reindex, and `onDestroy` after. A
  plugin whose `onInit` needs a browser fails the command.
- It exits 1, and never calls `replace`, when no plugin provides `search`, the
  plugin has no index provider, a document does not parse, a searchable
  collection has no `path`, or no collection has a document.
- It reads each file as the collection that owns it for `content.list`: the
  collection with the deepest matching `path`. A folder nested inside a
  searchable collection, which belongs to another collection, is not indexed
  as part of the parent.
- It accepts `--root`, `--config` and `--help`. Any other flag, including
  `--check`, exits 1: reindex always writes the index. An argument after
  `reindex`, such as `tinacms search reindex extra`, exits 1 with
  `Unexpected argument "extra".`

## In the admin

The Search dialog calls `search(query, { limit: 10 })` 250 ms after the last
keystroke. It re-fetches each hit through `content` on the current branch. It
drops a hit whose document is gone, and shows the title and the
snippet of the others. The title is the `title` of the entry, else the `title` value of the document, else the path. A hit does not open the document. Without a search
plugin, the dialog still finds screens.

## A plugin without the helper

A plugin can provide `search` with a hand-written slice that has a `search`
function. Then the plugin supplies the query contract only: no save-time
indexing and no reindex. A slice with no `search` function fails at boot with
`search-provider-shape`. A `defineSearchPlugin` plugin whose server module lacks
`query`, `upsert` or `replace` fails when the server composes, with the same
code.
