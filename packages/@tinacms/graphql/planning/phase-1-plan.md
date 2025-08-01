# Phase 1: Simple Query Tests Conversion - Detailed Plan

## Overview

Phase 1 focuses on converting the simplest integration test scenarios to unit tests, establishing patterns and templates that will be used in subsequent phases. We'll start with basic document queries that have minimal complexity and clear expected outputs.

## Phase 1 Scope

### Target Integration Test Scenarios (4 tests)
1. **`template-based-document-query`** - Document queries with template support
2. **`collection-metadata-query`** - Collection metadata and schema queries
3. **`collections-list-query`** - List all collections metadata
4. **`collection-list-query`** - Collection document list queries

### Success Criteria
- All 4 converted tests pass
- Tests follow existing unit test patterns
- Tests run significantly faster than integration tests
- Each test is self-contained and isolated

## Detailed Step-by-Step Implementation

Each test will be created individually to allow for validation and assessment at each step.

### Step 1: Create Template-Based Document Query Test - DONE
Create and validate the template-based document query test first.

**1.1 Create Test Structure**
```
tests/template-based-document-query/
├── index.test.ts
├── tina/config.ts
├── pages/
│   └── home.md
└── node.json (will be generated)
```

**1.2 Extract Schema Configuration**
- Extract page collection schema from forestry-sample integration test
- Include template configuration and union types
- Focus on template-specific field resolution

**1.3 Create Test Content**
- Copy `pages/home.md` from forestry-sample page fixture
- Include template fields to test union type resolution

**1.4 Create Test File**
- Create `index.test.ts` for template-based queries
- Test union type and template field resolution

**1.5 Generate and Validate**
- Run test and review snapshot
- Validate template functionality works correctly

### Step 2: Create Collection Metadata Query Test - DONE
After Step 1 is validated, create collection metadata query test.

**2.1 Create Test Structure**
```
tests/collection-metadata-query/
├── index.test.ts
├── tina/config.ts
├── content/
│   └── sample.md
└── node.json (will be generated)
```

**2.2 Create Schema Configuration**
- Create minimal schema with one collection
- Focus on collection-level metadata and schema introspection

**2.3 Create Test Content**
- Create content files optimized for metadata queries
- Focus on collection schema testing

**2.4 Create Test File**
- Create `index.test.ts` for metadata queries
- Test schema introspection and collection metadata

**2.5 Generate and Validate**
- Run test and review snapshot
- Validate metadata query functionality

### Step 3: Create Collections List Query Test - DONE
After Step 2 is validated, create collections list query test.

**3.1 Create Test Structure**
```
tests/collections-list-query/
├── index.test.ts
├── tina/config.ts
├── content/
│   └── sample.md
└── node.json (will be generated)
```

**3.2 Create Schema Configuration**
- Create schema with multiple collections
- Ensure collections enumeration works

**3.3 Create Test Content**
- Create content for multiple collections
- Focus on collections enumeration testing

**3.4 Create Test File**
- Create `index.test.ts` for collections list queries
- Test collections enumeration

**3.5 Generate and Validate**
- Run test and review snapshot
- Validate collections listing functionality

### Step 4: Create Collection List Query Test - DONE
After Step 3 is validated, create collection list query test.

**4.1 Create Test Structure**
```
tests/collection-list-query/
├── index.test.ts
├── tina/config.ts
├── directors/
│   ├── sam-raimi.md
│   └── peter-jackson.md
└── node.json (will be generated)
```

**4.2 Create Schema Configuration**
- Same as single document but with multiple items
- Include list filtering and pagination support

**4.3 Create Test Content**
- Create multiple content files for listing
- Focus on collection listing and filtering

**4.4 Create Test File**
- Create `index.test.ts` for collection list queries
- Test collection document listing and filtering

**4.5 Generate and Validate**
- Run test and review snapshot
- Validate collection listing functionality

### Step 5: Final Validation - DONE
After all 4 tests are created individually, run final validation.

**5.1 Test Suite Validation**
- Run full test suite: `pnpm test`
- Verify all 4 new tests pass
- Check for any console errors or warnings

**5.2 Integration Comparison**
- Compare unit test outputs with integration test outputs
- Ensure key data is preserved
- Verify no critical functionality is lost

## Risk Mitigation

### Risk 1: Schema Complexity
- **Mitigation**: Start with simplest schemas first
- **Fallback**: Use existing unit test schemas as reference

### Risk 2: Content File Dependencies
- **Mitigation**: Create minimal content files
- **Fallback**: Use existing unit test content as template

### Risk 3: Query Compatibility
- **Mitigation**: Test queries against simplified schemas early
- **Fallback**: Adjust schemas to match required query patterns

### Risk 4: Snapshot Accuracy
- **Mitigation**: Compare snapshots with integration test outputs
- **Fallback**: Manually verify critical data fields

## Expected Outcomes

- **4 new unit tests** converted and passing
- **0 test failures** in the new unit test suite
