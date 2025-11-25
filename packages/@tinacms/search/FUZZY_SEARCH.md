# Fuzzy Search

Fuzzy search allows TinaCMS search to match queries with typos and spelling variations using Levenshtein distance algorithms.

## Overview

When users make typos or spelling mistakes in search queries, fuzzy search helps find relevant results by matching similar terms. For example:
- "Raect" finds "React"
- "JavaScirpt" finds "JavaScript"  
- "docment" finds "document"
- "teh" finds "the"

## Features

- **Levenshtein Distance Matching** - Calculates edit distance between query terms and indexed terms
- **Damerau-Levenshtein Support** - Handles transposition typos (e.g., "teh" → "the")
- **Configurable Thresholds** - Control matching strictness via maxDistance and minSimilarity
- **LRU Caching** - Caches fuzzy match results for improved performance
- **Query Expansion** - Automatically expands queries with similar terms using OR logic
- **Graceful Fallback** - Falls back to exact search if fuzzy matching fails

## Usage

### Basic Usage

```typescript
import { LocalSearchIndexClient } from '@tinacms/search';

const client = new LocalSearchIndexClient({
  stopwordLanguages: ['eng'],
});

await client.onStartIndexing();

// Index some documents
await client.put([
  { _id: '1', title: 'React Tutorial', body: 'Learn React' },
  { _id: '2', title: 'TypeScript Guide', body: 'TypeScript basics' },
]);

// Search with fuzzy matching enabled
const results = await client.query('Raect tutrial', {
  fuzzy: true,
  limit: 10,
});

// Results will include documents matching "React" and "tutorial"
```

### With Custom Options

```typescript
const results = await client.query('JavaScirpt', {
  fuzzy: true,
  fuzzyOptions: {
    maxDistance: 2,        // Allow up to 2 character edits
    minSimilarity: 0.7,    // Require 70% similarity
    maxResults: 5,         // Return top 5 similar terms per query term
    useTranspositions: true, // Handle transposition typos
    caseSensitive: false,  // Case-insensitive matching
  },
  limit: 20,
});
```

### TinaCMS Cloud

Fuzzy search works automatically with TinaCMS Cloud:

```typescript
import { TinaCMSSearchIndexClient } from '@tinacms/search';

const client = new TinaCMSSearchIndexClient({
  apiUrl: 'https://your-api.com',
  branch: 'main',
  indexerToken: 'your-token',
  stopwordLanguages: ['eng'],
});

await client.onStartIndexing();
await client.put(documents);

// Fuzzy search works the same way
const results = await client.query('searchh query', {
  fuzzy: true,
});
```

## Configuration Options

### FuzzySearchOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxDistance` | `number` | `2` | Maximum Levenshtein distance allowed for a match. Lower values = stricter matching. |
| `minSimilarity` | `number` | `0.6` | Minimum similarity score (0-1) required for a match. Higher values = stricter matching. |
| `maxResults` | `number` | `10` | Maximum number of similar terms to return per query term. |
| `useTranspositions` | `boolean` | `true` | Use Damerau-Levenshtein distance to handle transposition typos (e.g., "teh" → "the"). |
| `caseSensitive` | `boolean` | `false` | Enable case-sensitive matching. |
| `usePrefixFilter` | `boolean` | `false` | Filter candidates by prefix before calculating distance (performance optimization, but may miss some matches). |
| `prefixLength` | `number` | `2` | Length of prefix to use when `usePrefixFilter` is enabled. |

### How It Works

1. **Query Splitting** - The query is split into individual terms
2. **Dictionary Retrieval** - Gets all indexed terms from search-index
3. **Distance Calculation** - Calculates Levenshtein distance for each term against dictionary
4. **Filtering** - Keeps matches within maxDistance and above minSimilarity thresholds
5. **Ranking** - Sorts results by similarity score (highest first)
6. **Query Expansion** - Builds OR queries: `(term OR similar1 OR similar2) AND (term2 OR similar3)`
7. **Execution** - Runs expanded query against search-index

## Examples

### Example 1: Simple Typo Correction

```typescript
// User types "Raect" instead of "React"
const results = await client.query('Raect', {
  fuzzy: true,
});

// Matches: "React", "react", "React's", etc.
```

### Example 2: Multiple Typos

```typescript
// User types "JavaScirpt tutrial"
const results = await client.query('JavaScirpt tutrial', {
  fuzzy: true,
  fuzzyOptions: {
    maxDistance: 2,
    minSimilarity: 0.65,
  },
});

// Matches: "JavaScript tutorial", "javascript tutorials", etc.
```

### Example 3: Transposition Errors

```typescript
// User types "teh" instead of "the"
const results = await client.query('teh quick fox', {
  fuzzy: true,
  fuzzyOptions: {
    useTranspositions: true, // Handles character swaps efficiently
  },
});

// Matches: "the quick fox"
```

### Example 4: Strict Matching

```typescript
// Require very close matches
const results = await client.query('docement', {
  fuzzy: true,
  fuzzyOptions: {
    maxDistance: 1,        // Only 1 character difference allowed
    minSimilarity: 0.9,    // 90% similarity required
  },
});

// Matches: "document" but not "documents" or "documentary"
```

## Performance Considerations

### Caching

Fuzzy search uses an LRU cache to store similarity calculations:

```typescript
// Default cache size is 100 entries
const client = new LocalSearchIndexClient({...});

// Cache is automatically used for repeated queries
await client.query('Raect', { fuzzy: true }); // Cold cache
await client.query('Raect', { fuzzy: true }); // Warm cache (faster)
```

### Dictionary Size

Fuzzy search performance depends on dictionary size:
- **Small dictionaries** (< 1,000 terms): ~5-10ms per query
- **Medium dictionaries** (1,000-10,000 terms): ~20-50ms per query  
- **Large dictionaries** (> 10,000 terms): ~50-200ms per query

### Optimization Tips

1. **Use Prefix Filtering** for large dictionaries:
   ```typescript
   fuzzyOptions: {
     usePrefixFilter: true,
     prefixLength: 2,
   }
   ```

2. **Reduce maxResults** to limit candidates:
   ```typescript
   fuzzyOptions: {
     maxResults: 5, // Instead of default 10
   }
   ```

3. **Increase minSimilarity** for stricter matching:
   ```typescript
   fuzzyOptions: {
     minSimilarity: 0.75, // Higher threshold = fewer candidates
   }
   ```

## API Reference

### `client.query(query, options)`

Execute a search query with optional fuzzy matching.

**Parameters:**
- `query` (string) - The search query string
- `options` (SearchOptions) - Search options

**Returns:** `Promise<SearchResult>`

```typescript
interface SearchResult {
  results: any[];           // Array of matching documents
  total: number;           // Total number of results
  nextCursor: string | null; // Pagination cursor (if applicable)
  prevCursor: string | null; // Pagination cursor (if applicable)
}
```

### Utility Functions

You can also use the fuzzy search utilities directly:

```typescript
import { 
  levenshteinDistance,
  damerauLevenshteinDistance,
  similarityScore,
  findSimilarTerms,
} from '@tinacms/search';

// Calculate edit distance
const distance = levenshteinDistance('hello', 'helo'); // 1

// Calculate with transpositions
const distanceT = damerauLevenshteinDistance('hello', 'hlelo'); // 1

// Calculate similarity (0-1)
const similarity = similarityScore('hello', 'helo'); // 0.8

// Find similar terms
const similar = findSimilarTerms('Raect', ['React', 'reach', 'create'], {
  maxDistance: 2,
  minSimilarity: 0.6,
});
// Returns: [{ term: 'React', distance: 1, similarity: 0.8 }, ...]
```

## Troubleshooting

### No Results with Fuzzy Search

If fuzzy search isn't finding results:

1. **Check maxDistance** - Increase if terms are very different
   ```typescript
   fuzzyOptions: { maxDistance: 3 } // Try higher value
   ```

2. **Lower minSimilarity** - Decrease threshold
   ```typescript
   fuzzyOptions: { minSimilarity: 0.5 } // Try lower value
   ```

3. **Disable Prefix Filter** - May be blocking matches
   ```typescript
   fuzzyOptions: { usePrefixFilter: false }
   ```

4. **Check Dictionary** - Ensure terms are indexed
   ```typescript
   const dict = await client.searchIndex.DICTIONARY();
   console.log('Indexed terms:', dict);
   ```

### Fuzzy Search Too Slow

If fuzzy search is slow:

1. **Enable Prefix Filter**
   ```typescript
   fuzzyOptions: { usePrefixFilter: true }
   ```

2. **Reduce maxResults**
   ```typescript
   fuzzyOptions: { maxResults: 5 }
   ```

3. **Increase Thresholds**
   ```typescript
   fuzzyOptions: {
     maxDistance: 1,
     minSimilarity: 0.8,
   }
   ```

### Too Many Irrelevant Results

If getting too many false positives:

1. **Decrease maxDistance**
   ```typescript
   fuzzyOptions: { maxDistance: 1 }
   ```

2. **Increase minSimilarity**
   ```typescript
   fuzzyOptions: { minSimilarity: 0.75 }
   ```

3. **Reduce maxResults**
   ```typescript
   fuzzyOptions: { maxResults: 3 }
   ```

## Migration Guide

### From Exact Search

Existing code continues to work without changes:

```typescript
// Before: Exact search
const results = await client.query('React', { limit: 10 });

// After: Still works exactly the same
const results = await client.query('React', { limit: 10 });

// New: Enable fuzzy search
const fuzzyResults = await client.query('Raect', { 
  fuzzy: true,
  limit: 10,
});
```

### Backwards Compatibility

Fuzzy search is **opt-in** and fully backwards compatible:
- Default behavior unchanged (exact search)
- No breaking changes to existing APIs
- Can be enabled per-query basis
- Zero performance impact when disabled

## Testing

Run fuzzy search tests:

```bash
# Unit tests
pnpm test fuzzy.spec.ts

# Integration tests
pnpm test fuzzy-integration.spec.ts

# All tests
pnpm test
```

## Contributing

See the [spike report](/packages/@tinacms/search/spike-fuzzy-search/SPIKE_REPORT.md) for implementation details and design decisions.

## License

Licensed under the Apache 2.0 License.
