# ADR-006: Plugin Dependency Resolution via Capabilities

## Status
**Accepted** — supersedes [ADR-005](./005-module-system.md); amends [ADR-002](./002-plugin-first-architecture.md); extended by [ADR-009](./009-field-plugins.md), which adds **keyed capabilities** (many providers, one per key) so that the conflict rule reads "same capability *at the same key*" — `field` is the motivating case.

## Context
ADR-002 declared "everything is a plugin" and explicitly rejected a module system as "too heavy." ADR-005 then introduced a full module system anyway to handle dependency resolution and lifecycle. Shipping both a plugin concept *and* a module concept doubles the surface area users must learn and contradicts ADR-002's stated direction.

We need dependency resolution, ordered initialization, and lifecycle — but without a second top-level concept.

## Decision
Remove the module system. Fold dependency resolution and lifecycle into the plugin itself.

A plugin declares the **capabilities** it provides and the capabilities it depends on:

```js
definePlugin({
  name: 'tinacloud',                  // unique identity of THIS plugin
  provides: ['media', 'search', 'auth'], // capabilities it satisfies
  dependsOn: [],                      // capabilities it requires
  onInit(ctx) { … },
  onDestroy(ctx) { … },
})
```

- **`dependsOn` references capabilities, not plugin names.** A plugin says "I need `media`," not "I need `s3-media`." This preserves ADR-002's "swap any implementation" promise: replacing one provider for a capability requires no change to its dependents.
- **`provides` lets one plugin satisfy several capabilities.** `tinacloud` is the cloud implementation of `media`, `search`, and `auth` simultaneously. This is why `provides` is a list and not derived from a single `type` field — the old `type: 'field' | 'media' | ...` field is removed.
- **Initialization order** is a topological sort over capability dependencies (the same algorithm the module manager used in ADR-005, now keyed on capabilities).

### Capability conflict resolution
Only plugins explicitly listed in `defineConfig({ plugins: [...] })` participate in resolution — a plugin cannot inject itself into the graph.

When two installed plugins provide the same capability:
- **Default: hard error.** The runtime refuses to start and names both providers. Load order never silently picks a winner.
- **Explicit override:** a plugin (or config) may declare `overrides: ['media']` to intentionally replace another provider. This is the only sanctioned, auditable way to win a conflict.

## Consequences

### Positive
- One extensibility concept instead of two; ADR-002 is internally consistent again.
- Implementations are interchangeable because dependents bind to capabilities, not names.
- The "silent plugin hijack via load order" risk is closed: conflicts error, overrides are explicit and greppable.

### Negative
- Swapping a built-in provider now requires either removing it or an explicit `overrides` — slightly more ceremony than last-wins.
  - Accepted deliberately: that ceremony *is* the safety property.

### Neutral
- Plugins still need a defined set of well-known capability names (`media`, `search`, `auth`, `field`, …) plus room for custom ones.

## Considered Options
- **Depend on concrete plugin names** — rejected: stringly-typed coupling to a specific implementation, defeats swappability.
- **Last-wins conflict resolution** — rejected: order-dependent and silently hijackable.
- **Keep the module system (ADR-005)** — rejected: second concept, contradicts ADR-002.

## References
- [ADR-002: Plugin-First Architecture](./002-plugin-first-architecture.md)
- [ADR-005: Module System Design](./005-module-system.md) (superseded)
- [CONTEXT.md](./CONTEXT.md) — Plugin, Capability, Capability conflict
</content>
