# ADR-011: Reference Fields — Select-Only in v4, Inline Edit Deferred to v4.1

## Status
**Accepted** — builds on [ADR-009](./009-field-plugins.md) (field plugins) and [ADR-010](./010-form-state-model.md) (per-`formId` form scope). Depends on the `content` capability.

## Context
A **reference field** points one document at another (a post → its author, a page → a shared CTA). It is the **only** field that crosses a document boundary, which is what makes it hard: editing the *referenced* document inline would require a second **Form** lifecycle, a cross-document save policy, and handling **reference cycles** (A → B → A → … nesting forever). The open question was whether v4 supports inline editing of the target or only selects/links it.

## Decision

### 1. v4 reference fields are select-only
The value is a **pointer** (target collection + id/path), never the target's content. The field `dependsOn: ['content']` to query candidate documents (filtered by the target collection) and renders a **summary** of the chosen target. To edit the target, the editor navigates to the target's own **Form**.

### 2. No cross-document save, no cycles
Because each `Form` is one document, save stays single-document and atomic, and A ↔ B reference cycles **cannot nest** — nothing nests. The hard problems simply don't exist in v4.

### 3. v4.1 inline edit is designed-for, not built
Inline editing of a referenced document, when added in v4.1, mounts a **second `Form` scope** (a new `formId`, per [ADR-010](./010-form-state-model.md)) for the target — **never** merging into the parent's value tree — with its own dirty/validation/save lifecycle and an explicit nesting/cycle guard. The per-`formId` scoping in ADR-010 exists partly to keep this door open without a later rewrite.

## Consequences

### Positive
- v4 stays simple: one document per form, no cross-document save, no cycle detection.
- The boundary is already shaped for v4.1, so the deferral costs nothing structurally.

### Negative
- In v4, editing a referenced document requires navigating away from the current form — a known UX gap, filled in v4.1.

## Alternatives Considered
- **Inline edit in v4** — *rejected*: two concurrent save lifecycles plus cycle detection is too much surface for the initial release, and select-only is the foundation inline-edit builds on anyway.

## Deferred (v4.1)
- Inline editing of referenced documents: second `Form` scope, cross-document save policy (atomic vs independent), and a cycle/nesting guard.

## References
- [CONTEXT.md](./CONTEXT.md) — Reference field, Form, `content` capability
- [ADR-009](./009-field-plugins.md), [ADR-010](./010-form-state-model.md)
