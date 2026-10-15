# ADR-015: Execution Boundary — What Runs Where

## Status
**Accepted** — consolidates an invariant that surfaced piecemeal across [ADR-007](./007-full-stack-plugins-client-backend-segments.md) (TinaCloud runs no plugin code), [ADR-008](./008-authorization-permissions-roles.md) (client-UX vs server-enforcement), and [ADR-014](./014-document-lifecycle-hooks.md), and again throughout the schema/serialization/validation work. Referenced by [ADR-016](./016-schema-compiled-artifact.md) and [ADR-017](./017-content-model.md).

## Context
"Where does this code run?" kept driving design decisions — custom serialization, custom validation, server hooks — and the answer was stated repeatedly and **imprecisely**: "custom = self-hosted only" quietly conflated the user's **Backend** with the **Data Layer**. This ADR states the rule once, exactly.

## Decision

### Three execution locations
- **Client** (Admin UI, browser): **UX only** — never trusted for enforcement.
- **Backend** (the user's app server, e.g. Next): runs plugin **Server segments**; holds secrets; **enforces**. Present whenever the deployment has a server runtime — **including when TinaCloud is the Data Layer**.
- **Data Layer**: **Self-Hosted** (user-controlled — may run custom code/adapters, enforces at the write) or **TinaCloud** (managed; fixed first-party surface; runs **no** plugin code).

### The rule
> **First-party + declarative/serializable** artifacts (`tina-lock.json`, declarative validation rules, built-in **Format adapters**) run **everywhere, including inside TinaCloud.** **Custom *code*** runs only on the **Client** (UX) or the **Backend** (enforcement) — **never inside TinaCloud's Data Layer.**

## Consequences

### Positive / clarifying
- **Custom server logic *is* available to TinaCloud users — via the Backend** (a Server segment), not via TinaCloud. The earlier "self-hosted only" framing was too broad.
- The strictly **self-hosted-only** cases are narrow: logic that must run **inside the Data Layer** — a custom **Format adapter** (the file write), or enforcement that must survive writes made *directly* to the Data Layer.
- It establishes a clear bias: **prefer declarative over custom** for anything that must be enforced on managed TinaCloud (since only declarative artifacts run there).

### Open dependency — the save path (resolved)
Whether a Backend `beforeSave` is a **true enforcement gate** depends on whether content writes route **Client → Backend → Data Layer** or **Client → Data Layer directly**. **Resolved by [ADR-018](./018-save-flow.md): path A** — content writes go Client → Data Layer directly, enforcement lives at the Data Layer write point, so custom content-write *enforcement* is self-hosted-only (a client `beforeSave` may still call the Backend, but only advisorily).

## Alternatives Considered
- **Run sandboxed plugin code inside TinaCloud** — *rejected*: there is no safe way to run arbitrary user formatters/validators in managed infra; that risk is precisely why TinaCloud's surface is fixed and first-party.

## References
- [CONTEXT.md](./CONTEXT.md) — Execution boundary, Backend, TinaCloud, Format adapter, Permission
- [ADR-007](./007-full-stack-plugins-client-backend-segments.md), [ADR-008](./008-authorization-permissions-roles.md), [ADR-014](./014-document-lifecycle-hooks.md)
