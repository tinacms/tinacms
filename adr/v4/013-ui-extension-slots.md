# ADR-013: UI Extension Slots

## Status
**Accepted** — builds on [ADR-006](./006-plugin-dependency-resolution.md) (well-known names), [ADR-008](./008-authorization-permissions-roles.md) (permission gating), [ADR-009](./009-field-plugins.md) (the resolve-by-key/render-foreign-component mechanism), and [ADR-012](./012-form-lifecycle.md), which owed this seam.

## Context
The field-plugin model (ADR-009) defines how plugins render UI *inside a Form*. It says nothing about how a **non-field** plugin contributes chrome to the rest of the Admin UI — the shell (a draft saving indicator, history/diff panels), global nav, document actions, or per-row decorations in collection lists (the "has unsaved edits" badge). ADR-012 flagged this as the largest owed seam: the **draft** plugin cannot exist without it.

## Decision

### 1. UI slots are fan-in regions, not keyed capabilities
A slot is a named region that **many** plugins contribute into; contributions **stack** (no conflict). This is the **inverse cardinality** of **Component resolution** (one provider per key, conflict on collision). They share the mechanism — render a component you don't own, resolved by key — but a slot is fan-in, so the hard question is *ordering*, not *which provider wins*.

### 2. Fixed, first-party, typed slot vocabulary
Core owns the set of slots (`shell.statusBar`, `form.panel`, `collectionList.itemBadge`, `globalNav`, `documentActions`, …), aggregated by **codegen into a typed union** — the same pattern as the permission union (ADR-008) and well-known capability names (ADR-006). Plugins target known slots with type-checked context. **No third-party slot *definitions* in v4** (revisit once real demand is observed; promote recurring needs into first-party slots).

### 3. Each slot has a typed context
The contract is `slot name → context type`, not just a name: `collectionList.itemBadge` hands the contribution the *document*; `form.panel` hands the `formId`; `shell.statusBar` hands nothing (global). Mirrors how field components receive `value`/`onChange`/`address`.

### 4. Contributions are boot-composed client-segment declarations
A contribution lives in a plugin's **Client segment** and is composed **once at boot** from the static plugin list — the capability-provider class of ADR-012, *not* the lazy per-form field class. Shell chrome is known at boot.

### 5. Gated and dependency-conditional
Contributions are **permission-gated** (`requires: { permission }`, client UX only per ADR-008 — the server remains the sole enforcement) and **dependency-conditional**: a contribution that `dependsOn` a capability simply does not render if no provider is installed (the draft badge needs `draft`).

### 6. Ordering is explicit, never load-order
Multiple contributions in one slot order by an optional `order`/`weight` with a stable fallback — consistent with "load order never silently decides a winner" (ADR-006).

### 7. List decorations require bulk queries
A slot that decorates list rows (`collectionList.itemBadge`) renders per row in a potentially huge list. Its backing capability **must** expose a **bulk** query (e.g. `draft.hasDrafts(ids)`) gathered **once per list**, never per row.

## Consequences

### Positive
- Non-field plugins (`draft`, editorial workflow, …) can contribute coherent, typed, permission-aware UI; the draft plugin's saving icon, history/diff panels, and "edited" badges are all expressible.
- The UI stays coherent because the vocabulary is curated, not open season.

### Negative
- A genuinely new region requires a core change to add the slot (accepted for v4).
- Core carries the slot registry and per-slot context types.

## Alternatives Considered
- **Plugin-extensible slots** (any plugin defines slots) — *rejected for v4*: slot soup, weak typing, incoherent UI. Promote recurring needs to first-party slots instead.

## References
- [CONTEXT.md](./CONTEXT.md) — UI slot, Component resolution, Permission, `draft` capability
- [ADR-006](./006-plugin-dependency-resolution.md), [ADR-008](./008-authorization-permissions-roles.md), [ADR-009](./009-field-plugins.md), [ADR-012](./012-form-lifecycle.md)
