import {
  queryToSearchIndexQuery,
  optionsToSearchIndexOptions,
  parseSearchIndexResponse,
} from './index-client';

describe('queryToSearchIndexQuery', () => {
  it('should return a query object for simple query', () => {
    expect(queryToSearchIndexQuery('foo')).toEqual({ AND: ['foo'] });
  });

  it('should return a query object for a complex query', () => {
    expect(queryToSearchIndexQuery('foo bar')).toEqual({ AND: ['foo', 'bar'] });
  });

  it('should request a query object for a boolean expression with AND', () => {
    expect(queryToSearchIndexQuery('foo AND bar')).toEqual({
      AND: ['foo', 'bar'],
    });
  });
});

describe('optionsToSearchIndexOptions', () => {
  it('should return empty object when no options provided', () => {
    expect(optionsToSearchIndexOptions()).toEqual({});
    expect(optionsToSearchIndexOptions({})).toEqual({});
  });

  it('should return PAGE options when limit provided', () => {
    expect(optionsToSearchIndexOptions({ limit: 10 })).toEqual({
      PAGE: { NUMBER: 0, SIZE: 10 },
    });
  });

  it('should use cursor as page number', () => {
    expect(optionsToSearchIndexOptions({ limit: 10, cursor: '2' })).toEqual({
      PAGE: { NUMBER: 2, SIZE: 10 },
    });
  });

  it('should handle cursor of 0', () => {
    expect(optionsToSearchIndexOptions({ limit: 5, cursor: '0' })).toEqual({
      PAGE: { NUMBER: 0, SIZE: 5 },
    });
  });
});

describe('parseSearchIndexResponse', () => {
  it('should parse basic response', () => {
    const response = {
      RESULT: [{ _id: '1' }, { _id: '2' }],
      RESULT_LENGTH: 2,
    };

    const parsed = parseSearchIndexResponse(response);

    expect(parsed.results).toEqual([{ _id: '1' }, { _id: '2' }]);
    expect(parsed.total).toBe(2);
    expect(parsed.prevCursor).toBeNull();
    expect(parsed.nextCursor).toBeNull();
  });

  it('should include fuzzy matches when present', () => {
    const response = {
      RESULT: [{ _id: '1' }],
      RESULT_LENGTH: 1,
      FUZZY_MATCHES: {
        raect: [{ term: 'react', distance: 1, similarity: 0.8 }],
      },
    };

    const parsed = parseSearchIndexResponse(response);

    expect(parsed.fuzzyMatches).toEqual({
      raect: [{ term: 'react', distance: 1, similarity: 0.8 }],
    });
  });

  it('should use server-provided cursors when available', () => {
    const response = {
      RESULT: [{ _id: '1' }],
      RESULT_LENGTH: 100,
      NEXT_CURSOR: '5',
      PREV_CURSOR: '3',
    };

    const parsed = parseSearchIndexResponse(response, {
      limit: 10,
      cursor: '4',
    });

    expect(parsed.nextCursor).toBe('5');
    expect(parsed.prevCursor).toBe('3');
  });

  it('should handle null server cursors', () => {
    const response = {
      RESULT: [{ _id: '1' }],
      RESULT_LENGTH: 5,
      NEXT_CURSOR: null,
      PREV_CURSOR: null,
    };

    const parsed = parseSearchIndexResponse(response, { limit: 10 });

    expect(parsed.nextCursor).toBeNull();
    expect(parsed.prevCursor).toBeNull();
  });

  it('should calculate pagination when server cursors not provided', () => {
    const response = {
      RESULT: Array(10).fill({ _id: '1' }),
      RESULT_LENGTH: 25,
    };

    // First page
    const page1 = parseSearchIndexResponse(response, { limit: 10 });
    expect(page1.prevCursor).toBeNull();
    expect(page1.nextCursor).toBe('1');

    // Second page
    const page2 = parseSearchIndexResponse(response, {
      limit: 10,
      cursor: '1',
    });
    expect(page2.prevCursor).toBe('0');
    expect(page2.nextCursor).toBe('2');

    // Last page
    const page3 = parseSearchIndexResponse(response, {
      limit: 10,
      cursor: '2',
    });
    expect(page3.prevCursor).toBe('1');
    expect(page3.nextCursor).toBeNull();
  });

  it('should handle first page correctly', () => {
    const response = {
      RESULT: Array(10).fill({ _id: '1' }),
      RESULT_LENGTH: 50,
    };

    const parsed = parseSearchIndexResponse(response, {
      limit: 10,
      cursor: '0',
    });

    expect(parsed.prevCursor).toBeNull();
    expect(parsed.nextCursor).toBe('1');
  });

  it('should handle no pagination needed', () => {
    const response = {
      RESULT: [{ _id: '1' }, { _id: '2' }],
      RESULT_LENGTH: 2,
    };

    const parsed = parseSearchIndexResponse(response, { limit: 10 });

    expect(parsed.prevCursor).toBeNull();
    expect(parsed.nextCursor).toBeNull();
  });

  it('should handle empty results', () => {
    const response = {
      RESULT: [],
      RESULT_LENGTH: 0,
    };

    const parsed = parseSearchIndexResponse(response, { limit: 10 });

    expect(parsed.results).toEqual([]);
    expect(parsed.total).toBe(0);
    expect(parsed.prevCursor).toBeNull();
    expect(parsed.nextCursor).toBeNull();
  });
});
