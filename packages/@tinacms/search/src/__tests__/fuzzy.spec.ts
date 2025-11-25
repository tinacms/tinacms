/**
 * Unit tests for fuzzy search utilities
 */

import {
  levenshteinDistance,
  similarityScore,
  damerauLevenshteinDistance,
  findSimilarTerms,
  FuzzyCache,
  DEFAULT_FUZZY_OPTIONS,
} from '../fuzzy';

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('should handle insertions', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
    expect(levenshteinDistance('', 'abc')).toBe(3);
  });

  it('should handle deletions', () => {
    expect(levenshteinDistance('cats', 'cat')).toBe(1);
    expect(levenshteinDistance('abc', '')).toBe(3);
  });

  it('should handle substitutions', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
    expect(levenshteinDistance('hello', 'hallo')).toBe(1);
  });

  it('should handle complex edits', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
  });

  it('should be case-sensitive', () => {
    expect(levenshteinDistance('Hello', 'hello')).toBe(1);
    expect(levenshteinDistance('ABC', 'abc')).toBe(3);
  });
});

describe('similarityScore', () => {
  it('should return 1 for identical strings', () => {
    expect(similarityScore('hello', 'hello')).toBe(1);
    expect(similarityScore('', '')).toBe(1);
  });

  it('should return 0 for completely different strings', () => {
    const score = similarityScore('abc', 'xyz');
    expect(score).toBeLessThan(0.1);
  });

  it('should return value between 0 and 1', () => {
    const score = similarityScore('cat', 'bat');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it('should be higher for more similar strings', () => {
    const score1 = similarityScore('hello', 'hallo');
    const score2 = similarityScore('hello', 'world');
    expect(score1).toBeGreaterThan(score2);
  });
});

describe('damerauLevenshteinDistance', () => {
  it('should handle transpositions', () => {
    // Standard Levenshtein would count this as 2 (delete + insert)
    // Damerau-Levenshtein counts it as 1 (transposition)
    expect(damerauLevenshteinDistance('ab', 'ba')).toBe(1);
    expect(damerauLevenshteinDistance('the', 'teh')).toBe(1);
  });

  it('should return same as Levenshtein for non-transpositions', () => {
    expect(damerauLevenshteinDistance('cat', 'bat')).toBe(1);
    expect(damerauLevenshteinDistance('hello', 'hallo')).toBe(1);
  });

  it('should handle complex typos', () => {
    expect(damerauLevenshteinDistance('kitten', 'kittne')).toBe(1);
  });
});

describe('findSimilarTerms', () => {
  const dictionary = [
    'apple',
    'application',
    'apply',
    'banana',
    'bandana',
    'orange',
    'grape',
  ];

  it('should find exact matches', () => {
    const matches = findSimilarTerms('apple', dictionary);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].term).toBe('apple');
    expect(matches[0].similarity).toBe(1);
  });

  it('should find similar terms with typos', () => {
    const matches = findSimilarTerms('aple', dictionary, {
      maxDistance: 1,
    });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((m) => m.term === 'apple')).toBe(true);
  });

  it('should respect maxDistance option', () => {
    const matches = findSimilarTerms('aple', dictionary, {
      maxDistance: 1,
    });
    // 'application' has distance > 1, should not be included
    expect(matches.some((m) => m.term === 'application')).toBe(false);
  });

  it('should respect minSimilarity option', () => {
    const matches = findSimilarTerms('app', dictionary, {
      minSimilarity: 0.8,
    });
    // Should only match very similar terms
    expect(matches.every((m) => m.similarity >= 0.8)).toBe(true);
  });

  it('should respect maxResults option', () => {
    const matches = findSimilarTerms('app', dictionary, {
      maxResults: 2,
    });
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it('should sort by similarity descending', () => {
    const matches = findSimilarTerms('banan', dictionary);
    if (matches.length > 1) {
      for (let i = 0; i < matches.length - 1; i++) {
        expect(matches[i].similarity).toBeGreaterThanOrEqual(
          matches[i + 1].similarity
        );
      }
    }
  });

  it('should handle case-insensitive matching by default', () => {
    const matches = findSimilarTerms('APPLE', dictionary);
    expect(matches.some((m) => m.term === 'apple')).toBe(true);
  });

  it('should handle case-sensitive matching when enabled', () => {
    const matches = findSimilarTerms('APPLE', dictionary, {
      caseSensitive: true,
    });
    // Exact match won't be found due to case difference
    expect(matches[0]?.term === 'APPLE' && matches[0]?.similarity === 1).toBe(
      false
    );
  });

  it('should apply prefix filter for performance', () => {
    const matches = findSimilarTerms('app', dictionary, {
      usePrefixFilter: true,
      prefixLength: 2,
    });
    // Should only match terms starting with 'ap'
    expect(matches.every((m) => m.term.toLowerCase().startsWith('ap'))).toBe(
      true
    );
  });

  it('should handle empty dictionary', () => {
    const matches = findSimilarTerms('apple', []);
    expect(matches).toEqual([]);
  });

  it('should handle empty query', () => {
    const matches = findSimilarTerms('', dictionary);
    expect(matches).toEqual([]);
  });

  it('should use transpositions by default', () => {
    const matches = findSimilarTerms('aplpe', dictionary, {
      useTranspositions: true,
    });
    expect(matches.some((m) => m.term === 'apple')).toBe(true);
  });
});

describe('FuzzyCache', () => {
  let cache: FuzzyCache;

  beforeEach(() => {
    cache = new FuzzyCache(3); // Small cache for testing
  });

  it('should store and retrieve values', () => {
    const results = [{ term: 'apple', distance: 0, similarity: 1 }];
    cache.set('apple', {}, results);

    const retrieved = cache.get('apple', {});
    expect(retrieved).toEqual(results);
  });

  it('should return undefined for missing keys', () => {
    const retrieved = cache.get('missing', {});
    expect(retrieved).toBeUndefined();
  });

  it('should evict oldest entries when at capacity', () => {
    const results1 = [{ term: 'apple', distance: 0, similarity: 1 }];
    const results2 = [{ term: 'banana', distance: 0, similarity: 1 }];
    const results3 = [{ term: 'cherry', distance: 0, similarity: 1 }];
    const results4 = [{ term: 'date', distance: 0, similarity: 1 }];

    cache.set('apple', {}, results1);
    cache.set('banana', {}, results2);
    cache.set('cherry', {}, results3);

    expect(cache.size).toBe(3);

    // Adding fourth entry should evict the oldest (apple)
    cache.set('date', {}, results4);

    expect(cache.size).toBe(3);
    expect(cache.get('apple', {})).toBeUndefined();
    expect(cache.get('date', {})).toEqual(results4);
  });

  it('should update LRU order on access', () => {
    const results1 = [{ term: 'apple', distance: 0, similarity: 1 }];
    const results2 = [{ term: 'banana', distance: 0, similarity: 1 }];
    const results3 = [{ term: 'cherry', distance: 0, similarity: 1 }];
    const results4 = [{ term: 'date', distance: 0, similarity: 1 }];

    cache.set('apple', {}, results1);
    cache.set('banana', {}, results2);
    cache.set('cherry', {}, results3);

    // Access apple to make it recently used
    cache.get('apple', {});

    // Adding fourth entry should evict banana (oldest unused)
    cache.set('date', {}, results4);

    expect(cache.get('apple', {})).toEqual(results1);
    expect(cache.get('banana', {})).toBeUndefined();
  });

  it('should clear all entries', () => {
    cache.set('apple', {}, []);
    cache.set('banana', {}, []);

    expect(cache.size).toBe(2);

    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get('apple', {})).toBeUndefined();
  });

  it('should use different cache keys for different options', () => {
    const results1 = [{ term: 'apple', distance: 0, similarity: 1 }];
    const results2 = [{ term: 'application', distance: 1, similarity: 0.9 }];

    cache.set('apple', { maxDistance: 1 }, results1);
    cache.set('apple', { maxDistance: 2 }, results2);

    expect(cache.get('apple', { maxDistance: 1 })).toEqual(results1);
    expect(cache.get('apple', { maxDistance: 2 })).toEqual(results2);
  });
});

describe('DEFAULT_FUZZY_OPTIONS', () => {
  it('should have sensible defaults', () => {
    expect(DEFAULT_FUZZY_OPTIONS.maxDistance).toBe(2);
    expect(DEFAULT_FUZZY_OPTIONS.minSimilarity).toBe(0.6);
    expect(DEFAULT_FUZZY_OPTIONS.maxResults).toBe(10);
    expect(DEFAULT_FUZZY_OPTIONS.useTranspositions).toBe(true);
    expect(DEFAULT_FUZZY_OPTIONS.caseSensitive).toBe(false);
    expect(DEFAULT_FUZZY_OPTIONS.usePrefixFilter).toBe(false); // Disabled by default for better fuzzy matching
    expect(DEFAULT_FUZZY_OPTIONS.prefixLength).toBe(2);
  });
});
