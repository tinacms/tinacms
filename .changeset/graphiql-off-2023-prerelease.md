---
"@tinacms/app": patch
---

Move the GraphQL playground off the 2023 `graphiql` pre-release (`3.0.0-alpha.1`) to `^4.1.2`.

The catalog pinned an exact alpha published four days before stable 3.0.0, so no downstream consumer could override it. It carried `@graphiql/react@0.18.0` → `markdown-it@12.3.2` → `linkify-it@3.0.3`, keeping GHSA-6v5v-wf23-fmfq (markdown-it) and GHSA-22p9-wv53-3rq4 / GHSA-v245-v573-v5vm (linkify-it) alive for everyone installing `@tinacms/app`.

Bumping `graphiql` alone was not enough: both `@graphiql/react` and `typedoc` declare `markdown-it: ^14.1.0`, and pnpm deduped that to `14.1.0` — below the `14.1.2` fix. A `markdown-it: ^14.3.0` override resolves both chains to patched versions (`markdown-it@14.3.0`, `linkify-it@5.0.2`).

`graphiql` 5 was evaluated and deliberately not taken: it replaces CodeMirror with a bundled Monaco (undoing the recent 73 MB `monaco-editor` removal, and requiring a `setup-workers` import that changes the Vite build contract for every consumer building `@tinacms/app` from source), and it drops the controlled `query` / `variables` props the playground's "Queries" sidebar depends on. Version 4 keeps CodeMirror and that prop contract, so the migration is the CSS import path plus one latent-bug fix.

`defaultTabs={[]}` is removed. An empty array is a valid-looking but impossible state — zero tabs — and v4 dereferences `tabs[activeTabIndex]` when recording history, so executing any query crashed the playground with "Cannot read properties of undefined (reading 'query')". v3 only survived it because a `??` short-circuit happened to skip the same lookup. Without the prop, GraphiQL creates the single default tab seeded from `query`/`variables`, which is what the playground wanted.
