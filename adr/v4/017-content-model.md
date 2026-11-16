# ADR-017: Content Model — Collections, Documents, Templates, Fields

## Status
**Accepted** — builds on [ADR-009](./009-field-plugins.md) (field plugins / keyed capability), [ADR-011](./011-reference-fields.md) (references), [ADR-015](./015-execution-boundary.md) (what runs where), and [ADR-016](./016-schema-compiled-artifact.md) (the schema artifact). Defines the entities ADRs 009–014 assumed.

**Amended 2026-10-12:** the list type ships as `type: 'array'` (`t.array`). This ADR now uses that name; the decision is unchanged.

## Context
"document → collection → schema → field types" was assumed throughout the field/form work, but none of those entities were defined. This ADR pins them down and records the v4 changes from v3.

## Decision

### 1. Collection — the organizing unit
A named set of **Documents** sharing a shape, mapped to files by **`path` + `format` + `match`**. Field definitions carry `name`, `type` (→ a **Field plugin**), `label`, `required?`, options, `ui` hints, default. For md/mdx, scalars map to **frontmatter** and one rich-text field is the **body** (`isBody`). **One collection = one `path` + one `format`.**

### 2. Document — identity is its path
A single content file. Its **identity *is* its path** (`content/posts/hello.md`) — the file is the document, git-native, **no machine id**. **Reference fields** point by collection + path. **In-CMS rename/move is reference-aware** (it updates referrers — an atomic structural op, ADR-010); out-of-band renames (hand/git) can dangle references and are caught by the **dev/CI audit**, never a crash.

### 3. Template — the single content-shape primitive
A **named fieldset**. *Everything that holds fields is a template* — collection shapes, `object`/`array` item shapes, rich-text embeds. **Inline vs shared is only where it is defined**; a template is always named, so it can be inlined for a one-off or lifted to a shared registry for reuse with **zero content migration**. Polymorphic positions record which template a value is via a **`_template`** discriminator; homogeneous positions need none. (A `Collection` is just a template bound to a file mapping.)

### 4. `array` is a *type*, not a modifier
v4 drops v3's `list: true`. **`type: 'array'` (`t.array`) is a composite field plugin.** It declares its items with **exactly one of**:
- **`fields`** — a homogeneous object shape (the common case; `type` decides cardinality, `fields` describes the shape; **no `_template` on disk**);
- **`templates`** — polymorphic blocks (**`_template` discriminator on disk**);
- **`of`** — scalars (`of: { type: 'string' }`).

Item field plugins are therefore **always single-valued**; the array plugin owns add/remove/reorder. Principle: **`fields` always describes an object's shape; `type` decides one-vs-many.** This removes v3's wart of every field plugin having to handle single *and* list mode internally.

### 5. Serialization = Format adapters; no per-field codecs
Field **content values are JSON-native**, so the generic adapter stores them as-is and the field component interprets them client-side. The per-`format` **Format adapter** is the *only* serialization layer — it maps document JSON ↔ file (frontmatter/body split, rich-text↔markdown, MDX embeds). Built-in adapters run everywhere; a **custom file format is a custom adapter — self-hosted-only** (ADR-015).

### 6. Validation = two tiers
- **Declarative rules** (`required`/`min`/`max`/`pattern`/`enum`) serialize into the lock → **enforceable everywhere, including TinaCloud**.
- **Custom `validate` functions** (field-level *and* document-level, run via the `beforeSave` pipeline, ADR-014) → **client-UX everywhere**. Registered as a **server hook**, they are **server-enforced on the Backend** for every Data Layer, managed TinaCloud included ([ADR-028](./028-server-save-hooks.md)).

## Consequences

### Positive
- **One shape primitive** (template) at every altitude; **one field model** (one `type` → one plugin, no `list` boolean); multiplicity concentrated in the array plugin; serialization collapses to format adapters.
- Path-as-identity keeps content fully git-native.

### Negative
- **`type: 'array'` is a breaking change from v3** — needs a `list: true` → `type: 'array'` codemod.
- Path identity keeps a **rename hazard for *out-of-band* renames** (mitigated by reference-aware in-CMS rename + the audit).

## Alternatives Considered
- **Stable document ids** — *rejected*: machine ids in content + sync state; path-as-identity is git-native (ADR-011).
- **`list: true` modifier** — *rejected*: smears multiplicity across every field plugin.
- **Inline-only or shared-only templates** — *rejected*: unified named templates subsume both.
- **Per-field serialization codecs** — *rejected*: content values are JSON-native; serialization is the Format adapter's job.

## References
- [CONTEXT.md](./CONTEXT.md) — Collection, Document, Template, Format adapter, Field plugin, Field address, Reference field
- [ADR-009](./009-field-plugins.md), [ADR-011](./011-reference-fields.md), [ADR-015](./015-execution-boundary.md), [ADR-016](./016-schema-compiled-artifact.md)
