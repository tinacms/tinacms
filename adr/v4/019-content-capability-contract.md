# ADR-019: Content Capability Contract

## Status
**Accepted** — defines the `content` capability whose substance was scattered across [ADR-015](./015-execution-boundary.md) (boundary), [ADR-016](./016-schema-compiled-artifact.md) (schema → GraphQL), [ADR-017](./017-content-model.md) (content model), and [ADR-018](./018-save-flow.md) (save flow). Builds on [ADR-011](./011-reference-fields.md) (references), [ADR-012](./012-form-lifecycle.md) (hydration), [ADR-013](./013-ui-extension-slots.md) (list views).

## Context
Every prior ADR leaned on the `content` capability, but none defined its **contract** — the operations, the read/query surface, the developer-facing shape, and (entirely untouched) the fact that content is *also the user's website's data API*. This ADR pins it down.

## Decision

### 1. Dual-consumer, asymmetric
One contract, two readers:
- **Admin UI** — reads (forms / lists / pickers) **and** writes.
- **Website** — **read-only** (rendering published content), query side only.

### 2. DX = a generated typed client over GraphQL
Wire format is **GraphQL generated from the schema** (ADR-016). The **primary surface is a generated typed client** (`client.queries.<collection>(…)`), typed from the same `tina-lock.json` that drives forms. **Raw GraphQL stays as an escape hatch**; nobody hand-writes it by default.

### 3. Reads are parameterized by `ref`; drafts are an overlay, not a mode
A read targets a **state**: **published** (main) for the website, a **preview branch** for staging, the **working branch** for the Admin UI. The **Data Layer resolves the ref** (it owns git); a **Local Data Layer** has no ref (just files on disk). **Drafts are not a content mode** — the editor's unsaved drafts (the `draft` capability, per-user/client) **overlay** content reads in the `Form`; `content` always returns the **saved** state. **Visual-editing metadata** (the **Field address**) optionally rides on read results so the website can emit click-to-edit markers (ADR-009).

### 4. Read operations + query surface
- **`get(collection, path)`** — one document.
- **`list(collection, { filter, sort, … })`** — **cursor-paginated** (Relay `edges`/`pageInfo`, not offset).
- **`filter`/`sort` operate only on indexed fields.** Indexes are **derived from usage at build** (statically-extracted content queries + the CMS list/reference config), with **manual declaration as an escape hatch** for dynamic queries. Build checks: **error** if a query needs a missing index (no silent prod-slow scan); **warn** on an index nothing queries (catch over-indexing).
- **content / `search` boundary:** `content` = structured, deterministic queries on indexed fields; the **`search` capability** (separate provider that indexes content) = full-text / relevance / typo-tolerant. They **compose** (search → ids → content fetch, or search returns docs).
- **Document system metadata.** Every document carries `createdAt` / `updatedAt` / `lastAuthor`, **always present** and **not content fields** — derived from **git** (log + blame) in production, **fs mtime** locally (no git ops run locally, per ADR-018). `list` can **sort/filter** on it, and the **default collection-list sort is `updatedAt` descending** so newly-created docs surface at the top (fixing "a new doc gets lost among thousands"). A collection may *also* declare a content-level date field for SEO/display — that's independent of this guaranteed system metadata. Field-level authorship (git-blame mapped to fields) is a possible future enhancement.

### 5. Write operations
GraphQL mutations, **Client → Data Layer directly, enforced at the Data Layer** (ADR-018):
- **`create(collection, path, value, template?)`** — `path` from an explicit slug or a **collection-configured slug pattern**; `template` picks a polymorphic collection's shape.
- **`update(collection, path, value, baseRef?)`** — the save; optional conflict base-ref (ADR-018).
- **`delete(collection, path)`** — **warn-and-allow**: surfaces referrers ("3 documents reference this"), proceeds on confirm; never a hard block.
- **`rename(collection, from, to)`** — **first-class and reference-aware** (preserves identity, updates referrers); *not* delete+create (ADR-017).
- `rename`/`delete` referrer lookup is a **reverse-reference query** — covered by the same index derivation (reference fields get a reverse index because these ops query referrers). Local scans; scaled Data Layers use the index.

### 6. Reference integrity
Deletes warn-and-allow; a **dangling reference** (target deleted/moved out-of-band) is **preserved and shown in an error state** (ADR-011) — recoverable, never silently cleared, and loading it never mutates the `Form`. **Surface, don't destroy or hard-block** — consistent with the git-native philosophy used throughout (ADR-012/017).

## Consequences

### Positive
- **One typed contract** serves both the editor and the website.
- Reads are **prod-safe** (derived indexes + build checks close the "works locally, breaks on TinaCloud" trap).
- Writes are **reference-aware with no new mechanism** (reverse lookup is just a derived index).
- Reference integrity is consistent with the rest of the system (surface, don't destroy).

### Negative
- Derived indexing is slightly "magic" and depends on build-time query extraction (escape hatch + build errors mitigate).
- The website's read path inherits the **ref/branch dimension** (preview infra is implied).

## Alternatives Considered
- **Raw GraphQL as the primary DX** — *rejected*: the typed client is the ergonomic, prod-safe default.
- **Drafts as a content read-mode** — *rejected*: drafts are a per-user client overlay; `content` stays the saved truth.
- **Hand-declared indexes as primary** — *rejected*: invites over-indexing (derivation + escape hatch preferred).
- **Block-on-referrer delete / silent-clear dangling refs** — *rejected*: un-git-native; silent data loss.

## References
- [CONTEXT.md](./CONTEXT.md) — `content` capability, Schema, `tina-lock.json`, Reference field, Unknown field, Execution boundary
- [ADR-011](./011-reference-fields.md), [ADR-012](./012-form-lifecycle.md), [ADR-013](./013-ui-extension-slots.md), [ADR-015](./015-execution-boundary.md), [ADR-016](./016-schema-compiled-artifact.md), [ADR-017](./017-content-model.md), [ADR-018](./018-save-flow.md)
