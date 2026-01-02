# @tinacms/search

Full-text search for TinaCMS powered by [search-index](https://github.com/fergiemcdowall/search-index).

## Installation

```bash
pnpm add @tinacms/search
```

## Usage

```typescript
import { LocalSearchIndexClient } from "@tinacms/search";

const client = new LocalSearchIndexClient({
  stopwordLanguages: ["eng"],
});

await client.onStartIndexing();

await client.put([
  {
    _id: "1",
    title: "Getting Started",
    body: "TinaCMS is a Git-backed headless CMS",
  },
  {
    _id: "2",
    title: "React Tutorial",
    body: "Learn how to build React applications",
  },
]);

// Basic search
const results = await client.query("TinaCMS", { limit: 10 });

// Fuzzy search (handles typos)
const fuzzyResults = await client.query("TinCMS tutrial", {
  fuzzy: true,
  limit: 10,
});
```

## API

- `client.onStartIndexing()` - Initialize the index
- `client.put(documents)` - Index documents
- `client.query(query, options)` - Search the index
- `client.del(ids)` - Delete documents
- `client.export(filename)` - Export index to SQLite

## License

Apache 2.0
