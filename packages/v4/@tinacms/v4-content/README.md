# @tinacms/v4-content

The content contract that TinaCMS v4 and TinaCloud share. Both read a
committed `tina-lock.json`, and both read and write documents in the same way.
This package holds that code, so the two cannot drift.

| Export | What it holds |
|---|---|
| `@tinacms/v4-content/schema` | The schema types that a lock carries, and the helpers that walk them. |
| `@tinacms/v4-content/lock` | `TinaLock`, `LOCK_VERSION` and `parseTinaLock(raw)`. |
| `@tinacms/v4-content/format-adapters` | The markdown and JSON adapters that parse and serialize documents. |
| `@tinacms/v4-content/graphql` | `lockToGraphQL(lock)`. It builds the v3 GraphQL schema and lookup for a lock. It needs the optional peers `@tinacms/graphql` and `graphql`. |

`lockToGraphQL` puts a collection that the v3 engine cannot serve into
`skipped`. It does not throw for that collection.

## Golden fixtures

Each folder in `fixtures/` holds a lock, its content, a list of queries, and
the expected output. `@tinacms/tinacms` runs the local GraphQL pipeline against
each folder and compares the output byte for byte. A change to the output is a
change to the contract: update the files in `expected/` in the same pull
request, and say why.
