# Milestones

Phases of the v4 spec and (eventual) implementation. The implementation lives in `packages/v4`.

## M1 — Domain language and ADR-set ✅

Canonical decisions and vocabulary committed.

- [x] CONTEXT.md (domain language)
- [x] ADR-001 Single Package
- [x] ADR-002 Plugin-First (amended by ADR-006)
- [x] ADR-003 Zustand (amended by ADR-007, refined by ADR-010)
- [x] ADR-004 Git Editorial Workflow (amended by ADR-007)
- [x] ADR-005 Module System *(superseded by ADR-006)*
- [x] ADR-006 Capability-based dependency resolution
- [x] ADR-007 Full-stack plugins / Client+Server segments
- [x] ADR-008 Secure-by-default RPC, permission-based RBAC
- [x] ADR-009 Field plugins — keyed capability, delegation, addressing
- [x] ADR-010 Form state — flat normalized-by-address
- [x] ADR-011 Reference fields — select-only in v4
- [x] ADR-012 Form lifecycle — discovery, lazy loading, hydration, teardown
- [x] ADR-013 UI extension slots
- [x] ADR-014 Document lifecycle hooks
- [x] ADR-015 Execution boundary — what runs where
- [x] ADR-016 Schema as the compiled core artifact
- [x] ADR-017 Content model — collections, documents, templates, fields
- [x] ADR-018 Save flow
- [x] ADR-019 Content capability contract
- [x] ADR-020 `tina doctor` — static audit
- [x] ADR-021 Search capability contract
- [x] ADR-022 Media capability contract
- [x] ADR-023 Auth & session mechanics
- [x] ADR-024 `defineConfig` shape — the composition root

## M2 — Spec consistency 🔄

Bringing every supporting doc in line with the M1 ADRs.

- [x] Architecture overview / plugin system / state management rewrites
- [x] Plugin docs (field, media, search, auth, custom) rewrites
- [x] Store docs (architecture, extensibility, middleware, persistence) rewrites
- [x] Systems docs (graphql-server → `content` capability, editorial-workflow, code-generation, media-management) rewrites
- [x] API docs (public, internal) rewrites
- [x] README + sidebar reflect the new ADR set *(through ADR-024)*
- [x] Configuration shape — defined by ADR-024; supporting `configuration/` doc still to be written
- [ ] **Supporting-doc catch-up pass for ADRs 011–024** — the architecture/plugin/store/systems/API docs were aligned to the ADR-001–010 set; the field/form/capability-contract expansion (011–024) needs another consistency pass

## M3 — Architectural decisions

Most of the original M3 slate is now decided (ADRs 011–024). **Resolved:**

- [x] **`content` capability contract** → ADR-019 (shared across TinaCloud / Self-Hosted / Local).
- [x] **Configuration / schema** → ADR-016 (schema artifact), ADR-017 (content model), ADR-024 (`defineConfig`).
- [x] **Form structural ops** → ADR-010 (atomic-actions guardrail) + ADR-009 (embeds route through them). A standalone "form actions" ADR proved unnecessary.
- [x] **Binary RPC payloads** → ADR-022 (scoped to the `media` capability; RPC transport stays JSON-only).

**Still open:**

- [ ] **Rich-JSON RPC codec** (ADR-007 open sub-decision) — `Date` / `Map` in ordinary RPC payloads (superjson-style).
- [ ] **Static-only deployment story** — client-only plugin guarantees + how `defineConfig` warns when a server segment is required (CONTEXT.md ambiguity).
- [ ] **First-party UI slot vocabulary** — the concrete first-party slot set + typed contexts (mechanism: ADR-013).
- [ ] **RBAC-management plugin** (ADR-008 deferred) — first-party admin UI for self-hosted setups whose auth provider doesn't manage roles.

**Deferred to later versions:**

- v4.1 — inline editing of reference fields (ADR-011); durable / collaborative drafts (ADR-012).
- Per-branch / draft full-text search (ADR-021); field-level git-blame authorship (ADR-019).

## M4 — Implementation

This is a **rewrite**, not a refactor — code does not carry across from v2 except where an ADR explicitly preserves a concept (e.g. the v2 Zod schema helpers). Implementation lives in `packages/v4`.

Sketch of likely phases:

1. Plugin runtime + capability resolution + RPC transport.
2. Core slices (ui, branch, documents) + Form (flat-by-address).
3. Local Data Layer + dev server + codegen.
4. Built-in field plugins re-implemented against the keyed-capability model.
5. TinaCloud plugin bundle (content + auth + media + search + draft) + `resolveUrl`/CDN.
6. Per-framework adapters (Next first, then Express/Remix/Hono).
7. Self-hosted Data Layer reference implementation.
8. `tina doctor` static audit + build-time checks (lock/contract-version, index coverage, content validation).

## What's *not* on the roadmap

- A separate `@tinacms/cli` package (ADR-001).
- A module system (ADR-006 removed it).
- Runtime store `extend()` / `addMiddleware()` (ADR-003 amendment).
- Hot-reloading plugins at runtime.
- An event bus.
- Plugin auto-discovery from the filesystem.
- Server segments running on TinaCloud.
