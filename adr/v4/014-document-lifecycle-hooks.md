# ADR-014: Document Lifecycle Hooks

## Status
**Accepted**, amended by [ADR-026](./026-draft-persistence-in-form-store.md): drafts persist in the core form store, so no draft plugin consumes `onChange`/`afterSave`; draft events are deferred until a listener needs them. Builds on [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (segments), [ADR-008](./008-authorization-permissions-roles.md) (client-UX vs server-enforcement), [ADR-003](./003-zustand-state-management.md) (client-only store), and [ADR-012](./012-form-lifecycle.md), which owed this seam. Formalizes the `beforeSave`/`afterSave` sketch from [ADR-002](./002-plugin-first-architecture.md); relates to [ADR-004](./004-git-editorial-workflow.md) (publish/committed history).

## Context
Plugins must react to a document's **edit/save** lifecycle — the **draft** plugin snapshots on change and clears on save; editorial-workflow validates/gates; an audit plugin logs; TinaCMS v3 exposed an *after-submit* hook. ADR-002 named `beforeSave`/`afterSave` but never defined their power, ordering, or where they run; ADR-012 listed this as an owed seam.

## Decision

### 1. Three edit/save hooks
`onChange` (observer), `beforeSave` (transform + veto), `afterSave` (observer) — distinct from *plugin* lifecycle (`onInit`/`onDestroy`, once per plugin). **`afterSave` is the v4 home of v3's after-submit.** "Save" is the canonical term (not "submit") — it lines up with the dirty-guard's *Save/Discard* (ADR-012) and with the write to the `content` capability.

### 2. `beforeSave` is a transform + veto pipeline
Multiple taps run in **explicit order**, async; each sees the prior's output (transform), and any may **reject** the save (veto) with a surfaced reason. Observers (`onChange`/`afterSave`) cannot change the outcome; a throwing `afterSave` is logged, not rolled back (the save already happened).

### 3. Client/server split (ADR-008)
Authoritative `beforeSave` **enforcement** runs **server-side** (a server hook, in the save-RPC path: a save to a collection with a server hook goes through the Backend, per [ADR-028](./028-server-save-hooks.md)) — a client hook is bypassable UX. Convenience transforms and `onChange` run **client-side**; a client `onChange` rides Zustand `subscribe` (the store is client-only, ADR-003). The same logical rule may therefore be authored twice — a client `beforeSave` for snappy UX and a server `beforeSave` for enforcement.

### 4. Persistence is never overridden per-form
The save action is always "write to the `content` capability." There is **no** form-level `onSubmit` that *replaces* persistence (v3 allowed this; v4 drops it) — the v3 cases reduce to `beforeSave` (massage the payload) or `afterSave` (fire a side-effect). **"Don't persist"** has two sanctioned expressions, neither a form override:
- **Whole-deployment demo/playground** → an **ephemeral `content` provider** (writes land in the in-memory index, never flushed; no auth needed). Hooks still fire, so save *feels* real and resets on refresh.
- **A specific look-but-don't-commit user/role** → deny the **`content:save` permission** (ADR-008): client disables Save, server rejects the write. Because **drafts are per-user/client-side and save is the permissioned server write**, such a user can still edit, keep local drafts, and preview — a real "reviewer/viewer" role, not just a demo.

### 5. Scope = save/edit; publish is out-of-band
Publish/commit lives *inside* the Data Layer (ADR-004), and **TinaCloud runs no plugin code**, so there are **no in-process publish hooks** in v4 core. Reactions to *committed* events use **TinaCloud webhooks** (or a Self-Hosted Data Layer's own mechanism) — out-of-band, not plugin hooks.

## Consequences

### Positive
- Draft snapshot (client `onChange`), auto-fields/normalize + gates (server `beforeSave`), redirect/revalidate/audit (`afterSave`) are all expressible as plugins.
- Enforcement stays server-authoritative; persistence stays the `content` capability's sole job.
- The demo/viewer cases fall out of existing pieces (provider swap + RBAC + drafts) — no new mechanism.

### Negative
- `beforeSave` **ordering** across plugins is a real concern (mitigated by explicit `order` + stable fallback).
- A rule needing both UX and enforcement is authored in two places (client + server `beforeSave`).

## Alternatives Considered
- **Observers-only** — *rejected*: can't express auto-fields or save-gates as plugins.
- **Per-form submit/action override (v3)** — *rejected*: punches a hole in "persistence = `content` capability"; the demo case is covered by a provider flag or a permission.
- **In-process publish hooks** — *rejected*: incompatible with TinaCloud's no-plugin-code surface; webhooks already cover committed events.

## References
- [CONTEXT.md](./CONTEXT.md) — Document lifecycle hooks, `draft` capability, Local Data Layer, Permission, Plugin segment
- [ADR-002](./002-plugin-first-architecture.md), [ADR-004](./004-git-editorial-workflow.md), [ADR-007](./007-full-stack-plugins-client-backend-segments.md), [ADR-008](./008-authorization-permissions-roles.md), [ADR-012](./012-form-lifecycle.md)
