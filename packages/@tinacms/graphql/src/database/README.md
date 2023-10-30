The data layer currently has a lot of moving parts, the idea is that the Database class handles business operations, delegating down to the bridge/store for low-level functionality.

## The "bridge"

A bridge can be thought of as a way to get content from the ultimate source of truth into the content API.
This effectively comes in 2 forms, GitHub and Filesystem.

The key differences between GitHub and Filesytem
are that GitHub doesn't support "building" the schema and every form save results in a GitHub commit.

The reason schema building isn't supported for the GitHub bridge is because that would required us to build on
every GraphQL request. Instead, we check the schema into source control, the schema was built by the developer
locally using the Fileystem bridge.

> When we get complete data store support, we can build the schema whenever we get a webhook from GitHub, this would allow our users to remove the `.tina/__generated__` files from source control if they wish to.

## The "store"

A store can be anything that persists a flat collection of keys and values, so
most data solutions should be able to support this capability. An important aspect of the store is that it's
ephemeral, it can be blown away as soon as it's changes are flushed to the "bridge". We'll likely want to
lean into this capability more in the future as we start to think about tackling mutliple branches for a given
repo.

### `supportsSeeding` & `supportsIndexing`

These indicate that the store can hold onto data by itself instead of sending it straight over to the bridge.
Seeding ideally happens whenever bridge data changes. For local setups, it currently only happens when the CLI
is started, for GitHub - I believe we'll want it to happen whenever we get a webhook from the GitHub API.

Generally these 2 concepts go hand-in-hand. They're separate so our tests can "seed" the data into memory
but otherwise behave like a non-data "stores", see [here](https://github.com/tinacms/tinacms/blob/main/packages/%40tinacms/graphql/src/spec/forestry-sample/requests.spec.ts#L20-L27).

### Stores that don't support seeding/indexing

For now, we need to support API requests which have _not_ been indexed into a persisted store. For that reason,
`FilesystemStore` and `GithubStore` exist. They sort of mock out what a store _would_ do if it were able to
persist things. You'll notice that the flags `supportsSeeding` and `supportsIndexing` are `false`. In the
future, these hopefully disappear entirely.

### The "Hydrator" callback

Both `glob` and and `query` take on a second parameter called the "hydrator", (note: Level's `glob` mistakenly refers to it as "callback")
Depending on how you store "attribute" data, you may not need to use the hydrator. For the LevelDB implementation
attribute data stores "pointers" to their respective records, so `hello-world.md` might look like this:

```md
---
title: "Hello"
---

World!
```

The keys and values for attributes on this record would look like this:

```
__attribute__#post#post#title#Hello: ["content/posts/hello.md"]
__attribute__#post#post#body#World!: ["content/posts/hello.md"]
```

The values here are "pointers" to the actual file, so when this record is retrieved, we need to hydrate
it by going and fetching that data. In something like DynamoDB, if we use secondary indexes, there wouldn't
be a need to do this so the hydrator doesn't need to be called.
