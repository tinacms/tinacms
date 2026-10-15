# ADR-026: Draft Persistence in the Form Store

## Status
**Proposed**. Amends [ADR-012](./012-form-lifecycle.md) §6 (drafting as a `draft` capability) and its rejected alternative "core-only drafting", [ADR-014](./014-document-lifecycle-hooks.md) (the draft plugin as an `onChange`/`afterSave` consumer), [Persistence](./store/persistence.md) (form values not persisted), and ADR-012 §3's prompted restore, which becomes an automatic restore rebased onto the fetched document.

## Context
Editors lose unsaved edits on reload, tab close, a crash, or a login redirect. ADR-012 §5 already keeps dirty edits in memory across in-app navigation, but nothing survives a page load. ADR-012 §6 assigned durable drafts to a swappable `draft` capability whose default is in-memory only, so v4 ships with no durable drafts at all.

The v4 form store (ADR-010) already holds every open form as `values` plus a `baseline`, keyed by `formId` and flat by top-level address. Persisting that state is a small change to one store. Building a `draft` capability first means a capability contract, a default provider, and a plugin, before any editor gets a restored draft. [tinacms#6913](https://github.com/tinacms/tinacms/issues/6913) asks for the smaller path.

## Decision

### 1. The form store persists drafts
The form store wraps Zustand's `persist` middleware under its own storage key (`tina-drafts`), separate from the main store's `tina-store`. `partialize` keeps only **dirty** forms, and for each one only `values` and `baseline`. Pristine and clean forms are never written. Field equality functions are not serializable, so they are re-attached when the form registers.

Because the store is flat by top-level address, nested objects, lists and blocks persist with their top-level field. No per-field-type work is needed.

### 2. Restore is automatic, rebased onto `content`
On open, `content` is still the base. If a draft exists for the `formId`, the form opens on it with no prompt and stays dirty. When the draft's `baseline` no longer matches the fetched document (another writer saved meanwhile), the draft is **rebased**: only the fields the editor changed are carried onto the fetched document, and the fetched document becomes the new `baseline`. A save therefore never reverts a field someone else saved. A field both sides changed keeps the editor's value.

### 3. Save and discard clear the draft
A successful save marks the form clean (ADR-018) and removes its draft. A failed save keeps it. An explicit Discard (ADR-012 §5) removes it.

### 4. Draft events are deferred
No draft lifecycle events ship yet. Nothing consumes them today, and code that needs to react to drafts can observe the form store directly. When a concrete listener appears, events (`created`, `updated`, `saved`, `discarded`) are added as **observers** beside the ADR-014 hooks: a listener cannot change the outcome, and a throwing listener is logged.

### 5. The swap point is the storage adapter
`persist` takes a `storage` option. `localStorage` is the default; IndexedDB, `sessionStorage`, or a server-backed adapter can replace it without touching the form store. A full `draft` capability (edit history, collaborative editing) remains possible later and would build on this storage, not replace it.

## Consequences

### Positive
- Durable drafts ship in core for every deployment, not only TinaCloud.
- Dirty, save, and draft state share one source (the form store), so they cannot drift apart.
- Nested and block fields are covered with no per-type work.
- A restored draft never reverts another writer's save to a field the editor did not touch.

### Negative
- Drafts in `localStorage` are per browser, not per user: a shared machine shares drafts. A storage adapter keyed by identity fixes this later.
- `localStorage` has a size limit (about 5 MB), which large rich-text documents could reach.
- The draft shape becomes a stored format; changing it needs `persist`'s `version` and `migrate`.
- A field both the editor and another writer changed resolves to the editor's value with no warning.
- A form that is open and dirty while another writer saves is not rebased until it registers again (for example, on reload).

## Alternatives Considered
- **`draft` capability first (ADR-012 §6)**: *deferred*. More moving parts before any editor benefits; the storage adapter keeps the swap open.
- **Prompted restore (ADR-012 §3)**: *deferred*. The rebase removes the silent-revert risk the prompt guarded against; a prompt for true same-field conflicts can come later.
- **Draft always wins**: *rejected*. Restoring the full draft over a changed document reverts the other writer's fields on the next save.
- **Persist every open form**: *rejected*. Pristine forms would race with `content` on reload, the concern [Persistence](./store/persistence.md) raised.

## References
- [tinacms#6913](https://github.com/tinacms/tinacms/issues/6913)
- [ADR-003](./003-zustand-state-management.md), [ADR-010](./010-form-state-model.md), [ADR-012](./012-form-lifecycle.md), [ADR-014](./014-document-lifecycle-hooks.md), [ADR-018](./018-save-flow.md)
