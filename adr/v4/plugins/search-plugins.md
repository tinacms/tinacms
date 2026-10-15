# Search Plugins

> **Canonical sources:** [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md); [CONTEXT.md](../CONTEXT.md) for **Plugin**, **Capability**, **Capability RPC**.

A search plugin provides the **singleton `search` capability**. Indexing runs in the server segment (where it can read content and hold API keys); querying is exposed to the client via Capability RPC.

## Manifest

```ts
import { definePlugin } from 'tinacms'

export default definePlugin({
  name: 'algolia-search',
  provides: ['search'],
  dependsOn: ['content', 'auth'],       // reads content from the Data Layer; transport auth
  client: () => import('./client'),
  server: () => import('./server'),
  permissions: [
    { name: 'search:reindex', description: 'Trigger a full reindex' },
  ],
})
```

`search` is **singleton**: one provider per project. Two search plugins is a **Capability conflict** unless intentionally `overrides`-d.

## Server segment

```ts
// server.ts
import { defineServerPlugin, protectedOp, use } from 'tinacms/server'
import algoliasearch from 'algoliasearch'

const client = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_KEY!)
const index  = client.initIndex('content')

export default defineServerPlugin({
  async query(input: { q: string; collections?: string[]; limit?: number }) {
    const r = await index.search(input.q, { hitsPerPage: input.limit ?? 10, filters: collectionFilter(input.collections) })
    return { hits: r.hits, total: r.nbHits }
  },

  // Reindex is permission-gated and reads from the content capability
  reindex: protectedOp({ permission: 'search:reindex' }, async () => {
    const content = use('content')                     // in-process accessor
    const docs = await content.listAll()
    await index.replaceAllObjects(docs.map(toAlgoliaRecord))
  }),
})
```

`use('content')` is the **server→server capability accessor**: a server segment composes another capability's server segment in-process, without an HTTP hop. That is how a `search` plugin can call into whatever provides `content` (TinaCloud, self-hosted Data Layer, …) without knowing the implementation. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))

## Client segment

```ts
// client.ts
import { defineClientPlugin, server } from 'tinacms'

export default defineClientPlugin({
  slice: (set, get) => ({
    results: [],
    query: '',
    loading: false,

    async search(q: string, opts?: { collections?: string[] }) {
      set({ loading: true, query: q })
      const r = await server.search.query({ q, ...opts })   // typed RPC
      set({ results: r.hits, loading: false })
    },
  }),

  components: { SearchBar, SearchResults },
})
```

`server.search.query(...)` is typed end-to-end from the server segment's exported shape — no codegen, no shared interface.

## Reading search from elsewhere

A reference field that searches across collections depends on the *capability*:

```ts
definePlugin({
  name: 'reference-field',
  provides: ['field'],
  dependsOn: ['search'],                // any provider — algolia, meilisearch, local
  client: () => import('./client'),
})
```

```tsx
function ReferenceField() {
  const address = useFieldAddress()
  const [value, setValue] = useFieldValue<string>(address)
  const search = useTinaStore((s) => s.search.search)
  const results = useTinaStore((s) => s.search.results)
  // …
}
```

## Built-in providers

- **`localSearch()`** — in-memory full-text index over the Local Data Layer's content. Default for dev.
- **`tinaCloudSearch()`** — server-side index hosted by TinaCloud. Bundled with `tinaCloud()`.

Common third-party shapes:

- `algoliaSearch({ appId, adminKey })`
- `meilisearch({ host, apiKey })`
- `typesenseSearch({ nodes, apiKey })`

## When to reindex

The plugin owns the reindex strategy — most providers reindex on demand (`server.search.reindex(...)`), on content publish (subscribed via a `content` capability hook in the server segment), or scheduled. None of that is in v4 core.

## Related

- [Plugin System](../architecture/plugin-system.md)
- [Custom Plugins](./custom-plugins.md)
- [ADR-007](../007-full-stack-plugins-client-backend-segments.md), [ADR-008](../008-authorization-permissions-roles.md)
