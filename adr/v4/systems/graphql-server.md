# GraphQL Server — the `content` capability

> **Canonical sources:** [CONTEXT.md](../CONTEXT.md) (`content` capability, Data Layer, TinaCloud, Self-Hosted, Local); [ADR-004](../004-git-editorial-workflow.md) (amended by ADR-007), [ADR-007](../007-full-stack-plugins-client-backend-segments.md).
>
> **Naming note.** "GraphQL Server" is *not* a top-level system in v4. It is the **wire-format implementation of the `content` capability**, exposed by whichever **Data Layer** the project is using. ([CONTEXT.md `content` capability](../CONTEXT.md))

## What it is

The **Data Layer** is the GraphQL content API. Three implementations:

| Implementation | Hosts | Persistence | Auth |
|---|---|---|---|
| **TinaCloud** (hosted) | Tina | TinaCloud's content store + GitHub sync engine | TinaCloud-managed `editor`/`admin` |
| **Self-Hosted Data Layer** | user | user's own datastore + git | user-chosen auth provider |
| **Local Data Layer** | user, dev | in-memory query index over on-disk files | trusted local session |

All three speak GraphQL — that is the wire format of the `content` capability. The Admin UI is unaware which one is on the other end.

## What lives inside it (and what doesn't)

**Lives inside the Data Layer:**

- The GraphQL schema (built from `defineConfig({ schema })`)
- Read/write resolvers against content files
- **Git operations** — branch, commit, publish — as an implementation detail. ([ADR-004 amendment](../004-git-editorial-workflow.md))
- Branch-aware reads/writes
- Search indexing hooks (if the Data Layer chooses to fan out to a `search` provider)

**Does *not* live inside the Data Layer:**

- Plugin **Server segments** — those run on the **Backend** (the user's app server), not on TinaCloud and not in the Data Layer. ([ADR-007](../007-full-stack-plugins-client-backend-segments.md))
- The Zustand store — that's client-only.
- The Admin UI.
- Per-framework adapters (`tinacms/next`, `tinacms/express`) — those mount the *RPC handler*, not the Data Layer.

## How the Admin UI talks to it

GraphQL over HTTP, queries generated from `defineConfig({ schema })`:

```ts
// Conceptual — the actual generated client comes from codegen
const post = await content.query(`
  query Post($relativePath: String!) {
    post(relativePath: $relativePath) {
      title
      body
    }
  }
`, { relativePath: 'hello.mdx' })
```

The endpoint is configured per Data Layer:

- **TinaCloud**: hosted endpoint with the project's token.
- **Self-Hosted**: a route exposed by the user's deployment.
- **Local**: an in-process handler the local dev server mounts.

## Schema → resolvers

The content schema (`defineConfig({ schema: { collections: [...] } })`) drives type generation:

```ts
defineConfig({
  schema: {
    collections: [
      defineCollection({
        name: 'post',
        path: 'content/posts',
        format: 'mdx',
        fields: [
          t.string({ name: 'title', label: 'Title', required: true }),
          t.richText({ name: 'body', label: 'Body' }),
        ],
      }),
    ],
  },
})
```

The Data Layer builds GraphQL types and resolvers from this; codegen produces typed client queries (see [Code Generation](./code-generation.md)).

## Local Data Layer

For local development:

- **Query index is in-memory** — built from on-disk content at startup, kept fresh by a file watcher.
- **Writes persist to the real files.** Default: leave them as uncommitted working-tree changes (the dev's normal git flow commits when they want). Auto-commit/branch/publish belongs to the production Data Layers, not the local one. ([CONTEXT.md ambiguity #5](../CONTEXT.md))
- The dev server hosts the GraphQL endpoint locally.

## Editorial-workflow concepts live here

Branch, commit, and publish are operations on the `content` capability — exposed as part of the Data Layer's GraphQL surface (or via auxiliary endpoints), not as a separate "git system":

```ts
// Conceptual GraphQL mutations on the content capability
mutation { createBranch(name: "cms/new-post") { name } }
mutation { saveDocument(input: { … }) { id } }
mutation { requestPublish(branch: "cms/new-post") { prUrl } }
```

The Admin UI never shells out git. See [Editorial Workflow](./editorial-workflow.md). ([ADR-004 amendment](../004-git-editorial-workflow.md))

## What about the Backend?

The **Backend** is the user's own app server (Next, Express, …). It hosts plugin **Server segments** as routes, mounted by `tinacms/next` (or equivalent). It is *not* the Data Layer:

- A Backend handles **Capability RPC** routes (`/tina-rpc/media.upload`, etc.).
- A Data Layer handles **GraphQL content** queries (`/tina-graphql` or a hosted equivalent).

Both routes can be served by the same deployment for a self-hosted setup. For TinaCloud setups, `content` is hosted by TinaCloud while RPC routes still live on the user's Backend.

## Open

- **`content` capability contract ADR** — there is no ADR yet that pins down the shared interface across the three Data Layer implementations. Tracked as the likely next decision in the [README](../README.md).

## Related

- [Editorial Workflow](./editorial-workflow.md) — what branch/publish look like
- [Code Generation](./code-generation.md) — typed clients from the schema
- [ADR-004](../004-git-editorial-workflow.md), [ADR-007](../007-full-stack-plugins-client-backend-segments.md)
- [CONTEXT.md](../CONTEXT.md) — `content` capability, Data Layer
