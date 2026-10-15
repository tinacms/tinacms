# ADR-010: Form State Model — Flat, Normalized-by-Address Store

## Status
**Accepted** — depends on [ADR-009](./009-field-plugins.md) (Field address). Refines the Zustand model sketched in [ADR-003](./003-zustand-state-management.md) for *form/field* state specifically.

## Context
A **Form** can contain hundreds or thousands of fields. The non-negotiable property is **per-keystroke re-render isolation**: editing one field must re-render that field and (at most) the ancestors that show a derived summary — never the whole tree. ADR-003 / `CONTEXT.md` said "each client segment owns a slice, composed once at boot" — which fields flatly violate: there is no single "string-field slice," there are *N* string-field *instances*, created and destroyed at runtime as the editor navigates and arrays grow. Given we already committed to **Field address** as identity (ADR-009), we want a store shape that makes isolation *structural* rather than a memoization-discipline exercise.

## Decision

### 1. The Form is core state, scoped per document
The Form is **core editing infrastructure**, not a per-field-plugin slice, scoped per open document (a `formId`). **Field plugins are stateless consumers** — they read/write by **Field address** through hooks and hold only transient local UI state. More than one Form can be live at once (distinct `formId` scopes) — which is how a **reference field** can host a second document's form.

### 2. Flat, normalized-by-address value store + structure index
Values are stored as a flat map `{ address: value }`: a write touches exactly one key, and leaf selectors are O(1) lookups with **stable references for free**. A pure value map loses ordering and "which children exist," so it is paired with a **structure index**: per composite address, the ordered list of child keys.
- **Composites subscribe to structure** (their child key list); **leaves subscribe to values.**
- → editing a child does **not** re-render its array parent; adding an item **does** (the parent's key list grew). Isolation is structural.

### 3. Flatten on load, reconstruct on save
The incoming document is **flattened** into the address map + structure index on load, and **reconstructed** to document shape on save (from the structure index + schema for order). Dirty-tracking and partial/patch saves fall out: diff the address map against the baseline → the exact set of changed addresses.

### 4. Hooks are subscriptions, not events
There is no event bus and nothing "fires" a hook. A hook is a Zustand selector subscription keyed by address (`useFieldValue`, `useFieldActivation`, `useSiblingValue`, `useFieldErrors`); a component re-renders when its selected slice changes. The **only** thing handed to a field component is its **Field address** (via context) — everything else is pulled through address-keyed hooks.

### 5. The opaque-editor boundary
A field that owns a complex internal editor (rich text) is **one addressed value**; the editor manages its own internals and writes the value back. **Embedded fields** are the exception — addressed as composite children per ADR-009.

### 6. Guardrails (the cost of going flat)
The value map and structure index **must** stay consistent. Therefore:
- All structural operations (add / remove / reorder / duplicate) go through a **single set of atomic form actions** — no plugin pokes the store directly.
- Deletes **cascade-sweep** the subtree (removing an array item purges every `prefix.*` value entry), or stale data leaks back into the document on save.

## Consequences

### Positive
- Per-keystroke re-render isolation is **structural**, not a tuning exercise.
- Stable leaf selectors for free; no memoized path-walks for the common case.
- Trivial dirty-tracking and natural partial/patch saves.

### Negative
- The store is **two coordinated structures**, not one — the value↔structure consistency is the main source of complexity and bugs.
- A **flatten/reconstruct round-trip** brackets every edit session → a fidelity risk (key order, `null`-vs-absent) to design against.
- **Subtree operations are gathers, not pointer-grabs**: duplicate/move/save must walk the index and gather/rewrite `prefix.*` entries. Subtree selectors are not reference-stable (must memoize).

Trade accepted because **keystrokes are the hot path** and structural ops are occasional.

## Alternatives Considered
- **Nested value tree + structural sharing** — *rejected*: deep writes clone the whole spine (every ancestor identity changes), so isolation depends on selector discipline rather than structure, and dirty-diffing a deep tree is harder. Its only wins (cheap subtree reads/save, closer-to-source fidelity) are on the *occasional* path.

## References
- [CONTEXT.md](./CONTEXT.md) — Form, Field address, Field plugin, Embedded field
- [ADR-003](./003-zustand-state-management.md), [ADR-009](./009-field-plugins.md)
