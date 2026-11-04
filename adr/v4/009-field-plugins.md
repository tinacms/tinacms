# ADR-009: Field Plugins — Keyed Capability, Composition by Delegation, Field Addressing

## Status
**Accepted** — builds on [ADR-002](./002-plugin-first-architecture.md) (plugin-first), [ADR-006](./006-plugin-dependency-resolution.md) (capabilities + resolution), and [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (segments + Capability RPC). Introduces **keyed capabilities**, refining ADR-006. Paired with [ADR-010](./010-form-state-model.md) (form state).

## Context
ADR-002 used field plugins as the poster child for "everything is a plugin" but never reconciled them with the capability model, and `CONTEXT.md` had no entry for them at all. Three unresolved pressures forced the issue:

1. **Plurality vs the conflict rule.** The **Capability conflict** rule (two providers of the same capability → hard error) fits *singletons* — `media`, `auth`, `search`, `content` — but fields are inherently plural: a real site runs `string` + `image` + `rich-text` + `reference` + `datetime` fields *simultaneously*. Under the singleton rule, installing a second field plugin would be a conflict. Obviously wrong.
2. **The 1,000-line array field.** In v2/v3, composite fields (the array/list field) accreted huge `if (child.type === 'string') … else if … else if (rich-text) …` ladders because the parent *knew how to render every child type*. Every new field type meant editing the array field.
3. **Focusing nested fields across an iframe.** Visual editing (click-to-edit) must reveal/focus an arbitrarily nested field from a click in the preview iframe — which requires a stable way to *address* any field instance.

## Decision

### 1. `field` is a Keyed capability
Field plugins provide the `field` capability **at a key** — the schema field `type` they render. Many coexist. The **Capability conflict** rule is redefined as *two providers of the same capability **at the same key***; `overrides` is how you intentionally replace a built-in at a key (e.g. swap the stock `image` field). Singleton capabilities are just the degenerate one-implicit-key case.

### 2. Composition by delegation (Component resolution)
A composite field (`object` / `list` / rich-text) **never branches on child type**. It delegates child rendering to the runtime, which resolves the child's field plugin *by its type key* and wires in context (value, change handler, address). A composite owns only **list/layout mechanics** (add/remove/reorder/collapse); layout decisions read **metadata the child plugin declares**, never `if (type === …)`. Adding a field type touches zero lines of any composite. A composite is itself just a field plugin — there is no privileged "container" concept.

### 3. Field addressing
Component resolution mints a stable **Field address** per instance (the path from the form root, e.g. `blocks.<key>.cta.label`). **Array segments use stable per-item keys** assigned at item creation — *not* positional indices — so an address survives reordering; positions exist only at the render layer. One identity serves nested rendering, validation targeting, active-field highlighting, and the visual-editing marker. An address may terminate at **any** node, leaf or composite.

### 4. Visual editing rides the address; reveal vs activate
Click-to-edit `postMessage`s a **Field address** across the iframe; the form sets it as the single active field.
- **Reveal** (expand collapsed ancestors + scroll into view) is **runtime-owned and universal** — it works for any addressable node without the field cooperating.
- **Activate** (focus an input, open a popover, center a map) is **field-owned and opt-in**, via a runtime hook (`useFieldActivation(handler)`). A field that implements nothing is still revealed.
- There is **no manifest-declared focus hook**: manifest hooks (`onInit`/`onDestroy`) are *plugin-lifecycle* (once per plugin); activation is *per field instance* (there can be fifty string fields on screen), so it lives inside the component.
- When the active address terminates at a **composite**, the default is **reveal-and-stop** — never auto-drill into a descendant the editor didn't ask for.

### 5. Rich-text embeds are composite children, not nested forms
A rich-text field's **prose** is its opaque value (the editor's AST). Each **embedded block** (`<Cta>`, a template instance) is an **anchor** (stable key + position) in that AST whose field data lives at `body.<key>.*` — the **same `Form` scope**, addressed like any field, so it is focusable / editable / cloneable for free. The editor routes embed insert/move/delete through the form's structural actions (it cannot mutate embeds in isolation). **Presentation is independent of mechanism** — inline, popover, or panel are mount points, not editing models. (A *reference* field, which points at a different document, is the case that gets a second `Form` scope.)

## Consequences

### Positive
- Plurality and open/closed composition are structural, not conventions — the 1,000-line `if/else` ladder is **impossible to write** under delegation.
- One identity rail (Field address) serves rendering, validation, active-field highlighting, and visual editing.
- Custom fields need **zero special-casing** in the focus machinery — the runtime never needs to know whether a field is focusable.

### Negative / constraints
- Requires a runtime field-resolution primitive (`<Field address>`) and an addressing scheme everything keys off.
- Composite authors **must** use delegation; type-branching on children should be caught by lint/review.

## Alternatives Considered
- **Relax the conflict rule globally** (capabilities may be multiply-provided) — *rejected*: dissolves the property that makes singleton swaps (media/auth) safe.
- **A single `fields` registry plugin** that field types register into — *rejected*: re-introduces the registry ADR-002 abolished and privileges a "container" concept.

## References
- [CONTEXT.md](./CONTEXT.md) — Field plugin, Keyed capability, Component resolution, Field address, Visual editing, Embedded field
- [ADR-002](./002-plugin-first-architecture.md), [ADR-006](./006-plugin-dependency-resolution.md), [ADR-010](./010-form-state-model.md)
