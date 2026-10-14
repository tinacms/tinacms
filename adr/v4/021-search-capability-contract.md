# ADR-021: Search Capability Contract

## Status
**Accepted** — defines the *optional* `search` capability whose boundary was drawn by [ADR-019](./019-content-capability-contract.md) (`content` = structured / `search` = full-text). Builds on [ADR-014](./014-document-lifecycle-hooks.md) (`afterSave`), [ADR-015](./015-execution-boundary.md) (execution boundary), [ADR-016](./016-schema-compiled-artifact.md) (configured fields), and [ADR-018](./018-save-flow.md) (TinaCloud webhooks for committed events).

## Context
ADR-019 drew the content/search boundary but left `search` without a contract. Search differs from `content` **fundamentally**: `content` reads the source of truth (files/git); **`search` reads a derived, eventually-consistent index.** That difference drives the whole contract.

## Decision

### 1. Search is optional and website-first
`content` is mandatory (pickers, lists, references use it); **`search` is optional** — no provider means no search box, nothing else breaks. Its **primary consumer is the website** (published full-text / site search). The editor's everyday **"find a doc to edit" uses `content`-structured `list`** (title/path filter on the working branch), **not** `search`.

### 2. A derived, eventually-consistent index — results are refs
Search indexes content but **is not the truth**; the index **lags**. Results are `{ ref, score, snippet }`, and the UI **re-fetches from `content`** (strongly consistent) to display/edit. **Search results are hints, never authoritative content.**

### 3. Indexes published content (main)
**One index, the website's need.** Per-branch / draft full-text indexing is **deferred** (expensive); finding *unpublished* docs is done via `content`-structured `list` on the working branch. Consequence: **v4 cannot full-text-search unpublished/working content** (a recorded limitation).

### 4. The provider owns the index; it's fed server-side
The provider (first-party **TinaCloud**, or Algolia/Pagefind/self-hosted) maintains its index; **indexing is server-side** (API keys → Backend/self-hosted, ADR-015). It's fed by **committed events**: **TinaCloud webhooks** (ADR-018) for custom providers, **`afterSave`** (ADR-014) self-hosted, and a **`tina search reindex`** CLI for backfill/CI. First-party TinaCloud search indexes itself.

### 5. Searchable fields are configured, not derived
Unlike `content`'s derived structured indexes (ADR-019), full-text search is **curated** — you declare which fields are searchable plus weights/tokenization.

### 6. Query contract
```
search(query, { collections?, filters?, limit, cursor? }) → [{ ref, score, snippet }]
```
Text query **+ optional structured *narrowing* filters** (provider-dependent — a minimal provider does text only). Results **compose with `content`** (refs → `content` fetch for the real docs).

## Consequences

### Positive
- Optional and swappable; the website gets full-text; the editor's doc-finding stays fresh via `content` (no index lag).
- Indexing rides the **committed-event** mechanisms already defined (webhooks / `afterSave` / CLI) — no new machinery.
- Eventual consistency is **explicit** (results are hints, re-verified against `content`).

### Negative
- **No full-text search of unpublished/working content in v4** (deferred — per-branch indexing is the expensive thing).
- Custom providers need server-side indexing infra (Backend/self-hosted).
- The index can be stale (mitigated by re-fetch-from-`content`).

## Alternatives Considered
- **Per-branch / draft full-text indexing** — *deferred*: expensive; `content`-structured `list` covers editor doc-finding.
- **Search as mandatory** — *rejected*: `content` covers structured needs; search is opt-in.
- **Treat search results as content** — *rejected*: eventually-consistent; must re-verify.
- **Derived searchable fields** — *rejected*: search is curated (weights/tokenization).

## References
- [CONTEXT.md](./CONTEXT.md) — `content` capability, Execution boundary, Field plugin
- [ADR-014](./014-document-lifecycle-hooks.md), [ADR-015](./015-execution-boundary.md), [ADR-016](./016-schema-compiled-artifact.md), [ADR-018](./018-save-flow.md), [ADR-019](./019-content-capability-contract.md)
