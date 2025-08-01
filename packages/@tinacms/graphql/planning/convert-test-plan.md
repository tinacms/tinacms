# Integration Tests to Unit Tests Conversion Plan

## Overview

This plan outlines the strategy for converting the current integration tests in `src/spec/` to proper unit tests that will be placed in the `tests/` directory, following the existing test patterns and structure.

## Current State Analysis

### Integration Tests Structure (`src/spec/`)
- **3 test suites**: `forestry-sample`, `movies-with-datalayer`, `movies`
- **Test pattern**: File-based snapshot testing using GraphQL queries and expected responses
- **Test types**: 
  - Query tests (`requests/` folders) - test GraphQL queries with expected JSON responses
  - Mutation tests (`mutations/` folders) - test GraphQL mutations with expected file or JSON responses
- **Setup**: Uses `setup.ts` with complex database initialization, schema building, and filesystem bridging

### Existing Unit Tests Structure (`tests/`)
- **5 test suites**: `basic-document-get`, `filesystem-bridge`, `is-body`, `is-title`, `reference`
- **Test pattern**: Each test suite is a directory containing:
  - `index.test.ts` - Main test file using vitest
  - `tina/config.ts` - Schema configuration
  - Input files (`in.md`, content files)
  - Expected output files (`node.json`, `out.md`)
- **Setup**: Uses `util.ts` with `setup()` function and `MemoryLevel` for in-memory testing
- **Assertions**: Uses `toMatchFileSnapshot()` for comparing expected outputs

## High Level Strategy

### 1. Follow Existing Test Directory Structure
Each converted test suite will be a self-contained directory with:
- `index.test.ts` - Main test file
- `tina/config.ts` - Schema configuration specific to the test
- Input content files (markdown, etc.)
- Expected output snapshots (`node.json`)

### 2. Use Existing Test Utilities
- Leverage the existing `util.ts` `setup()` function
- Use `MemoryLevel` for fast in-memory testing
- Follow the pattern of `expect(format(result)).toMatchFileSnapshot('node.json')`

### 3. Create Test Categories Based on Integration Test Scenarios

#### A. Document Query Tests
- **Source**: Query scenarios from all 3 integration test suites
- **Target**: Individual test directories like existing pattern
- **Strategy**: Each significant query pattern becomes its own test directory

#### B. Mutation Tests
- **Source**: Mutation scenarios from integration tests
- **Target**: Test directories focused on specific mutation patterns
- **Strategy**: Test document creation, updates, and validation

#### C. Schema Variation Tests
- **Source**: Different schema configurations from the 3 test suites
- **Target**: Test directories for different schema patterns
- **Strategy**: Test complex schemas, references, and templating

#### D. Data Layer Tests
- **Source**: `movies-with-datalayer` specific functionality
- **Target**: Test directories for indexing and search features
- **Strategy**: Test indexing, filtering, and search functionality

## Files to be Created

### New Test Directories (following existing pattern)
```
tests/
├── collection-queries/
│   ├── index.test.ts
│   ├── tina/config.ts
│   ├── movies/
│   │   ├── movie1.md
│   │   └── movie2.md
│   └── node.json
├── filtered-queries/
│   ├── index.test.ts
│   ├── tina/config.ts
│   ├── content/
│   │   └── [test files]
│   └── node.json
├── document-mutations/
│   ├── index.test.ts
│   ├── tina/config.ts
│   ├── in.md
│   ├── node.json
│   └── out.md
├── pending-document-mutations/
│   ├── index.test.ts
│   ├── tina/config.ts
│   ├── content/
│   │   └── [test files]
│   └── node.json
├── templated-collections/
│   ├── index.test.ts
│   ├── tina/config.ts
│   ├── content/
│   │   └── [forestry-sample test files]
│   └── node.json
├── indexed-collections/
│   ├── index.test.ts
│   ├── tina/config.ts
│   ├── movies/
│   │   └── [movies-with-datalayer test files]
│   └── node.json
└── search-filtering/
    ├── index.test.ts
    ├── tina/config.ts
    ├── content/
    │   └── [test files with searchable content]
    └── node.json
```

## Implementation Strategy

### Phase 1: Extract and Convert Simple Query Tests
- Start with basic document queries from integration tests
- Create test directories following the existing pattern
- Use the existing `util.ts` setup function
- Focus on single-query scenarios first

### Phase 2: Convert Complex Query Tests
- Handle collection queries, filtered queries, and list queries
- Create appropriate schema configurations in `tina/config.ts`
- Set up test content files that match the query requirements

### Phase 3: Convert Mutation Tests
- Extract mutation scenarios from integration tests
- Follow the existing pattern of `get()` and `put()` from util.ts
- Test both the GraphQL response and file output changes

### Phase 4: Handle Schema Variations
- Create test directories for different schema types
- Test templated collections, references, and complex field types
- Ensure each schema configuration is isolated in its own test

### Phase 5: Test Data Layer Features
- Convert indexing and search functionality tests
- Test filtering, sorting, and data layer specific features
- Focus on the differences between basic and indexed collections

## Key Differences from Integration Tests

1. **Self-contained Test Directories**: Each test scenario is isolated in its own directory
2. **Memory-based Testing**: Uses `MemoryLevel` instead of real database setup
3. **Snapshot Testing**: Uses `toMatchFileSnapshot()` for predictable output comparison
4. **Simplified Setup**: Uses the existing `util.ts` setup function
5. **Focused Schemas**: Each test has its own minimal schema configuration

## Test File Structure Template

Each test directory will follow this pattern:
```typescript
import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format } from '../util';

it('has the expected output and writes the expected string', async () => {
  const { get } = await setup(__dirname, config);
  const result = await get();
  expect(format(result)).toMatchFileSnapshot('node.json');
});
```

For mutation tests:
```typescript
import { it, expect } from 'vitest';
import config from './tina/config';
import { setup, format, assertDoc } from '../util';
import input from './in.md?raw';

it('has the expected output and writes the expected string', async () => {
  const { get, put } = await setup(__dirname, config);
  const result = await get();
  expect(format(result)).toMatchFileSnapshot('node.json');
  await put(assertDoc(result).data.document._values);
  expect(input).toMatchFileSnapshot('out.md');
});
```

## Success Criteria

1. **Coverage**: All functionality covered by integration tests is now covered by unit tests
2. **Performance**: Unit tests run significantly faster than integration tests
3. **Maintainability**: Tests follow the existing pattern and are easy to understand
4. **Isolation**: Each test is self-contained with its own schema and content
5. **Consistency**: All tests use the same utilities and patterns as existing tests
