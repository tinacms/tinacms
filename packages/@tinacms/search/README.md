# @tinacms/search

Full-text search solution for TinaCMS powered by [search-index](https://github.com/fergiemcdowall/search-index).

## Features

- 🔍 **Full-text search** - Index and search across all your content
- 🎯 **Fuzzy matching** - Find results even with typos and misspellings
- ⚡ **Fast & Lightweight** - Client-side search with minimal overhead
- 🌐 **Cloud-ready** - Works with TinaCMS Cloud or self-hosted
- 🔧 **Configurable** - Customize stop words, tokenization, and search behavior
- 📦 **Zero config** - Works out of the box with sensible defaults

## Installation

```bash
npm install @tinacms/search
# or
yarn add @tinacms/search
# or
pnpm add @tinacms/search
```

## Quick Start

### Local Search

```typescript
import { LocalSearchIndexClient } from '@tinacms/search';

// Create a search client
const client = new LocalSearchIndexClient({
  stopwordLanguages: ['eng'],
});

// Initialize the index
await client.onStartIndexing();

// Index your documents
await client.put([
  {
    _id: '1',
    title: 'Getting Started with TinaCMS',
    body: 'TinaCMS is a Git-backed headless CMS',
  },
  {
    _id: '2',
    title: 'React Tutorial',
    body: 'Learn how to build React applications',
  },
]);

// Search your content
const results = await client.query('TinaCMS tutorial', {
  limit: 10,
});

console.log(results.results); // Array of matching documents
console.log(results.total);   // Total number of matches
```

### With Fuzzy Search

```typescript
// Enable fuzzy search to handle typos
const results = await client.query('TinCMS tutrial', {
  fuzzy: true,
  fuzzyOptions: {
    maxDistance: 2,      // Allow up to 2 character edits
    minSimilarity: 0.6,  // Require 60% similarity
  },
  limit: 10,
});

// Matches: "TinaCMS tutorial" despite typos!
```

### TinaCMS Cloud

```typescript
import { TinaCMSSearchIndexClient } from '@tinacms/search';

const client = new TinaCMSSearchIndexClient({
  apiUrl: 'https://content.tinajs.io',
  branch: 'main',
  indexerToken: process.env.TINA_SEARCH_TOKEN,
  stopwordLanguages: ['eng'],
});

await client.onStartIndexing();
await client.put(documents);
await client.onFinishIndexing(); // Uploads index to cloud

// Search works the same way
const results = await client.query('search query', {
  fuzzy: true,
  limit: 10,
});
```

## Documentation

- **[Fuzzy Search Guide](./FUZZY_SEARCH.md)** - Complete guide to fuzzy matching and typo tolerance
- **[Spike Report](./spike-fuzzy-search/SPIKE_REPORT.md)** - Design decisions and implementation details

## API Reference

### SearchClient

#### `new LocalSearchIndexClient(options)`

Create a local search client.

**Options:**
- `stopwordLanguages` (`string[]`): Languages for stop word filtering (e.g., `['eng']`)
- `tokenSplitRegex` (`string`): Custom regex for tokenization

#### `client.onStartIndexing()`

Initialize the search index. Must be called before indexing documents.

#### `client.put(documents)`

Index an array of documents.

**Parameters:**
- `documents` (`Array<{ _id: string, [key: string]: any }>`): Documents to index

#### `client.query(query, options)`

Search the index.

**Parameters:**
- `query` (`string`): Search query string
- `options` (`SearchOptions`):
  - `limit` (`number`): Maximum results to return
  - `cursor` (`string`): Pagination cursor
  - `fuzzy` (`boolean`): Enable fuzzy matching (default: `false`)
  - `fuzzyOptions` (`FuzzySearchOptions`): Fuzzy search configuration

**Returns:**
```typescript
{
  results: Array<any>;     // Matching documents
  total: number;           // Total number of matches
  nextCursor: string | null; // Next page cursor
  prevCursor: string | null; // Previous page cursor
}
```

#### `client.del(ids)`

Delete documents from the index.

**Parameters:**
- `ids` (`string[]`): Array of document IDs to delete

#### `client.export(filename)`

Export the index to a SQLite file (local only).

**Parameters:**
- `filename` (`string`): Path to save the index

### FuzzySearchOptions

```typescript
interface FuzzySearchOptions {
  maxDistance?: number;        // Max edit distance (default: 2)
  minSimilarity?: number;      // Min similarity 0-1 (default: 0.6)
  maxResults?: number;         // Max similar terms (default: 10)
  useTranspositions?: boolean; // Handle transpositions (default: true)
  caseSensitive?: boolean;     // Case-sensitive matching (default: false)
}
```

### Utility Functions

```typescript
import {
  levenshteinDistance,
  damerauLevenshteinDistance,
  similarityScore,
  findSimilarTerms,
} from '@tinacms/search';

// Calculate edit distance
const distance = levenshteinDistance('hello', 'helo'); // 1

// With transpositions
const distanceT = damerauLevenshteinDistance('hello', 'hlelo'); // 1

// Similarity score (0-1)
const similarity = similarityScore('hello', 'helo'); // 0.8

// Find similar terms
const similar = findSimilarTerms('Raect', ['React', 'reach'], {
  maxDistance: 2,
});
```

## Examples

### Basic Search

```typescript
const results = await client.query('React', { limit: 5 });
```

### Fuzzy Search

```typescript
const results = await client.query('Raect', {
  fuzzy: true,
  limit: 5,
});
```

### Multi-word Search

```typescript
const results = await client.query('React tutorial beginner', {
  fuzzy: true,
  limit: 10,
});
```

### Pagination

```typescript
const page1 = await client.query('React', { limit: 10 });
const page2 = await client.query('React', {
  limit: 10,
  cursor: page1.nextCursor,
});
```

### Document Updates

```typescript
// Add/update documents
await client.put([
  { _id: '1', title: 'New Document', body: 'Content' },
]);

// Delete documents
await client.del(['1', '2', '3']);
```

### Custom Tokenization

```typescript
const client = new LocalSearchIndexClient({
  stopwordLanguages: ['eng'],
  tokenSplitRegex: '[\p{L}\d_-]+', // Include hyphens
});
```

## Use Cases

- **Documentation Search** - Search across docs, guides, and tutorials
- **Blog Search** - Full-text search for blog posts and articles
- **E-commerce** - Product search with fuzzy matching
- **Knowledge Base** - Search FAQs, help articles, and support docs
- **Content Sites** - Any content-heavy site that needs search

## Performance

### Indexing

- **Small sites** (< 100 docs): < 1s
- **Medium sites** (100-1,000 docs): 1-5s
- **Large sites** (1,000-10,000 docs): 5-30s

### Search

- **Exact search**: < 10ms
- **Fuzzy search** (small dict): 5-20ms
- **Fuzzy search** (large dict): 20-100ms

### Tips for Better Performance

1. **Use stop words** to reduce index size
2. **Enable fuzzy search** only when needed
3. **Limit `maxResults`** in fuzzy options
4. **Use pagination** for large result sets
5. **Enable prefix filtering** for very large dictionaries

## Troubleshooting

### No Search Results

1. Check documents are indexed: `await client.onStartIndexing()` then `client.put(docs)`
2. Verify query terms exist in documents
3. Try enabling fuzzy search: `{ fuzzy: true }`
4. Check stop words aren't filtering your terms

### Fuzzy Search Not Finding Results

1. Increase `maxDistance`: `{ fuzzyOptions: { maxDistance: 3 } }`
2. Lower `minSimilarity`: `{ fuzzyOptions: { minSimilarity: 0.5 } }`
3. Disable prefix filter: `{ fuzzyOptions: { usePrefixFilter: false } }`

### Slow Search Performance

1. Disable fuzzy search when not needed
2. Reduce `maxResults` in fuzzy options
3. Enable prefix filtering for large dictionaries
4. Use more restrictive similarity thresholds

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run specific tests
pnpm test fuzzy
pnpm test integration

# Build
pnpm build

# Lint
pnpm lint
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) and [Code of Conduct](../../CODE_OF_CONDUCT.md).

## License

Licensed under the Apache 2.0 License. See [LICENSE](../../LICENSE) for more information.

## Resources

- [TinaCMS Documentation](https://tina.io/docs)
- [search-index Library](https://github.com/fergiemcdowall/search-index)
- [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance)
- [Fuzzy Search Guide](./FUZZY_SEARCH.md)

## Support

- [GitHub Issues](https://github.com/tinacms/tinacms/issues)
- [Discord Community](https://discord.com/invite/zumN63Ybpf)
- [TinaCMS Forum](https://github.com/tinacms/tinacms/discussions)
