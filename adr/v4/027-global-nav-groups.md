# ADR-027: Global Nav Groups

## Status
**Accepted** (2026-10-19). Decided by Brook, Eli and Josh. Adopts **declared groups** (Option 1C) placed **inline** (Option 2A). Extends [ADR-013](./013-ui-extension-slots.md) (the `globalNav` slot), under its §6 rule that ordering is explicit, never load-order.

## Context
The v3 sidebar groups its entries under headings: **Collections**, **Cloud** for the TinaCloud links, and one heading per screen `navCategory` (`'Account' | 'Site' | 'Dashboard'`). The v4 `globalNav` slot has no grouping. Every entry renders in one flat list after Collections, sorted by `order`. Once [tinacms#7855](https://github.com/tinacms/tinacms/pull/7855) merges, the TinaCloud plugin's Project Config, User Management and Support links ([tinacms#6883](https://github.com/tinacms/tinacms/issues/6883)) sit there with no heading, beside entries such as Media.

ADR-013 accepts that a new slot needs a core change. The question here was whether a new *heading* also needs one, and where headed groups sit among ungrouped entries.

## Decision

### 1. Plugins declare groups; entries reference them by id
A new `navGroups` slot takes `{ id, label, order }`. A `globalNav` entry joins a group with an optional `group` set to that id. An entry that names an unknown group id throws at boot, as an unknown screen target does.

```ts
slots: {
  navGroups: [{ id: 'tinacloud', label: 'Cloud', order: 5 }],
  globalNav: [
    { label: 'Project Config', group: 'tinacloud', icon: CloudIcon, target: { kind: 'url', href } },
    { label: 'Support', group: 'tinacloud', icon: CircleHelpIcon, target: { kind: 'url', href: supportUrl } },
  ],
}
```

Entries without `group` are unaffected. Any plugin can add a heading without a core change, and the id is separate from the label, so a label can change without breaking the entries that use it.

### 2. Groups sit inline among ungrouped entries
Ungrouped entries and groups sort together in one list: an ungrouped entry by its `order`, a group by its declared `order`. Inside a group, entries sort by their own `order`. Ties, between entries or between groups, keep the plugin order in `defineConfig`, as `globalNav` already does (ADR-013 §6 asks for a stable fallback; `packages/v4/@tinacms/tinacms/_docs/ui-slots.md` defines it).

A plugin places its group anywhere in the sidebar, and every `order` is respected. Because the group's position comes from the group's own `order`, a grouped entry's `order` only ranks it inside its group.

Inside one plugin, entries without `order` keep their list order, so the §1 example needs none. `order` places an entry among the entries of another plugin. Here, a billing plugin puts its entry in the Cloud group, between two TinaCloud entries:

```ts
// tinaCloud()
globalNav: [
  { label: 'Project Config', group: 'tinacloud', order: 0, ... },
  { label: 'User Management', group: 'tinacloud', order: 10, ... },
]
// billingPlugin()
globalNav: [{ label: 'Billing', group: 'tinacloud', order: 5, ... }]
```

```text
  Media          0                 Media
  Cloud group    5                 CLOUD
    Project Cfg  0     renders       Project Cfg
    Billing      5     ───────▶      Billing
    User Mgmt    10                  User Mgmt
  Branches       6                 Branches
```

Without `order`, Billing can only come before or after every TinaCloud entry, depending on where `defineConfig` lists the two plugins.

## Consequences

### Positive
- The sidebar regains headings as v3 had, and `tinaCloud()` can restore v3's Cloud heading.
- A typo in a group id fails at boot, not as a stray second heading in the rendered admin.
- Plugins sharing a heading agree on an id, not on exact label text.

### Negative
- `navGroups` is a second concept for plugin authors to learn, and the slot docs must cover it.
- A grouped entry's `order` now means "position inside the group", not "position in the sidebar". The slot docs (`packages/v4/@tinacms/tinacms/_docs/ui-slots.md`) and a `global-nav` test must spell out the rule above.

## Open question
Whether **Collections** becomes an ordinary declared group, so plugins can add entries under it. This ADR does not decide it; Collections keeps its fixed place above `globalNav` until it does.

## Alternatives Considered

### How an entry joins a group
- **1A: Free-text `group: string` on the entry.** One optional field, and the name doubles as the heading. Rejected: a typo (`'Cloud'` vs `'cloud'`) makes a second heading that only shows when the admin renders, and plugins sharing a heading must agree on its exact text.
- **1B: Fixed group union in core** (`'Cloud' | 'Account' | 'Site'`, as v3's `navCategory`). Rejected: every new heading needs a core change, and v3 left third parties with three categories that did not fit them.
- **1D: One slot per section** (`globalNav.cloud`, `globalNav.account`). Fully typed, but every heading becomes a core change, which defeats a fan-in slot.
- **1E: Nested entries** (`children: GlobalNavEntry[]`). The list becomes a tree, and it is unclear what a click on the parent does.
- **1F: One heading per plugin.** One-link plugins get a pointless heading, and a plugin cannot split its entries across sections.
- **1G: No headings.** Loses v3 parity, and the sidebar gets harder to scan as plugins add entries.

### Where groups sit
- **2B: Groups first, then an Other heading for ungrouped entries.** Rejected: Other becomes a catch-all, and a plugin's main link (Media) sinks below every section.
- **2C: Ungrouped entries first, then groups.** The simplest rule to explain, but every grouped entry renders below every ungrouped one whatever its `order`, so a plugin cannot place a group above an ungrouped entry.

## References
- [tinacms#6883](https://github.com/tinacms/tinacms/issues/6883), [tinacms#7855](https://github.com/tinacms/tinacms/pull/7855)
- [tinacmsv4-docs#7](https://github.com/tinacms/tinacmsv4-docs/pull/7), where the options were proposed
- [ADR-006](./006-plugin-dependency-resolution.md), [ADR-013](./013-ui-extension-slots.md)
