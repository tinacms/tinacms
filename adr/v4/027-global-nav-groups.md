# ADR-027: Global Nav Groups

## Status
**Proposed**. Two decisions are open for review: how an entry joins a group (Decision 1) and where groups sit in the sidebar (Decision 2). Extends [ADR-013](./013-ui-extension-slots.md) (the `globalNav` slot), under its §6 rule that ordering is explicit, never load-order. A related question also stays open: whether **Collections** becomes an ordinary group, so plugins can add entries under it.

## Context
The v3 sidebar groups its entries under headings: **Collections**, **Cloud** for the TinaCloud links, and one heading per screen `navCategory` (`'Account' | 'Site' | 'Dashboard'`). The v4 `globalNav` slot has no grouping. Every entry renders in one flat list after Collections, sorted by `order`. Once [tinacms#7855](https://github.com/tinacms/tinacms/pull/7855) merges, the TinaCloud plugin's Project Config, User Management and Support links ([tinacms#6883](https://github.com/tinacms/tinacms/issues/6883)) sit there with no heading, beside entries such as Media.

ADR-013 accepts that a new slot needs a core change. Whether a new *heading* also needs one is the main trade-off in Decision 1.

## Decision 1: How an entry joins a group

### Option 1A: Free-text group on the entry
`GlobalNavEntry` gains an optional `group: string`. The sidebar renders one heading per distinct `group`; the name is also the heading text, and names match exactly.

```ts
globalNav: [
  { label: 'Project Config', group: 'Cloud', icon: CloudIcon, target: { kind: 'url', href } },
  { label: 'Support', group: 'Cloud', icon: CircleHelpIcon, target: { kind: 'url', href: supportUrl } },
]
```

- **+** One optional field; existing entries are unaffected; plugins add headings with no core change.
- **−** A typo (`'Cloud'` vs `'cloud'`) makes a second heading, which only shows when the admin renders. Plugins sharing a heading must agree on its exact text.

### Option 1B: Fixed group list in core
`group` is a core union, as v3's `navCategory` was.

```ts
group?: 'Cloud' | 'Account' | 'Site';
```

- **+** Headings are consistent, and core controls their order.
- **−** Every new heading needs a core change; v3 left third parties with three categories that did not fit them.

### Option 1C: Declared groups
Plugins contribute groups, and entries reference them by id. An unknown id throws at boot, as an unknown screen target does.

```ts
slots: {
  navGroups: [{ id: 'tinacloud', label: 'Cloud', order: 50 }],
  globalNav: [{ label: 'Support', group: 'tinacloud', /* … */ }],
}
```

- **+** Groups get their own `order`, typos fail at boot, and the id is separate from the label.
- **−** A second concept to learn and document. Moving from 1A to 1C later breaks every entry whose group is not declared, unless core creates a group for each undeclared string (with the string as both id and label).

### Option 1D: One slot per section
`globalNav.cloud`, `globalNav.account`, and so on.

- **+** Fully typed.
- **−** Every heading becomes a core change, which defeats a fan-in slot.

### Option 1E: Nested entries
An entry carries `children: GlobalNavEntry[]`.

- **+** Collapsible sections come for free.
- **−** The list becomes a tree, and it is unclear what a click on the parent does.

### Option 1F: One heading per plugin
The heading is the contributing plugin's name; no API change.

- **+** Nothing to add.
- **−** One-link plugins get a pointless heading, and a plugin cannot split its entries across sections.

### Option 1G: No headings
Keep the flat list; plugins rely on `order` ranges alone.

- **+** Nothing to build.
- **−** Loses v3 parity, and the sidebar gets harder to scan as plugins add entries.

## Decision 2: Where groups sit

Applies to any Decision 1 option that produces headings. In every option below, entries sort by `order` as before, entries inside a group keep that order, and groups order among themselves by their lowest-ordered entry (or by the group's own `order` under 1C). Ties, between entries or between groups, keep the plugin order in `defineConfig`, as `globalNav` already does (ADR-013 §6 asks for a stable fallback; `packages/v4/@tinacms/tinacms/_docs/ui-slots.md` in tinacms defines it).

All three examples render these entries (illustrative labels and `order` values):

```text
  Media        0
  Project Cfg  5   Cloud
  Branches     6
  User Mgmt    8   Cloud
  Support      20  Cloud
```

### Option 2A: Inline
Each group takes the position of its lowest-ordered entry, and pulls its other entries up beside it.

```text
  Media
  CLOUD
    Project Cfg
    User Mgmt
    Support
  Branches
```

- **+** Respects every plugin's `order`; a plugin can place its group anywhere.
- **−** A grouped entry can appear above entries with a lower `order` (Support, 20, renders above Branches, 6), so the result is the hardest to predict.

### Option 2B: Groups first, then Other
All groups render first. Ungrouped entries go under an **Other** heading at the end.

```text
  CLOUD
    Project Cfg
    User Mgmt
    Support
  OTHER
    Media
    Branches
```

- **+** Every entry sits under a heading, so the sidebar looks uniform.
- **−** Other becomes a catch-all, and a plugin's main link (Media) sinks below every section.

### Option 2C: Ungrouped first, then groups
All ungrouped entries render first, with no heading. Groups follow.

```text
  Media
  Branches
  CLOUD
    Project Cfg
    User Mgmt
    Support
```

- **+** The simplest rule to explain, ungrouped entries keep their relative order, and loose links stay next to Collections.
- **−** Every grouped entry renders below every ungrouped one, whatever its `order` (Project Cfg, 5, renders below Branches, 6), so a plugin cannot place a group above an ungrouped entry.

## Consequences

### Positive
- Under any option except 1G, the sidebar regains headings as v3 had; every option except 1F and 1G can restore v3's Cloud heading for `tinaCloud()`.

### Negative
- Headings change how a plugin's `order` reads under every Decision 2 option, so the slot docs (`packages/v4/@tinacms/tinacms/_docs/ui-slots.md` in tinacms) and a `global-nav` test must spell out the chosen rule.

## Alternatives Considered
The options under Decision 1 and Decision 2 are the alternatives; the ones not adopted move here once the decisions are made.

## References
- [tinacms#6883](https://github.com/tinacms/tinacms/issues/6883), [tinacms#7855](https://github.com/tinacms/tinacms/pull/7855)
- [ADR-006](./006-plugin-dependency-resolution.md), [ADR-013](./013-ui-extension-slots.md)
