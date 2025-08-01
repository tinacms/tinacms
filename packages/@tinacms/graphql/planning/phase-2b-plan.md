# Phase 2b: Advanced Query Tests Conversion - Detailed Plan

## Overview

Phase 2b focuses on converting advanced integration test scenarios to unit tests, building on the patterns established in Phase 1 and Phase 2a. This phase targets complex GraphQL query functionality including pagination, sorting, relationships, and union types from the `movies-with-datalayer` test suite. Each test focuses on a single advanced feature to ensure clarity and maintainability.

## Phase 2b Scope

### Target Integration Test Scenarios (5 tests)
1. **`pagination-query`** - Forward/backward pagination with cursor handling
2. **`sorting-query`** - Single-field sorting operations
3. **`multi-field-sorting-query`** - Multi-field sorting with required index configuration
4. **`reference-relationship-query`** - Multi-level reference traversal and filtering
5. **`union-types-polymorphic-query`** - Template-based collections with union type filtering

### Success Criteria
- All 5 converted tests pass
- Each test validates one specific advanced functionality
- Tests run significantly faster than integration tests
- Tests follow established Phase 1 and Phase 2a patterns
- Tests demonstrate complex GraphQL functionality works in unit test environment

## Detailed Step-by-Step Implementation

- Ensure schema configurations use the correct import statement, as per the other tests.
- Do not include unnecessary in tests, such as bodies for articles where no filtering occurs on the body and the body is not included in the output.

### Step 1: Extract and Create Pagination Query Test - DONE
Extract pagination functionality from `movies-with-datalayer/getMovieList` into a focused unit test.

**1.1 Create Test Structure**
```
tests/pagination-query/
├── index.test.ts
├── tina/config.ts
├── movies/
│   ├── movie-alpha.md (releaseDate: 1977)
│   ├── movie-beta.md (releaseDate: 1981)
│   ├── movie-gamma.md (releaseDate: 1984)
│   ├── movie-delta.md (releaseDate: 1989)
│   └── movie-epsilon.md (releaseDate: 1995)
└── node.json (will be generated)
```

**1.2 Extract Schema Configuration**
- Extract movie collection schema from integration test
- Include `releaseDate` field for sorting in pagination
- Configure data layer support for cursor-based pagination

**1.3 Create Test Content**
- Create sufficient content to test pagination (5+ movies)
- Use consistent naming pattern (Movie Alpha, Movie Beta, etc.)
- Include release dates for consistent sorting in pagination

**1.4 Create Test File**
- Test forward pagination: `first`, `after` parameters
- Test backward pagination: `last`, `before` parameters
- Extract specific pagination queries from `getMovieList`
- Test pagination boundaries and cursor handling
- **Focus**: Only pagination operations, no filtering

**1.5 Generate and Validate**
- Verify pagination cursors work correctly
- Validate pagination boundaries and edge cases

### Step 2: Extract and Create Sorting Query Test - DONE
Extract sorting functionality from `movies-with-datalayer/getMovieList` into a focused unit test.

**2.1 Create Test Structure**
```
tests/sorting-query/
├── index.test.ts
├── tina/config.ts
├── movies/
│   ├── movie-alpha.md (title: "Alpha Movie", releaseDate: 2020, rating: 8.5)
│   ├── movie-beta.md (title: "Beta Movie", releaseDate: 2019, rating: 7.2)
│   ├── movie-gamma.md (title: "Gamma Movie", releaseDate: 2021, rating: 9.1)
│   └── movie-delta.md (title: "Delta Movie", releaseDate: 2018, rating: 6.8)
└── node.json (will be generated)
```

**2.2 Extract Schema Configuration**
- Extract movie collection schema from integration test
- Include multiple sortable fields: `title`, `releaseDate`, `rating`

**2.3 Create Test Content**
- Create movies with consistent naming (Movie Alpha, Movie Beta, etc.)
- Include varied values for sorting fields:
  - Different release dates (2018-2021)
  - Different ratings (6.8-9.1)
  - Alphabetically varied titles

**2.4 Create Test File**
- Test single field sorting: `sort: "title"`, `sort: "releaseDate" }`
- Extract specific single-field sorting queries from `getMovieList`
- **Focus**: Only single-field sorting operations, no filtering or pagination

**2.5 Generate and Validate**
- Verify single-field sorting works correctly
- Ensure sorting handles edge cases (null values, same values)

### Step 3: Extract and Create Multi-Field Sorting Query Test - DONE
Extract multi-field sorting functionality that requires index configuration into a focused unit test.

**3.1 Create Test Structure**
```
tests/multi-field-sorting-query/
├── index.test.ts
├── tina/config.ts
├── movies/
│   ├── movie-alpha.md (title: "Alpha Movie", releaseDate: 2020, rating: 8.5)
│   ├── movie-beta.md (title: "Beta Movie", releaseDate: 2020, rating: 7.2)
│   ├── movie-gamma.md (title: "Gamma Movie", releaseDate: 2019, rating: 9.1)
│   └── movie-delta.md (title: "Delta Movie", releaseDate: 2019, rating: 6.8)
└── node.json (will be generated)
```

**3.2 Extract Schema Configuration**
- Extract movie collection schema from integration test
- Configure required index for multi-field sorting:
  ```ts
  indexes: [{
    name: "release-rating",
    fields: [
      { name: "releaseDate" },
      { name: "rating" }
    ]
  }]
  ```
- Include sortable fields: `title`, `releaseDate`, `rating`

**3.3 Create Test Content**
- Create movies with consistent naming (Movie Alpha, Movie Beta, etc.)
- Include varied values designed to test multi-field sort priority:
  - Same release dates with different ratings (2020: 8.5, 7.2)
  - Same release dates with different ratings (2019: 9.1, 6.8)
  - Alphabetically varied titles

**3.4 Create Test File**
- Test multi-field sorting using index: `sort: "release-rating"`
- Verify sort order respects field priority (releaseDate first, then rating)
- Test that multi-field sorting requires the index to be defined
- Extract specific multi-field sorting queries from integration tests
- **Focus**: Only multi-field sorting with index requirements

**3.5 Generate and Validate**
- Verify multi-field sorting works correctly with index
- Validate sort order follows index field priority
- Ensure test fails without proper index configuration

### Step 4: Extract and Create Reference Relationship Query Test - DONE
Extract reference relationship functionality from `movies-with-datalayer/getMovieList` into a focused unit test.

**4.1 Create Test Structure**
```
tests/reference-relationship-query/
├── index.test.ts
├── tina/config.ts
├── movies/
│   ├── movie-alpha.md (director: directors/bob-northwind.md)
│   └── movie-beta.md (director: directors/charlie-southwind.md)
├── directors/
│   ├── bob-northwind.md (name: "Bob Northwind", relatives: [relatives/alice-eastwind.md])
│   └── charlie-southwind.md (name: "Charlie Southwind", relatives: [relatives/alice-eastwind.md])
├── relatives/
│   ├── alice-eastwind.md (name: "Alice Eastwind", child: relatives/dave-westwind.md)
│   └── dave-westwind.md (name: "Dave Westwind")
└── node.json (will be generated)
```

**4.2 Extract Schema Configuration**
- Extract schema configurations from integration test for movie, director, and relative collections
- Configure proper reference validation and indexing
- Set up multi-level reference support

**4.3 Create Test Content**
- Create interconnected content matching integration test patterns
- Use consistent naming (Bob Northwind, Charlie Southwind, Alice Eastwind)
- Test both single and array reference types

**4.4 Create Test File**
- Test direct reference filtering: `director.director.name.eq`
- Test nested reference traversal: multi-level reference queries
- Extract specific reference queries from `getMovieList`
- **Focus**: Only reference relationship queries, no other operations

**4.5 Generate and Validate**
- Verify reference resolution works across multiple levels
- Validate reference filtering produces correct results

### Step 5: Extract and Create Union Types Polymorphic Query Test - DONE
Extract union type functionality from `movies-with-datalayer/getCrewList` into a focused unit test.

**5.1 Create Test Structure**
```
tests/union-types-polymorphic-query/
├── index.test.ts
├── tina/config.ts
├── crew/
│   ├── bob-northwind.md (template: costumeDesigner, favoriteColor: "blue")
│   ├── charlie-southwind.md (template: costumeDesigner, favoriteColor: "red")
│   ├── alice-eastwind.md (template: stuntPerson, speciality: "car chases")
│   └── dave-westwind.md (template: stuntPerson, speciality: "wire work")
└── node.json (will be generated)
```

**5.2 Extract Schema Configuration**
- Extract crew collection schema from integration test
- Extract template configurations for costumeDesigner and stuntPerson
- Configure union type handling and template-specific filtering

**5.3 Create Test Content**
- Create content for each template type matching integration test
- Use consistent naming (Bob Northwind, Charlie Southwind, Alice Eastwind, Dave Westwind)
- Include template-specific fields for filtering

**5.4 Create Test File**
- Test union type queries with `...on Document` fragments
- Test template-specific filtering: `costumeDesigner.favoriteColor`
- Extract specific union type queries from `getCrewList`
- **Focus**: Only union type and polymorphic operations

**5.5 Generate and Validate**
- Verify union type resolution works correctly
- Validate template-specific filtering and field access

## Risk Mitigation

### Risk 1: Reference Resolution Complexity
- **Mitigation**: Test reference scenarios incrementally
- **Fallback**: Simplify reference chains if resolution fails

### Risk 2: Union Type Handling
- **Mitigation**: Start with simple template scenarios first
- **Fallback**: Use existing reference patterns for template handling

### Risk 3: Pagination Cursor Management
- **Mitigation**: Use established cursor patterns from integration tests
- **Fallback**: Implement simplified cursor logic if needed

### Risk 4: Performance Regression
- **Mitigation**: Monitor test execution times throughout development
- **Fallback**: Optimize memory usage and query patterns

## Expected Outcomes

- **5 new focused unit tests** extracted and passing
- **Single advanced feature focus** for each test ensuring clarity
- **Comprehensive coverage** of complex GraphQL functionality including multi-field sorting with indexes
- **Significant performance improvement** over integration tests
- **Pattern establishment** for subsequent phases

## Success Metrics

### Functional Success
- All 5 extracted tests pass consistently
- Each test validates exactly one advanced feature
- Complex GraphQL operations work correctly
- Reference resolution functions properly
- Union types and polymorphic queries work

### Maintainability Success
- Tests follow established Phase 1 and Phase 2a patterns
- Each test has clear, single-purpose focus
- Test structure is clear and understandable
- Schema configurations are focused and minimal
- Consistent naming conventions used throughout
