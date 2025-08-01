# Phase 3: Mutation Tests Conversion - Detailed Plan

## Overview

Phase 3 focuses on converting mutation tests from the integration test suites to unit tests. This phase builds on the patterns established in Phases 1 and 2, adapting them for GraphQL mutations that create, update, and manage documents using **MemoryCaptureBridge validation** to capture Bridge writes in memory while avoiding filesystem dependencies and race conditions.

## Phase 3 Scope

### Target Integration Test Scenarios (6 mutation tests)
1. **`document-update-mutation`** - Update existing document content and fields
2. **`pending-document-creation`** - Create new documents via addPendingDocument mutation
3. **`pending-document-with-template`** - Create documents with specific template assignments
4. **`document-creation-mutation`** - Create new documents via createDocument mutation
5. **`document-update-with-variables`** - Update documents using GraphQL variables
6. **`pending-document-validation`** - Test validation and error handling for pending documents

### Success Criteria
- All 6 converted mutation tests pass
- Tests follow existing unit test patterns (get/put operations)
- Tests validate both GraphQL response and Bridge write operations
- Each test is self-contained and isolated using MemoryLevel database
- Tests run significantly faster than integration tests
- No filesystem dependencies or race conditions
- Bridge writes are captured in memory for verification without filesystem I/O

## Mutation Test Analysis

### Mutation Types Found in Integration Tests

#### A. Update Mutations
- **Source**: `updateDocument`, `updateMovie` mutations
- **Pattern**: Modify existing document fields, test response and in-memory document changes
- **Files**: `_mutation.*.gql`, `_response.md` or `_response.json`

#### B. Pending Document Mutations  
- **Source**: `addPendingDocument` mutations
- **Pattern**: Create new documents in memory database without filesystem writes
- **Files**: `_mutation.*.gql`, `_response.json`

#### C. Document Creation Mutations
- **Source**: `createDocument` mutations  
- **Pattern**: Create new documents in memory database with content validation
- **Files**: `_mutation.*.gql`, `_response.md`

#### D. Variable-based Mutations
- **Source**: Mutations with `_variables.json`
- **Pattern**: Use GraphQL variables for dynamic mutation parameters
- **Files**: `_mutation.*.gql`, `_variables.json`, `_response.md`

## Detailed Step-by-Step Implementation

### Step 1: Create Document Update Mutation Test - DONE

**1.1 Create Test Structure**
```
tests/document-update-mutation/
├── index.test.ts
├── tina/config.ts
├── in.md
└── response.json (will be generated with descriptive names)
```

**1.2 Extract Schema Configuration**
- Use movies schema with update mutation support
- Include fields that will be modified (title, genre, rating, etc.)
- Ensure mutation types are properly defined

**1.3 Create Test Content**
- Create `in.md` with initial movie content
- Include all fields that will be updated in the mutation

**1.4 Create Test File**
- Create `index.test.ts` that:
  1. Uses `setupMutation()` to get test infrastructure with MemoryCaptureBridge
  2. Executes update mutation via `get()` with mutation query and variables
  3. Validates GraphQL response snapshot
  4. Validates Bridge write operations via `bridge.getWrite()` and snapshots
- Follow MemoryCaptureBridge pattern for validating filesystem changes

**1.5 Generate and Validate**
- Run test and generate snapshots for both GraphQL response and Bridge writes
- Validate document changes via captured Bridge writes without filesystem dependencies

### Step 2: Create Pending Document Creation Test

**2.1 Create Test Structure**
```
tests/pending-document-creation/
├── index.test.ts
├── tina/config.ts
├── addPendingDocument-response.json (will be generated)
└── new-post-content.md (will be generated)
```

**2.2 Create Schema Configuration**
- Create schema supporting `addPendingDocument` mutation using `Schema` from `@tinacms/schema-tools`
- Use direct `fields` property instead of `templates` for simplicity unless templates are specifically required
- Focus on document creation without immediate file output

**2.3 Create Test File**
- Create `index.test.ts` that:
  1. Uses `setupMutation()` with MemoryCaptureBridge
  2. Executes `addPendingDocument` mutation via `get()` with custom query
  3. Validates GraphQL response (should return document metadata)
  4. Validates Bridge write operations for newly created document

**2.4 Mutation Implementation**
- Use `get()` with custom mutation query instead of default query
- Include `variables: {}` parameter for consistency
- Example query: `mutation { addPendingDocument(collection: "post", relativePath: "new-post.md") { __typename } }`
- Only include `template` parameter if using templates in schema

### Step 3: Create Pending Document with Template Test

**3.1 Create Test Structure**
```
tests/pending-document-with-template/
├── index.test.ts
├── tina/config.ts
├── node.json (will be generated)
└── (template-specific test)
```

**3.2 Create Schema Configuration**
- Create schema with multiple templates/union types
- Similar to forestry-sample schema with page templates
- Include template-specific field validation

**3.3 Create Test File**
- Test template assignment in `addPendingDocument`
- Validate template-specific fields are properly initialized
- Test template validation and type resolution

### Step 4: Create Document Creation Mutation Test

**4.1 Create Test Structure**
```
tests/document-creation-mutation/
├── index.test.ts
├── tina/config.ts
└── response.json (will be generated with descriptive names)
```

**4.2 Create Schema Configuration**
- Schema supporting `createDocument` mutation
- Include document creation functionality for MemoryLevel database
- Focus on document creation with in-memory content validation

**4.3 Create Test File**
- Execute `createDocument` mutation
- Validate both GraphQL response and in-memory document creation
- Test immediate document availability after creation via follow-up `get()`

### Step 5: Create Document Update with Variables Test

**5.1 Create Test Structure**
```
tests/document-update-with-variables/
├── index.test.ts
├── tina/config.ts
├── variables.json
├── movies/in.md
├── studios/original-studios.md
├── studios/northwind-studios.md
└── snapshots/ (generated)
```

**5.2 Create Schema Configuration**
- Schema with mutation supporting variables  
- Include comprehensive field types: string, number, boolean, datetime, options, image, list, object list, reference, and rich-text
- Support for `MovieMutation` input type with reference field to studio collection
- Studio collection with reference documents for testing reference field mutations

**5.3 Create Test Files**
- Create `variables.json` with comprehensive mutation parameters including reference field update
- Create `movies/in.md` with initial content including original studio reference  
- Create studio reference documents: `studios/original-studios.md` and `studios/northwind-studios.md`
- Create test that loads variables and executes parameterized mutation updating all field types

**5.4 Test Implementation**
- Use `get()` with custom query and variables
- Read variables from `variables.json`
- Example: `get({ query: mutationQuery, variables: loadedVariables })`
- Validates reference field mutation from `studios/original-studios.md` to `studios/northwind-studios.md`
- Tests comprehensive field type mutations in a single focused test

### Step 6: Create Pending Document Validation Test

**6.1 Create Test Structure**
```
tests/pending-document-validation/
├── index.test.ts
├── tina/config.ts
├── node.json (will be generated)
└── (error handling test)
```

**6.2 Create Schema Configuration**
- Schema with validation rules and required fields
- Include field constraints for testing validation

**6.3 Create Test File**
- Test validation failures and error responses
- Test pending document creation with invalid data
- Validate error messages and response structure

## MemoryCaptureBridge Testing Infrastructure

### Required Changes to util.ts

The existing `setup()` function needs enhancement to support mutation testing:
- **MemoryLevel database** for document storage (already exists)
- **MemoryCaptureBridge** to capture Bridge writes in memory while allowing filesystem reads
- **Bridge write validation** via captured writes inspection

### Required MemoryCaptureBridge Implementation

```typescript
// New Bridge class to capture writes in memory
class MemoryCaptureBridge extends FilesystemBridge {
  private writes: Map<string, string> = new Map();

  // Read operations continue to use filesystem
  async get(filepath: string): Promise<string> {
    return super.get(filepath);
  }

  // Write operations are captured in memory
  async put(filepath: string, data: string): Promise<void> {
    this.writes.set(filepath, data);
  }

  // Test utilities to access captured writes
  getWrites(): Map<string, string> {
    return new Map(this.writes);
  }

  getWrite(filepath: string): string | undefined {
    return this.writes.get(filepath);
  }
}

// Enhanced setup function for mutation testing
export const setupMutation = async (dir: string, config: any) => {
  const bridge = new MemoryCaptureBridge(dir);
  const level = new MemoryLevel<string, Record<string, any>>();
  const database = createDatabaseInternal({
    bridge,
    level,
    tinaDirectory: 'tina',
  });
  await database.indexContent(await buildSchema(config));
  
  const get = async (options?: {
    query: string;
    variables: Record<string, unknown>;
  }) => {
    const result = await resolve({
      database,
      query: options?.query || defaultQuery,
      variables: options?.variables || {},
    });
    return result;
  };
  
  return { get, bridge };
};

// Load variables from JSON file
export const loadVariables = async (dir: string, filename = 'variables.json') => {
  const variablesPath = path.join(dir, filename);
  if (await fs.exists(variablesPath)) {
    return JSON.parse(await fs.readFile(variablesPath, 'utf-8'));
  }
  return {};
};
```

## Test File Patterns

### Pattern 1: Simple Update Mutation (Bridge Write Validation)
```typescript
import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const updateMutation = `
  mutation UpdateDocument($params: DocumentUpdateMutation!) {
    updateDocument(collection: "post", relativePath: "in.md", params: $params) {
      ...on Document { _values, _sys { title } }
    }
  }
`;

it('updates document and validates bridge writes', async () => {
  const { get, bridge } = await setupMutation(__dirname, config);
  
  // Execute mutation
  const result = await get({
    query: updateMutation,
    variables: {
      params: { post: { title: 'Updated Title', rating: 9 } }
    }
  });
  
  // Validate GraphQL response
  expect(format(result)).toMatchFileSnapshot('updateDocument-response.json');
  
  // Validate Bridge write operations
  const writes = bridge.getWrites();
  expect(writes.size).toBeGreaterThan(0);
  expect(bridge.getWrite('posts/in.md')).toMatchFileSnapshot('updated-post-content.md');
});
```

### Pattern 2: Mutation with Variables (Bridge Write Validation)
```typescript
import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format, loadVariables } from '../util';

const mutationQuery = `
  mutation UpdateMovie($params: MovieMutation!) {
    updateMovie(relativePath: "star-wars.md", params: $params) {
      title
      rating
    }
  }
`;

it('executes mutation with variables and validates bridge writes', async () => {
  const { get, bridge } = await setupMutation(__dirname, config);
  const variables = await loadVariables(__dirname);
  
  // Execute mutation with variables
  const result = await get({ query: mutationQuery, variables });
  expect(format(result)).toMatchFileSnapshot('updateMovie-response.json');
  
  // Validate Bridge writes
  const movieWrite = bridge.getWrite('movies/star-wars.md');
  expect(movieWrite).toMatchFileSnapshot('updated-movie-content.md');
  expect(movieWrite).toContain(variables.params.title);
});
```

### Pattern 3: Pending Document Creation (Bridge Write Validation)
```typescript
import { it, expect } from 'vitest';
import config from './tina/config';
import { setupMutation, format } from '../util';

const createMutation = `
  mutation {
    addPendingDocument(
      collection: "post"
      relativePath: "new-post.md"
    ) {
      __typename
    }
  }
`;

it('creates pending document and validates bridge writes', async () => {
  const { get, bridge } = await setupMutation(__dirname, config);
  
  // Execute document creation mutation
  const result = await get({ query: createMutation, variables: {} });
  expect(format(result)).toMatchFileSnapshot('addPendingDocument-response.json');
  
  // Validate Bridge writes for new document
  const newDocWrite = bridge.getWrite('posts/new-post.md');
  expect(newDocWrite).toBeDefined();
  expect(newDocWrite).toMatchFileSnapshot('new-post-content.md');
});
```

## Files Modified

### New Test Directories
```
tests/document-update-mutation/
tests/pending-document-creation/
tests/pending-document-with-template/
tests/document-creation-mutation/
tests/document-update-with-variables/
tests/pending-document-validation/
```

### Enhanced Utilities
```
tests/util.ts - Add setupMutation and loadVariables functions
```

### Schema Configurations
Each test directory will have its own `tina/config.ts` file with mutation-specific schema definitions using `Schema` from `@tinacms/schema-tools` and `export default { schema }` pattern.

## Risk Mitigation

### Risk 1: Mutation Complexity
- **Mitigation**: Start with simplest update mutations
- **Fallback**: Use existing mutation patterns from integration tests

### Risk 2: Variable Handling
- **Mitigation**: Test variable loading separately before integration
- **Fallback**: Use inline variables if file loading fails

### Risk 3: Bridge Write Validation
- **Mitigation**: Use MemoryCaptureBridge to capture writes in memory for validation
- **Fallback**: Validate GraphQL response only if Bridge write validation fails

### Risk 4: Template/Union Type Support
- **Mitigation**: Only use templates when specifically testing template functionality
- **Recommendation**: Use direct `fields` property for simpler tests to avoid unnecessary complexity
- **Fallback**: Simplify to single template if union types fail

## Expected Outcomes

- **6 new mutation unit tests** converted and passing with MemoryCaptureBridge validation
- **0 test failures** in the new mutation test suite
- **No filesystem dependencies** or race conditions
- **Enhanced util.ts** with MemoryCaptureBridge and setupMutation function
- **Established Bridge write validation patterns** for future mutation test conversions

## Implementation Order

1. **document-update-mutation** (simplest, builds on existing patterns) - DONE
2. **pending-document-creation** (simple pending docs without templates) - DONE
3. **document-update-with-variables** (adds variable support) - DONE  
4. **pending-document-with-template** (adds template complexity) - DONE
5. **document-creation-mutation** (createDocument vs addPendingDocument) - DONE
6. **pending-document-validation** (error handling and validation) - DONE

Each test should be implemented and validated individually before proceeding to the next.