This is a [Tina CMS](https://tina.io/) project for E2E testing.

Tips: If you are writing playwright Test
The recommended way to debug your test is through playwright [VS code extension](https://playwright.dev/docs/debug)

Run the test manually

1. In playwright/tina-playwright directory run 'npx playwright test' locally to run the e2e test

You can also run test in UI mode for test debugging purpose

1. In playwright/tina-playwright directory run 'npx playwright test --ui'

⚠️ Note

- Create blog post test required the example project to have no blog post in order to past the test(Dont create any blog post manually in this tinacms project)

## Projects

`playwright.config.ts` defines three projects:

| Project | Target | Runs browser? |
|---|---|---|
| `chromium` | UI tests against the Next.js dev server on `http://localhost:3000` | Yes |
| `posthog` | PostHog telemetry tests; depends on `chromium` | Yes |
| `api` | GraphQL / HTTP integration tests against the TinaCMS dev server on `http://localhost:4001` | No |

Run a single project:

```bash
npx playwright test --project=api         # HTTP-boundary tests, no browser
npx playwright test --project=chromium    # UI tests
npx playwright test                       # everything
```

## API test suite (`tests/api/`)

Integration tests hitting the live dev server at the HTTP boundary. No browser, no mocks — real LevelDB, real filesystem, real request/response.

| Spec | Covers |
|---|---|
| [`document-crud.spec.ts`](tests/api/document-crud.spec.ts) | `createDocument` / `updateDocument` / `deleteDocument` lifecycle across `.md` / `.mdx` / `.json` |
| [`filtering.spec.ts`](tests/api/filtering.spec.ts) | `postConnection(filter:)` against real LevelDB |
| [`pagination.spec.ts`](tests/api/pagination.spec.ts) | Cursor pagination — `first`, `after`, `hasNextPage` |
| [`sorting.spec.ts`](tests/api/sorting.spec.ts) | Index freshness on create/update/delete; ascending/descending ordering |
| [`search.spec.ts`](tests/api/search.spec.ts) | `/searchIndex` route — field indexing and query precision |
| [`security.spec.ts`](tests/api/security.spec.ts) | Path-traversal rejection on `createDocument` and `/media/upload`, no filesystem leak in error bodies |
| [`media.spec.ts`](tests/api/media.spec.ts) | `/media` upload → list → delete round-trip |
| [`concurrency.spec.ts`](tests/api/concurrency.spec.ts) | `AsyncLock`-serialised mutations survive parallel contention without index corruption |

### Shared infrastructure

- [`fixtures/api-context.ts`](fixtures/api-context.ts) — pre-configured `APIRequestContext` for the GraphQL and `/media` endpoints
- [`fixtures/test-content.ts`](fixtures/test-content.ts) — extends `api-context` with two cleanup fixtures:
  - `contentCleanup.track(collection, relativePath)` — auto-deletes documents created during a test
  - `mediaCleanup.track(relativePath)` — auto-deletes uploaded media
  Both fixtures check on-disk state first so teardown doesn't double-delete files the test itself already removed.
- [`utils/graphql.ts`](utils/graphql.ts) — shared GraphQL mutation strings plus `createDocument` / `updateDocument` / `deleteDocument` / `gqlRequest` helpers; exports a `CollectionName` union that matches `tina/collections/`
- [`utils/media.ts`](utils/media.ts) — `uploadMedia` / `listMedia` / `deleteMedia` helpers; `uploadMedia` accepts a `rawPath: true` option for pre-encoded path traversal vectors
