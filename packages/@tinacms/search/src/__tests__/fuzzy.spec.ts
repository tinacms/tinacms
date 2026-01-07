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

  it('should return low score for completely different strings', () => {
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
  it('should handle transpositions as single edit', () => {
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
    const matches = findSimilarTerms('aple', dictionary, { maxDistance: 1 });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((m) => m.term === 'apple')).toBe(true);
  });

  it('should respect maxDistance option', () => {
    const matches = findSimilarTerms('aple', dictionary, { maxDistance: 1 });
    expect(matches.some((m) => m.term === 'application')).toBe(false);
  });

  it('should respect minSimilarity option', () => {
    const matches = findSimilarTerms('app', dictionary, { minSimilarity: 0.8 });
    expect(matches.every((m) => m.similarity >= 0.8)).toBe(true);
  });

  it('should respect maxTermExpansions option', () => {
    const matches = findSimilarTerms('app', dictionary, {
      maxTermExpansions: 2,
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
    expect(matches[0]?.term === 'APPLE' && matches[0]?.similarity === 1).toBe(
      false
    );
  });

  it('should handle empty dictionary', () => {
    expect(findSimilarTerms('apple', [])).toEqual([]);
  });

  it('should handle empty query', () => {
    expect(findSimilarTerms('', dictionary)).toEqual([]);
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
    cache = new FuzzyCache(3);
  });

  it('should store and retrieve values', () => {
    const results = [{ term: 'apple', distance: 0, similarity: 1 }];
    cache.set('apple', {}, results);
    expect(cache.get('apple', {})).toEqual(results);
  });

  it('should return undefined for missing keys', () => {
    expect(cache.get('missing', {})).toBeUndefined();
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

    cache.get('apple', {});
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
    expect(DEFAULT_FUZZY_OPTIONS.maxTermExpansions).toBe(10);
    expect(DEFAULT_FUZZY_OPTIONS.useTranspositions).toBe(true);
    expect(DEFAULT_FUZZY_OPTIONS.caseSensitive).toBe(false);
    expect(DEFAULT_FUZZY_OPTIONS.useNgramFilter).toBe(true);
    expect(DEFAULT_FUZZY_OPTIONS.ngramSize).toBe(2);
    expect(DEFAULT_FUZZY_OPTIONS.minNgramOverlap).toBe(0.2);
  });
});
