# ADR-020: `tina doctor` — Static Audit (Build Is Its Blocking Subset)

## Status
**Accepted** — consolidates the "dev/CI audit" deferred to by [ADR-012](./012-form-lifecycle.md) (drift / unknown fields), [ADR-016](./016-schema-compiled-artifact.md) (lock / contract-version mismatch), [ADR-017](./017-content-model.md) (out-of-band rename), and [ADR-019](./019-content-capability-contract.md) (dangling refs, missing indexes). Builds on [ADR-015](./015-execution-boundary.md) (runs in Node, not TinaCloud).

## Context
Across the content/schema ADRs we repeatedly sent non-blocking problems to "the dev/CI audit" without ever defining it. `tina doctor` is that tool. It is **first a developer quick-check** — run it any time for fast, static feedback — and *optionally* a CI gate. The design question is its relationship to **build**, which surfaces some of the same issues.

## Decision

### 1. A static audit — no running app
`doctor` reads the **Schema** + **`tina-lock.json`** + content files + installed plugins (≈ building the **Local Data Layer** index) and reports. **No server, no browser** — that's the whole point: a quick check a dev runs on demand.

### 2. `build` ⊂ `doctor`
**Build** is the **blocking code/schema gate**: schema compiles; the lock matches installed plugins' contract versions (ADR-016); every schema `type` resolves to an installed **Field plugin**; queries have their indexes (ADR-019); no **Capability conflict**. **`doctor` runs all of those *and* audits content**: drift / **Unknown fields** across all docs, dangling **Reference fields**, parse errors, required-but-empty — and runs **full validation** across *every* document.

### 3. `doctor` runs custom code; the editor and TinaCloud don't (fully)
Because it runs **in Node** (ADR-015), `doctor` executes **custom `validate` functions and custom Format adapters** across all content — the comprehensive validation neither the editor (one open doc) nor managed TinaCloud (no plugin code) performs. This is what makes it useful both as a quick local check *and* as an optional CI gate.

### 4. Configurable severity; optional CI gate; deploy build never blocks on content
Each finding has **error / warn / off** severity. `doctor` **can** gate CI (non-zero exit) — but that's **opt-in**, not its purpose; primarily it's a dev convenience. The **deploy build only ever blocks on code/schema, never on content drift** — never brick a deploy over a stray frontmatter key (ADR-012).

## Consequences

### Positive
- One tool backs every "audit catches it" promise scattered through the ADRs.
- Devs get **fast static feedback without running the app**; teams *can* wire it into CI (incl. custom validation over all content) if they want.
- The brick-on-drift line is preserved: content never fails a deploy.

### Negative
- Building the index + running all validators can be slow on huge content sets — mitigate with an incremental / changed-files mode.
- Two "severities of checking" (build-blocking code/schema vs `doctor`-configurable content) to keep clear in docs.

## Alternatives Considered
- **Fold content checks into build** (block deploys on drift) — *rejected*: brick-on-drift (ADR-012).
- **Require a running app to audit** — *rejected*: defeats the quick-static-check purpose.
- **Always gate CI** — *rejected*: it's primarily a dev tool; gating is optional.

## References
- [CONTEXT.md](./CONTEXT.md) — `tina doctor`, Schema, `tina-lock.json`, Unknown field, Reference field, Execution boundary, Local Data Layer
- [ADR-012](./012-form-lifecycle.md), [ADR-015](./015-execution-boundary.md), [ADR-016](./016-schema-compiled-artifact.md), [ADR-017](./017-content-model.md), [ADR-019](./019-content-capability-contract.md)
