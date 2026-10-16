# TinaCMS v4 — Architecture & Planning

**Status**: Architecture spec, pre-implementation.

These are the architecture and planning docs for TinaCMS v4 — a **rewrite**, not an incremental refactor of v2. The source of truth is:

1. [**CONTEXT.md**](./CONTEXT.md) — the domain language. Read this first; it is what every other doc here defers to.
2. The numbered **ADRs** in this folder — the actual architectural decisions, with cross-references and supersedure tracked in the `Status` field of each ADR.

Everything else in this tree is orientation material: it points back into CONTEXT.md and the ADRs rather than restating the decisions.

## The picture in one paragraph

TinaCMS v4 is a **plugin-driven, git-native CMS**. An **Admin UI** in the browser edits content by talking to a **Data Layer** (TinaCloud, a Self-Hosted Data Layer, or a Local Data Layer) — the Data Layer is the only thing that reads/writes content files and runs git. Everything else (fields, media, search, auth, custom features) is a **Plugin** that `provides` and `dependsOn` named **Capabilities**. Plugins are full-stack: a thin manifest lazily references a **Client segment** (React + a Zustand slice) and/or a **Server segment** (runs on the user's **Backend** — their own app server, e.g. Next — never on TinaCloud). The client calls the server via **Capability RPC**, typed end-to-end by `import type` with no codegen. Authorization is secure-by-default at the transport, with permission-based RBAC. Field plugins are a *keyed capability* — many providers, one per schema field `type` — and compose by delegation through a runtime **Field address** that survives reorders and powers visual editing.

## ADRs

The ADRs are the canonical decisions. Read them in order; each one's `Status` field cross-references the others.

- [ADR-001: Single Package Architecture](./001-single-package-architecture.md) — *amended by ADR-007*
- [ADR-002: Plugin-First Architecture](./002-plugin-first-architecture.md) — *amended by ADR-006*
- [ADR-003: Zustand for State Management](./003-zustand-state-management.md) — *amended by ADR-007; refined by ADR-010*
- [ADR-004: Git-Based Editorial Workflow](./004-git-editorial-workflow.md) — *amended by ADR-007*
- [ADR-005: Module System Design](./005-module-system.md) — **superseded by ADR-006** (historical only)
- [ADR-006: Plugin Dependency Resolution via Capabilities](./006-plugin-dependency-resolution.md)
- [ADR-007: Full-Stack Plugins with Client/Server Segments](./007-full-stack-plugins-client-backend-segments.md)
- [ADR-008: Authorization — Secure-by-Default RPC, Permission-Based RBAC](./008-authorization-permissions-roles.md)
- [ADR-009: Field Plugins — Keyed Capability, Composition by Delegation](./009-field-plugins.md) — *extends ADR-006*
- [ADR-010: Form State Model — Flat, Normalized-by-Address](./010-form-state-model.md)
- [ADR-011: Reference Fields — Select-Only in v4](./011-reference-fields.md)
- [ADR-012: Form Lifecycle — Discovery, Lazy Loading, Hydration, Teardown](./012-form-lifecycle.md) — *refines ADR-007's boot-composition rule*
- [ADR-013: UI Extension Slots](./013-ui-extension-slots.md)
- [ADR-014: Document Lifecycle Hooks](./014-document-lifecycle-hooks.md)
- [ADR-015: Execution Boundary — What Runs Where](./015-execution-boundary.md)
- [ADR-016: Schema as the Compiled Core Artifact](./016-schema-compiled-artifact.md)
- [ADR-017: Content Model — Collections, Documents, Templates, Fields](./017-content-model.md)
- [ADR-018: Save Flow](./018-save-flow.md)
- [ADR-019: Content Capability Contract](./019-content-capability-contract.md)
- [ADR-020: `tina doctor` — Static Audit](./020-tina-doctor-audit.md)
- [ADR-021: Search Capability Contract](./021-search-capability-contract.md)
- [ADR-022: Media Capability Contract](./022-media-capability-contract.md) — *resolves ADR-007's binary sub-decision*
- [ADR-023: Auth & Session Mechanics](https://github.com/tinacms/tinacmsv4-docs/blob/main/adr/023-auth-session-mechanics.md) — *not yet public*
- [ADR-024: `defineConfig` Shape — The Composition Root](./024-defineconfig-shape.md)
- [ADR-025: Form Hook Registration](./025-form-hook-registration.md)
- [ADR-026: Draft Persistence in the Form Store](./026-draft-persistence-in-form-store.md)

## Supporting documentation

Orientation, not decisions. Each links back to the relevant ADR(s).

### Architecture

- [Overview](architecture/overview.md) — system shape, where each piece lives
- [Plugin System](architecture/plugin-system.md) — definePlugin, capabilities, segments
- [State Management](architecture/state-management.md) — Zustand model, where Form sits

### Plugins

- [Field Plugins](plugins/field-plugins.md)
- [Media Plugins](plugins/media-plugins.md)
- [Search Plugins](plugins/search-plugins.md)
- [Auth Plugins](plugins/auth-plugins.md)
- [Custom Plugins](plugins/custom-plugins.md)

### Store

- [Store Architecture](store/store-architecture.md)
- [Extensibility](store/extensibility.md)
- [Persistence](store/persistence.md)
- [Middleware](store/middleware.md)

### Systems

- [GraphQL Server](systems/graphql-server.md) — *implementation of the `content` capability*
- [Editorial Workflow](systems/editorial-workflow.md) — *Data Layer concern*
- [Code Generation](systems/code-generation.md)
- [Media Management](systems/media-management.md)

### API & Configuration

- [Public API](api/public-api.md)
- [Internal APIs](api/internal-apis.md)
- [Configuration](configuration/) — *shape defined by [ADR-024](./024-defineconfig-shape.md); supporting doc still to be written*

### Roadmap

- [Single Package Refactor](roadmap/single-package-refactor.md)
- [Migration Guide](roadmap/migration-guide.md)
- [Milestones](roadmap/milestones.md)

## Conventions for editing these docs

- **Decisions go in ADRs.** Supporting docs orient and exemplify; they never introduce a decision the ADRs don't already make.
- **CONTEXT.md owns the domain language.** If a term is ambiguous in a doc, the fix is to align the doc with CONTEXT.md, not the other way around.
- When an ADR is amended or superseded, update its `Status` line *and* the line in this README so the cross-references stay walkable.
- This is a **rewrite**. Docs should describe the v4 design, not the v2 implementation. Reference v2 only when an ADR explicitly contrasts the two.

## Known open items

Tracked in CONTEXT.md (Flagged ambiguities) and at the end of individual ADRs:

- **Static-only deployment story** for full-stack plugins (no server runtime to host the server segment).
- **Rich-JSON RPC codec** — `Date` / `Map` etc. in ordinary Capability RPC payloads (superjson-style). *Binary / file-upload is resolved — scoped to the `media` capability ([ADR-022](./022-media-capability-contract.md)), so the RPC transport stays JSON-only.*
- **First-party UI slot vocabulary** — the concrete first-party slot set + each slot's typed context (the mechanism is [ADR-013](./013-ui-extension-slots.md)).
- **First-party RBAC management plugin** for self-hosted providers that don't manage roles (ADR-008 deferred).

### Deferred to later versions

- **v4.1** — inline editing of reference fields ([ADR-011](./011-reference-fields.md)); durable / collaborative drafts (richer `draft` providers, [ADR-012](./012-form-lifecycle.md)).
- Per-branch / draft full-text search ([ADR-021](./021-search-capability-contract.md)); field-level git-blame authorship ([ADR-019](./019-content-capability-contract.md)).
