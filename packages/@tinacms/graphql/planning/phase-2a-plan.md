# Phase 2a: Basic Filtering Tests Conversion - Detailed Plan

## Overview

Phase 2a focuses on converting basic filtering integration test scenarios to unit tests, building on the patterns established in Phase 1. This phase targets fundamental GraphQL filtering functionality including date, numeric, string, and boolean filtering from the `movies-with-datalayer` test suite. Each test focuses on a single filtering type to ensure clarity and maintainability.

## Phase 2a Scope

### Target Integration Test Scenarios (4 tests)
1. **`date-filtering-query`** - Date-based filtering operations (after, before, between)
2. **`numeric-filtering-query`** - Numeric filtering operations (gt, gte, lt, lte, in)
3. **`string-filtering-query`** - String filtering operations (eq, startsWith, contains)
4. **`boolean-filtering-query`** - Boolean filtering operations (eq)

### Success Criteria
- All 4 converted tests pass
- Each test validates one specific filtering functionality
- Tests run significantly faster than integration tests
- Tests follow established Phase 1 patterns
- Tests demonstrate basic GraphQL filtering works in unit test environment

## Detailed Step-by-Step Implementation

- Ensure schema configurations use the correct import statement, as per the other tests.
- Do not include unnecessary in tests, such as bodies for articles where no filtering occurs on the body and the body is not included in the output.

### Step 1: Extract and Create Date Filtering Query Test - DONE
Extract date filtering functionality from `movies-with-datalayer/getMovieList` into a focused unit test.

**1.1 Create Test Structure**
```
tests/date-filtering-query/
├── index.test.ts
├── tina/config.ts
├── movies/
│   ├── movie-alpha.md (2019 release)
│   ├── movie-beta.md (2021 release)
│   ├── movie-gamma.md (2020 release)
│   └── movie-delta.md (1985 release)
└── node.json (will be generated)
```

**1.2 Extract Schema Configuration**
- Extract movie collection schema from integration test
- Include `releaseDate` field with appropriate indexing
- Configure data layer support for date filtering operations

**1.3 Create Test Content**
- Create movies with consistent naming (Movie Alpha, Movie Beta, etc.)
- Include varied release dates to test date operations:
  - Date ranges spanning 1980s-2020s
  - Dates that test `after`, `before`, `between` operations

**1.4 Create Test File**
- Test date filtering: `after`, `before`, `between` operations on `releaseDate`
- Extract specific date filter queries from `getMovieList`
- **Focus**: Only date filtering operations, no other functionality

**1.5 Generate and Validate**
- Run test and verify date filter logic works correctly
- Validate that only date filtering functionality is tested

### Step 2: Extract and Create Numeric Filtering Query Test - DONE
Extract numeric filtering functionality from `movies-with-datalayer/getMovieList` into a focused unit test.

**2.1 Create Test Structure**
```
tests/numeric-filtering-query/
├── index.test.ts
├── tina/config.ts
├── movies/
│   ├── movie-alpha.md (rating: 8.5)
│   ├── movie-beta.md (rating: 7.2)
│   ├── movie-gamma.md (rating: 9.1)
│   └── movie-delta.md (rating: 6.8)
└── node.json (will be generated)
```

**2.2 Extract Schema Configuration**
- Extract movie collection schema from integration test
- Include `rating` field with appropriate indexing
- Configure data layer support for numeric filtering operations

**2.3 Create Test Content**
- Create movies with consistent naming (Movie Alpha, Movie Beta, etc.)
- Include varied rating values to test numeric operations:
  - Rating ranges (6.8-9.1 scores)
  - Values that test `gt`, `gte`, `lt`, `lte`, `in` operations

**2.4 Create Test File**
- Test numeric filtering: `gt`, `gte`, `lt`, `lte`, `in` operations on `rating`
- Extract specific numeric filter queries from `getMovieList`
- **Focus**: Only numeric filtering operations, no other functionality

**2.5 Generate and Validate**
- Verify numeric filter logic works correctly
- Validate that only numeric filtering functionality is tested

### Step 3: Extract and Create String Filtering Query Test - DONE
Extract string filtering functionality from `movies-with-datalayer/getMovieList` into a focused unit test.

**3.1 Create Test Structure**
```
tests/string-filtering-query/
├── index.test.ts
├── tina/config.ts
├── movies/
│   ├── movie-alpha.md (title: "Movie Alpha")
│   ├── movie-beta.md (title: "Movie Beta")
│   ├── movie-gamma.md (title: "Movie Gamma")
│   └── a-movie-delta.md (title: "A Movie Delta")
└── node.json (will be generated)
```

**3.2 Extract Schema Configuration**
- Extract movie collection schema from integration test
- Include `title` field with appropriate indexing
- Configure data layer support for string filtering operations

**3.3 Create Test Content**
- Create movies with consistent naming (Movie Alpha, Movie Beta, etc.)
- Include varied string values:
  - Titles that test `eq`, `startsWith`, `contains` operations

**3.4 Create Test File**
- Test string filtering: `eq`, `in`, `startsWith` operations on `title`
- Extract specific string filter queries from `getMovieList`
- **Focus**: Only string filtering operations, no other functionality

**3.5 Generate and Validate**
- Verify string filter logic works correctly
- Validate that only string filtering functionality is tested

### Step 4: Extract and Create Boolean Filtering Query Test - DONE
Extract boolean filtering functionality from `movies-with-datalayer/getMovieList` into a focused unit test.

**4.1 Create Test Structure**
```
tests/boolean-filtering-query/
├── index.test.ts
├── tina/config.ts
├── movies/
│   ├── movie-alpha.md (archived: false)
│   ├── movie-beta.md (archived: true)
│   ├── movie-gamma.md (archived: false)
│   └── movie-delta.md (archived: true)
└── node.json (will be generated)
```

**4.2 Extract Schema Configuration**
- Extract movie collection schema from integration test
- Include `archived` field with appropriate indexing
- Configure data layer support for boolean filtering operations

**4.3 Create Test Content**
- Create movies with consistent naming (Movie Alpha, Movie Beta, etc.)
- Include varied boolean values:
  - Boolean states (archived/not archived)

**4.4 Create Test File**
- Test boolean filtering: `eq` operations on `archived`
- Extract specific boolean filter queries from `getMovieList`
- **Focus**: Only boolean filtering operations, no other functionality

**4.5 Generate and Validate**
- Verify boolean filter logic works correctly
- Validate that only boolean filtering functionality is tested

### Step 5: Final Phase 2a Validation
Comprehensive validation of all Phase 2a extracted tests.

**5.1 Full Test Suite Run**
- Run complete test suite: `pnpm test`
- Verify all 4 new Phase 2a tests pass
- Verify Phase 1 tests still pass
- Check for performance improvements

**5.2 Integration Comparison**
- Compare unit test outputs with integration test outputs
- Verify extracted functionality is preserved
- Validate no critical features are lost

**5.3 Performance Validation**
- Measure test execution time vs integration tests
- Verify significant performance improvement
- Document performance gains achieved

## Risk Mitigation

### Risk 1: Data Layer Complexity
- **Mitigation**: Use simplified in-memory indexing approach
- **Fallback**: Mock complex indexing operations if needed

### Risk 2: Feature Isolation
- **Mitigation**: Focus each test on exactly one filtering type
- **Fallback**: Split tests further if multiple features emerge

### Risk 3: Performance Regression
- **Mitigation**: Monitor test execution times throughout development
- **Fallback**: Optimize memory usage and query patterns

## Expected Outcomes

- **4 new focused unit tests** extracted and passing
- **Single filtering focus** for each test ensuring clarity
- **Basic filtering coverage** of fundamental GraphQL functionality
- **Significant performance improvement** over integration tests
- **Foundation establishment** for Phase 2b advanced scenarios

## Success Metrics

### Functional Success
- All 4 extracted tests pass consistently
- Each test validates exactly one filtering type
- Basic GraphQL filtering operations work correctly

### Performance Success
- Phase 2a tests run in <50% time of equivalent integration tests
- Memory usage remains reasonable for filtering scenarios
- Test isolation prevents interference between scenarios

### Maintainability Success
- Tests follow established Phase 1 patterns
- Each test has clear, single-purpose focus
- Test structure is clear and understandable
- Schema configurations are focused and minimal
- Consistent naming conventions used throughout

## Next Steps After Phase 2a

Phase 2a completion will establish basic filtering patterns for Phase 2b, which will tackle:
- Pagination operations
- Sorting functionality
- Reference relationships
- Union types and polymorphic queries