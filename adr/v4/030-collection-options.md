# ADR-030: Collection Options Live at the Top Level, Not Under `ui`

## Status
**Proposed** (2026-11-12). Decided by Ivan, Josh and Matt, except the property names in Decision 1, which are open (see Open questions). Completes the carve-out in [ADR-029](./029-field-ui-options.md), which left collection options to their own ADR. Builds on [ADR-015](./015-execution-boundary.md), [ADR-016](./016-schema-compiled-artifact.md) and [ADR-017](./017-content-model.md).

## Context
v3 configures a collection through a `ui` object (`UICollection`, `packages/@tinacms/schema-tools/src/types/index.ts:1265`). It holds `filename`, `allowedActions`, `global`, `router` and `beforeSubmit`. v4 collections have no `ui` object (`CollectionSchema`, `core/schema/types.ts:83`).

ADR-029 §1 removed the `ui` wrapper for fields. It left collection options out of scope. A collection needs the same rule, or authors look in two places.

[#8042](https://github.com/tinacms/tinacms/issues/8042) (browsing a collection's documents) adds Rename, Duplicate and Delete to the document list. v3's `allowedActions` has `create`, `delete`, `createFolder` and `createNestedFolder` (`types/index.ts:1311`). It has no switch for Duplicate. A developer who wants to stop editors deleting documents needs one place to say so.

This ADR decides where the first two collection options live. It decides nothing about the rest.

## Decision

### 1. `allowedActions` moves to the top level of the collection
There is no `ui` wrapper, as in ADR-029 §1. Each action is a boolean. Every action defaults to `true`, as in v3.

| Option | Controls |
|---|---|
| `canCreate` | Creating a document |
| `canDelete` | Deleting a document |
| `canDuplicate` | Duplicating a document |
| `canCreateFolder` | Creating a folder |
| `canCreateNestedFolder` | Creating a folder inside a folder |

Rename has no switch.

An action set to `false` is not shown in the Admin UI, and the server refuses a request for it. The options are plain booleans, so they serialize into `tina-lock.json` and run everywhere, including inside TinaCloud (ADR-015, ADR-016 §1). The Data Layer does not rely on the browser to hide them (ADR-015: the client is UX only).

v3's `createFolder` and `createNestedFolder` keep their meaning under new names.

```ts
export const authorCollection = {
  name: 'author',
  path: 'content/authors',
  format: 'md',
  canDelete: false,
  fields: [t.string({ name: 'name' })],
} satisfies CollectionSchema;
```

### 2. `description: string` is a top-level collection option
A collection gets a `description`, as a field does (ADR-029 §2). It is plain text that says what the collection is for. This ADR does not decide where the Admin UI shows it.

## Deferred
These options stay undecided. Each needs its own decision.

- `hidden` ([#7460](https://github.com/tinacms/tinacms/issues/7460)).
- A help link ([#7461](https://github.com/tinacms/tinacms/issues/7461)).
- `filename` (`parse`, `slugify`, `readonly`, `showFirst`, `description`). It belongs with the work that creates documents.
- `global`, `router` and `beforeSubmit`. ADR-014 and ADR-028 already cover save hooks.

## Consequences

### Positive
- A collection option sits in the same place as a field option.
- Duplicate has a switch, and the server enforces all of them.
- The options are declarative, so TinaCloud enforces them without running plugin code.

### Negative
- v3 users get a migration note: `ui.allowedActions.create` becomes `canCreate`, and so on for each option.
- The server needs a check per action. Today only `content:save` exists as a permission (ADR-008), so the check is new code.

## Open questions
- **Property names.** After approval, Matt asked for verbs: `canCreate` and `canDelete`, or `createAllowed` and `deleteAllowed`. This draft uses the `can` form. Ivan, Josh and Matt confirm one before the ADR becomes **Accepted**.

## Alternatives Considered

### 1. Where `allowedActions` lives
- **Keep a `ui` wrapper on collections.** This keeps the v3 shape. Rejected: ADR-029 removed the wrapper for fields, and one rule is easier to learn than two.

### 2. Names
- **Keep v3's `create`, `delete`, `createFolder` and `createNestedFolder`.** No change for v3 users. Rejected: a bare noun at the top of a collection reads as data, not as a switch.

## References
- [#8042](https://github.com/tinacms/tinacms/issues/8042): UI | Browsing a collection's documents
- [ADR-015](./015-execution-boundary.md), [ADR-016](./016-schema-compiled-artifact.md), [ADR-017](./017-content-model.md), [ADR-029](./029-field-ui-options.md)
