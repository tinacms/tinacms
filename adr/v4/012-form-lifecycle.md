# ADR-012: Form Lifecycle — Discovery, Lazy Loading, Hydration, Teardown

## Status
**Accepted**, amended by [ADR-026](./026-draft-persistence-in-form-store.md): durable drafts persist in the core form store, not a `draft` capability; §6, the rejected "core-only drafting" alternative, and §3's prompted restore are superseded; a restored draft opens automatically, rebased onto the fetched document. Builds on [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (lazy segments), [ADR-009](./009-field-plugins.md) (field plugins + addressing), [ADR-010](./010-form-state-model.md) (form state), and [ADR-004](./004-git-editorial-workflow.md) (committed history). Refines ADR-007's "client segments composed once at boot" by carving out field plugins.

## Context
Opening a document's **Form** must resolve *which* field plugins to load, fetch the document value, and build a `formId` scope — without shipping every field type to every form, and without losing an editor's in-progress work on navigation or close. ADR-007 said client segments compose *once at boot*; field plugins — per-instance, schema-driven, and stateless (ADR-010) — need *lazy, per-form* loading, which on its face contradicts that and must be reconciled.

## Decision

### 1. Two classes of client segment
- **Capability-provider plugins** (`media`, `auth`, `search`, `draft`) own a Zustand slice → composed **once at boot** (ADR-007 unchanged).
- **Field plugins** own **no slice** (ADR-010). Boot registers only a **`type → () => import()` map**; their component modules load **lazily, per form**. The plugin *list* stays static (ADR-003/007); only *which field modules are imported* is dynamic — and since fields have no slice, there is nothing to compose into the store anyway.

### 2. Discovery is schema-driven
`document → collection → schema → the set of field types`. The loaded set is **schema-bounded, prefetched on form-open** (so adding any schema-allowed block never waterfalls), with a **per-template lazy escape hatch** for heavy/rarely-used blocks.

### 3. Loading is a `content` concern; fields never load, only render
A runtime form-loader owns it. Form-open: discovery → **lazy-import the needed field types ∥ fetch the value** → flatten into a new `formId` scope → render. The **value source is pluggable**: `content` by default, or another capability (e.g. a `draft` snapshot on restore).

**Hydration precedence (pluggable source — resolving ADR-012's owed "pluggable hydration source" seam):** `content` is always the authoritative **base**; the `draft` capability is an **overlay**, never silent.
- **Explicit history-restore** → the loader hydrates from the *chosen* draft snapshot (user-initiated).
- **Reopen with an existing local draft** → the loader hydrates from `content` and **offers** resume (a "Resume your unsaved edits?" banner), which is also where **staleness** is surfaced ("the document changed since your draft"). Auto-resume (no prompt) is a possible *per-provider* option later, not the default.

### 4. Hydration + drift
The incoming value is flattened into the address map + structure index (ADR-010).
- **Missing** schema fields → the field plugin's **declared default**.
- **Unknown** document data (no schema entry) → **preserved untouched** (re-emitted verbatim on save), surfaced **read-only** in the sidebar as an **Unknown field**, resolved by a *developer* promoting it to a **Hidden field** (a code change; the sidebar offers a copy-paste snippet).
- **Never throw on open.** Content is the source of truth and outlives the schema (field removal, foreign frontmatter, hand edits, branch skew are routine). Strictness lives in a **dev/CI audit**, not the editor's open path.

### 5. Teardown
- **Navigate-away → backgrounds** the scope: it stays in the store, dirty edits retained, switching back restores exactly.
- **Explicit close → dirty-guard** (*Save / Discard / Cancel*) → GC. Only an explicit Discard drops edits.
- v4 allows **multiple top-level `formId` scopes** at once; v4.1 closes child reference-form scopes before their parent. Imported field modules stay cached (shared, no meaningful unload).

### 6. Drafting is a `draft` capability
Backgrounding, retention, and persistence of edits go through a **swappable `draft` provider** (default = in-memory + `beforeunload` guard, bundled in the **TinaCloud** plugin). Drafts are **pre-save, per-user, uncommitted** — distinct from committed/git history (ADR-004, owned by the **Data Layer**). Durable local drafts and **collaborative editing** are future provider swaps, not v4-core commitments. Diff/restore fall out of ADR-010's normalized-by-address store (diffing two snapshots = diffing two address→value maps).

## Required follow-on seams — now resolved
Drafting-as-a-plugin needed three seams this ADR owed; all are now designed:
1. **Pluggable hydration source** — resolved **above** (§3 Hydration precedence): `content` base + `draft` overlay, offer-resume, never silent.
2. **Document lifecycle hooks** — resolved in [ADR-014](./014-document-lifecycle-hooks.md): `onChange` / `beforeSave` (transform+veto) / `afterSave`, client-UX vs server-enforcement, publish out-of-band.
3. **UI extension slots** — resolved in [ADR-013](./013-ui-extension-slots.md): fixed first-party, typed, fan-in slots; boot-composed; permission-gated; bulk queries for list decorations.

## Consequences

### Positive
- The bundle ships only the field types a form actually uses.
- Loading is predictable (schema-bounded prefetch); diff / dirty-tracking / restore fall out of ADR-010.
- Drafting and (later) collaboration are provider swaps, not rewrites.

### Negative
- ADR-007's boot-composition rule now has a **documented exception** (field plugins).
- The form-loader carries discovery + parallel-load orchestration.
- Three new extension seams are now owed before the draft plugin can ship.

## Alternatives Considered
- **Strict content-driven loading (B-only)** — *rejected*: waterfalls on "add block."
- **Hard-throw on schema/content drift** — *rejected*: bricks valid git-native content.
- **Core-only (non-plugin) drafting** — *rejected*: forecloses durable/collaborative providers.

## References
- [CONTEXT.md](./CONTEXT.md) — Form, Field address, Field plugin, Unknown field, Hidden field, `draft` capability
- [ADR-004](./004-git-editorial-workflow.md), [ADR-007](./007-full-stack-plugins-client-backend-segments.md), [ADR-009](./009-field-plugins.md), [ADR-010](./010-form-state-model.md)
