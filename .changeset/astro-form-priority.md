---
"@tinacms/astro": minor
"@tinacms/bridge": minor
---

Let the page hint which form the admin should focus when multiple are registered

`requestWithMetadata()` now accepts a second argument with a `priority` field — `'primary'` marks that call as the page's own document, so layout-level globals don't get focused over it. The bridge emits a `user-select-form` postMessage for the primary id (mirroring `useTina`'s `experimental___selectFormByFormId`), which the admin reducer already routes around its default selection. Server-side, the middleware and the island route both order `[data-tina-form]` payloads with primaries first, so any tooling reading them in DOM order picks the page form first too.

```ts
const post = await requestWithMetadata(
  client.queries.post({ relativePath: `${slug}.md` }),
  { priority: 'primary' },
);
const global = await requestWithMetadata(client.queries.global(...)); // secondary by default
```

If the same id is recorded more than once in a request (e.g. layout fetched the global, page-level loader fetched it again with `priority: 'primary'`), the existing entry is upgraded — order of calls doesn't strand the page's intent. Omitting `priority` keeps today's behavior (the admin's "first non-global wins" heuristic).
