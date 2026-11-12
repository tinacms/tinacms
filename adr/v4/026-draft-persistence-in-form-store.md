# ADR-026: Draft Persistence in the Form Store

## Status
**Proposed**. Amends [ADR-012](./012-form-lifecycle.md) §6 (drafting as a `draft` capability) and its rejected alternative "core-only drafting", [ADR-014](./014-document-lifecycle-hooks.md) (the draft plugin as an `onChange`/`afterSave` consumer), [Persistence](./store/persistence.md) (form values not persisted), and ADR-012 §3's prompted restore, which becomes a Resume the editor picks, with waiting copies kept until Resume or a confirmed Discard.

## Context
Editors lose unsaved edits on reload, tab close, a crash, or a login redirect. ADR-012 §5 already keeps dirty edits in memory across in-app navigation, but nothing survives a page load. ADR-012 §6 assigned durable drafts to a swappable `draft` capability whose default is in-memory only, so v4 ships with no durable drafts at all.

The v4 form store (ADR-010) already holds every open form as `values` plus a `baseline`, keyed by `formId` and flat by top-level address. Persisting that state is a small change to one store. Building a `draft` capability first means a capability contract, a default provider, and a plugin, before any editor gets a restored draft. [tinacms#6913](https://github.com/tinacms/tinacms/issues/6913) asks for the smaller path.

## Decision

### 1. The form store persists drafts
`syncDrafts` writes dirty forms to `localStorage` under a key per document, separate from the main store's `tina-store`. When an editor signs in, `draftKey` scopes the key to `user.id` (`tina-drafts@<encodeURIComponent(userId)>:<formId>`). Without an auth plugin, `draftKey` uses `tina-drafts:<formId>`. While auth is loading, signed out, or forbidden (`userId === null`), the store skips draft reads and writes. Only **dirty** forms are written, and for each one only `values` and `baseline`. Pristine and clean forms are never written. When the active `userId` changes, `useFormStore` clears its in-memory `forms` so another editor on a shared browser never inherits open edits. Field equality functions are not serializable, so they are re-attached when the form registers.

Because the store is flat by top-level address, nested objects, lists and blocks persist with their top-level field. No per-field-type work is needed.

### 2. Opening never restores; the editor picks Resume
A document has a **live copy** (what the form holds now, under the key above) and an ordered list of **waiting copies** (under the same key plus `#waiting`, oldest first). Opening a document shows the file. A stored live copy found on open is appended to the waiting list, and the live key is freed only after that write is confirmed. A copy equal to the file holds nothing unsaved and is removed. When every waiting copy equals what the form holds, they are all removed once the live copy is written, because Resume has nothing to add. While any copy waits, a toast offers Resume and Discard, and the form stays editable. The toast shows once per document per page load: when the editor leaves the document, its copies keep waiting and the Status bar still says the edits are kept, but the toast does not come back until reload or until a new copy joins the waiting list.

Resume applies the waiting copies oldest to newest over the file, then puts what the form holds on top, so a field typed since opening keeps the typed value. Every value that loses stays in a **leftover** copy, and Resume on a leftover swaps it with the form's value without dropping either. Resume writes the result as the live copy and removes the waiting copies only after that write is confirmed.

### 3. Only a confirmed Discard or a good Save removes typed values
A good save removes the live copy and leaves every waiting copy. A failed save removes nothing. Discard in the toast asks first and removes waiting copies only. Discard unsaved edits (ADR-012 §5) removes the live copy only. A write that fails removes nothing and shows one warning, and no screen says the edits are kept in the browser unless the live copy was confirmed written. Rows of the full contract are in the v4 admin spec ("Draft recovery contract").

### 4. Draft events are deferred
No draft lifecycle events ship yet. Nothing consumes them today, and code that needs to react to drafts can observe the form store directly. When a concrete listener appears, events (`created`, `updated`, `saved`, `discarded`) are added as **observers** beside the ADR-014 hooks: a listener cannot change the outcome, and a throwing listener is logged.

### 5. The swap point is the storage adapter
`persist` takes a `storage` option. `localStorage` is the default; IndexedDB, `sessionStorage`, or a server-backed adapter can replace it without touching the form store. A full `draft` capability (edit history, collaborative editing) remains possible later and would build on this storage, not replace it.

## Consequences

### Positive
- Durable drafts ship in core for every deployment, not only TinaCloud.
- Dirty, save, and draft state share one source (the form store), so they cannot drift apart.
- Nested and block fields are covered with no per-type work.
- Opening never applies a draft, so a stored draft never reverts another writer's save.
- Typed values are removed only by a good Save or a confirmed Discard.

### Negative
- Unauthenticated projects (`userId === undefined`) still share `tina-drafts:<formId>` keys across the browser.
- `localStorage` has a size limit (about 5 MB), which large rich-text documents could reach.
- The draft shape becomes a stored format; changing it needs `persist`'s `version` and `migrate`.
- Two browser tabs writing one document's live copy: last write wins on the live copy. Waiting copies are not shared between tabs' memory.
- Copies are kept until Resume or Discard; there is no quota policy.

## Alternatives Considered
- **`draft` capability first (ADR-012 §6)**: *deferred*. More moving parts before any editor benefits; the storage adapter keeps the swap open.
- **Automatic restore on open**: *rejected*. Review rounds found it loses typed values when a draft and a typed edit collide.
- **Draft always wins**: *rejected*. Restoring the full draft over a changed document reverts the other writer's fields on the next save.
- **Persist every open form**: *rejected*. Pristine forms would race with `content` on reload, the concern [Persistence](./store/persistence.md) raised.

## References
- [tinacms#6913](https://github.com/tinacms/tinacms/issues/6913)
- [ADR-003](./003-zustand-state-management.md), [ADR-010](./010-form-state-model.md), [ADR-012](./012-form-lifecycle.md), [ADR-014](./014-document-lifecycle-hooks.md), [ADR-018](./018-save-flow.md)
