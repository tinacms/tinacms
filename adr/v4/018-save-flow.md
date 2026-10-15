# ADR-018: Save Flow

## Status
**Accepted** — resolves the **save-path** question deferred by [ADR-015](./015-execution-boundary.md). Builds on [ADR-004](./004-git-editorial-workflow.md) (git inside the Data Layer), [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (Capability RPC / Backend), [ADR-008](./008-authorization-permissions-roles.md) (enforcement), [ADR-010](./010-form-state-model.md) (reconstruct), [ADR-014](./014-document-lifecycle-hooks.md) (`beforeSave`/`afterSave`), and [ADR-017](./017-content-model.md) (Format adapters).

## Context
ADR-015 flagged "the save path" as an open dependency: whether content writes route **Client → Backend → Data Layer** or **Client → Data Layer directly** — which decides where enforcement lives, and therefore what custom logic can run on managed TinaCloud. This ADR resolves it and pins what is **v4 core** versus what belongs to the **Data Layer**.

## Decision

### 1. Content writes go Client → Data Layer directly (path A)
The `content` capability's provider **is the Data Layer** — *not* a Backend plugin server segment. (Media/search/custom RPC go through Backend server segments; the **content write hits the Data Layer directly**, authenticated.) **Enforcement of the content write lives at the Data Layer write point:**
- **Declarative validation + permissions** → enforced **everywhere**, including TinaCloud (they're in `tina-lock.json`).
- **Custom `beforeSave` enforcement** → runs only where custom code runs *at the write point* = a **self-hosted Data Layer**. On TinaCloud the write is direct and first-party, so custom `beforeSave` is **client-UX only** there.
- **Escape hatch:** a client `beforeSave` may be **async and call the user's Backend** (a Server segment via Capability RPC) — so custom save-time server *logic* is available even on TinaCloud, but it stays **advisory/UX** (client-orchestrated, bypassable), not enforcement.

### 2. The core save is small
`reconstruct` the document from the address map + structure index (ADR-010) → run `beforeSave` (ADR-014) → **write the JSON content value** to the `content` capability → on success **mark clean**; on failure **stay dirty** (the draft is retained — never lose the edit) and **surface the error** (validation → field flags; permission → ADR-008; network → retry). `afterSave` observers then fire.

### 3. Serialization and git live *behind* the content write
The client sends the **JSON content value**; the Data Layer serializes it via the **Format adapter** (ADR-017) and performs all git. **What a save does to git is the Data Layer's call:**
- **Local Data Layer**: write the file to disk, uncommitted — **Tina runs no git locally**; the dev's own flow handles commits.
- **TinaCloud**: blackbox (its own branches/commits/PRs).
- **Self-Hosted**: its own implementation.

Commit granularity, branching, publish, squash, and PRs are therefore **not v4 core**.

### 4. Concurrency is not core; the contract merely allows it
Conflict detection is a **Data-Layer concern** (like granularity). Local emits none (single editor — overwrite). The **content contract permits a conflict response** (a write may carry a base reference and be rejected as stale), and the **client handles it gracefully** (refetch + prompt) if one ever comes back — but core **mandates no detection**.

## Consequences

### Positive
- The core save-flow is tiny and storage-agnostic; enforcement has one clear home (the Data Layer).
- Local dev is dead simple: write a file.
- The honest TinaCloud limit (custom enforcement ⇒ self-hosted) is explicit, with an advisory Backend escape hatch.
- Conflict-readiness costs nothing now and can't be cheaply retrofitted later.

### Negative
- Custom content-write *enforcement* requires self-hosting.
- Multi-user conflict behavior is undefined by core (delegated to the Data Layer), so it can differ across Data Layers.

## Alternatives Considered
- **Route content writes through the Backend (path B)** — *rejected* as the default: an extra hop, and only a true gate if the Data Layer refuses direct writes; an advanced self-hosting pattern, not the model.
- **Mandate conflict detection in core** — *rejected*: a Data-Layer concern; local is single-user.
- **Auto-commit-per-save in core** — *rejected*: git granularity is the Data Layer's call (ADR-004).

## References
- [CONTEXT.md](./CONTEXT.md) — `content` capability, Data Layer, Local Data Layer, Backend, Format adapter, Execution boundary
- [ADR-004](./004-git-editorial-workflow.md), [ADR-007](./007-full-stack-plugins-client-backend-segments.md), [ADR-008](./008-authorization-permissions-roles.md), [ADR-010](./010-form-state-model.md), [ADR-014](./014-document-lifecycle-hooks.md), [ADR-015](./015-execution-boundary.md), [ADR-017](./017-content-model.md)
