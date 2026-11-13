# ADR-030: Save Scope: Save Document and Save All

## Status
**Accepted** (2026-11-13). Approved by Josh Berman, Eli Wicksy, Ivan and Brook. Clarifies [ADR-011](./011-reference-fields.md) §2 ("save stays single-document"). Builds on [ADR-010](./010-form-state-model.md) (one form per document), [ADR-018](./018-save-flow.md) (the core save) and [ADR-026](./026-draft-persistence-in-form-store.md) (drafts survive reload).

## Context
ADR-011 §2 says: "Because each `Form` is one document, save stays single-document and atomic." The intent was that reference fields never nest forms. v4 read it as a rule about the Save button, so Save writes only the open document.

An example of the gap:

1. An editor clears the required title on a Page.
2. The editor opens a Post and changes its slug.
3. The editor clicks Save.
4. v4 saves the Post. The Page edit stays unsaved.

No edit is lost. ADR-012 §5 keeps dirty forms across navigation, and ADR-026 keeps them across reloads. The open question is what the Save button should save.

The team voted on three options:

- **A:** Save writes only the open document, and the home section lists documents with unsaved edits.
- **B:** Save writes every edited document, and an error on any document shows a UI that says where the errors come from.
- **C:** Forms keep a Save Document button, and the top bar adds a Save All button.

## Decision

### 1. Two buttons, two scopes (option C)
- **Save Document** sits on the form. It saves the open document only, as it does today.
- **Save All** sits in the top bar. It saves every document with unsaved edits.

### 2. Save Document does not change
The core save in ADR-018 §2 stays per document. Each document still runs `reconstruct`, `beforeSave`, the content write and `afterSave` on its own, and is marked clean or stays dirty on its own.

### 3. Save All runs the Save Document flow once per dirty document
Save All adds no new write path. A document that fails validation or the write stays dirty and keeps its draft (ADR-018 §2). The error shows against that document, so the editor can see which document failed.

### 4. ADR-011 stays valid
Reference fields still select a pointer and never nest a form. Save All saves several forms side by side. It does not merge them or nest one in another, so cycles still cannot nest.

## Consequences

### Positive
- The editor chooses the scope. A stray edit in another form no longer hides behind a Save that skips it.
- The per-document save keeps its atomic shape, so Save All is a loop over a flow that already works.

### Negative
- Two buttons are more UI than one.
- Save All can part-succeed. Some documents save and others stay dirty, and the UI must say which is which.

## Alternatives Considered
- **A: Save only the open document, with an unsaved list on home.** *Rejected:* an edit in another form stays unsaved until the editor finds the list.
- **B: Save saves every edited document.** *Rejected:* one button cannot save a single document, and a stray invalid edit in another form blocks an unrelated save.

## References
- [ADR-010](./010-form-state-model.md), [ADR-011](./011-reference-fields.md), [ADR-012](./012-form-lifecycle.md), [ADR-018](./018-save-flow.md), [ADR-026](./026-draft-persistence-in-form-store.md)
