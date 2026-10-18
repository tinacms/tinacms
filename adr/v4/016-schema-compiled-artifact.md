# ADR-016: Schema as the Compiled Core Artifact (+ Primitive Contract Versioning)

## Status
**Accepted** — builds on [ADR-006](./006-plugin-dependency-resolution.md)/[ADR-008](./008-authorization-permissions-roles.md) (codegen, build-time config), [ADR-009](./009-field-plugins.md) (field `type` → plugin), and [ADR-012](./012-form-lifecycle.md) (hydration drift). Paired with [ADR-017](./017-content-model.md) (the content model the schema describes).

## Context
The entire field/form tree (ADRs 009–014) stood on "the schema" as an **undefined given**. Two questions had to be answered: (1) how does the Admin UI get the content shape, and (2) how do *Tina's own* primitive-field updates avoid breaking users' builds — the `tina-lock.json` desync pain, where shipping a change to a built-in field can break a committed lock.

## Decision

### 1. The schema is a core artifact, consumed directly by the client
`defineConfig`'s schema compiles to **`tina-lock.json`**, read by three consumers: the **client** (to build forms — it needs field-plugin metadata that GraphQL introspection *cannot* carry: UI hints, templates, validation), the **Data Layer** (generated GraphQL API + TS types), and **TinaCloud** (validation without running the user's build). The schema **fans out to four things**: forms, the `content` GraphQL + types, serialization (**Format adapters**), and validation. It is **build-time config, not runtime data** (ADR-008) — an editor cannot change it.

### 2. The lock references primitives by key + contract version — it does not inline them
`tina-lock.json` captures the **user's** schema and references built-in field types **by `type` key + a contract version**. The actual primitive definitions are **resolved at build** from the installed field plugins. So a **non-breaking** primitive update needs **no lock change** (resolved fresh); the lock churns only when the *user's schema* or a *contract version* changes — far fewer spurious diffs.

### 3. Breaking primitive changes are explicit and migratable, never silent
Because the lock is **committed**, it can lag the installed package. A **build-time check** compares the lock's pinned contract versions against the installed plugins':
- stale-but-compatible → **warn + regenerate**;
- contract-major mismatch → **hard stop** with a `tina migrate` path.

(User-side breaking changes — e.g. a newly-**required** field on existing docs — are handled *separately* by hydration: default/empty + a validation flag, **never a crash**; see [ADR-012](./012-form-lifecycle.md).)

## Consequences

### Positive
- The lock stops being **hostage to Tina's internals**; primitive evolution no longer silently breaks builds.
- The client gets the rich field metadata forms need (impossible via GraphQL introspection alone).

### Negative
- A build-time version check is required, and a breaking primitive change must ship a migration/codemod.

## Alternatives Considered
- **GraphQL-introspection-driven forms** — *rejected*: introspection can't carry field-plugin UI metadata, templates, or validation rules, starving the form layer.
- **Inlining primitive definitions in the lock** (v3-ish) — *rejected*: couples the lock to Tina's internals, so any primitive change desyncs committed locks and breaks builds.

## References
- [CONTEXT.md](./CONTEXT.md) — Schema, `tina-lock.json`, `content` capability
- [ADR-006](./006-plugin-dependency-resolution.md), [ADR-008](./008-authorization-permissions-roles.md), [ADR-009](./009-field-plugins.md), [ADR-012](./012-form-lifecycle.md), [ADR-017](./017-content-model.md)
