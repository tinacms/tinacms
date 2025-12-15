import {
  levenshteinDistance,
  damerauLevenshteinDistance,
  similarityScore,
  findSimilarTerms,
} from './distance';
import { FuzzyCache } from './cache';
import { DEFAULT_FUZZY_OPTIONS } from './types';

describe('Fuzzy Search', () => {
  describe('levenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
      expect(levenshteinDistance('', '')).toBe(0);
      expect(levenshteinDistance('a', 'a')).toBe(0);
    });

    it('returns correct distance for insertions', () => {
      expect(levenshteinDistance('cat', 'cats')).toBe(1);
      expect(levenshteinDistance('hello', 'hellos')).toBe(1);
      expect(levenshteinDistance('', 'abc')).toBe(3);
    });

    it('returns correct distance for deletions', () => {
      expect(levenshteinDistance('cats', 'cat')).toBe(1);
      expect(levenshteinDistance('hello', 'helo')).toBe(1);
      expect(levenshteinDistance('abc', '')).toBe(3);
    });

    it('returns correct distance for substitutions', () => {
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
      expect(levenshteinDistance('abc', 'xyz')).toBe(3);
    });

    it('returns correct distance for mixed operations', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
      expect(levenshteinDistance('react', 'raect')).toBe(2); // transposition = 2 ops in Levenshtein
    });

    it('handles common typos', () => {
      expect(levenshteinDistance('javascript', 'javscript')).toBe(1); // missing 'a'
      expect(levenshteinDistance('function', 'funtion')).toBe(1); // missing 'c'
      expect(levenshteinDistance('receive', 'recieve')).toBe(2); // ie vs ei
    });
  });

  describe('damerauLevenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
      expect(damerauLevenshteinDistance('hello', 'hello')).toBe(0);
      expect(damerauLevenshteinDistance('', '')).toBe(0);
    });

    it('returns 1 for transpositions (unlike Levenshtein)', () => {
      // Transposition: swapping two adjacent characters
      expect(damerauLevenshteinDistance('ab', 'ba')).toBe(1);
      expect(damerauLevenshteinDistance('react', 'raect')).toBe(1);
      expect(damerauLevenshteinDistance('teh', 'the')).toBe(1);
    });

    it('matches Levenshtein for non-transposition edits', () => {
      expect(damerauLevenshteinDistance('cat', 'cats')).toBe(1);
      expect(damerauLevenshteinDistance('cat', 'bat')).toBe(1);
      expect(damerauLevenshteinDistance('hello', 'helo')).toBe(1);
    });

    it('handles multiple transpositions', () => {
      expect(damerauLevenshteinDistance('abcd', 'badc')).toBe(2); // two transpositions
    });

    it('handles common typos better than Levenshtein', () => {
      // "form" vs "from" - transposition
      expect(damerauLevenshteinDistance('form', 'from')).toBe(1);
      expect(levenshteinDistance('form', 'from')).toBe(2);

      // "tina" vs "tian" - transposition
      expect(damerauLevenshteinDistance('tina', 'tian')).toBe(1);
      expect(levenshteinDistance('tina', 'tian')).toBe(2);
    });
  });

  describe('similarityScore', () => {
    it('returns 1.0 for identical strings', () => {
      expect(similarityScore('hello', 'hello')).toBe(1);
      expect(similarityScore('test', 'test')).toBe(1);
    });

    it('returns 1.0 for empty strings', () => {
      expect(similarityScore('', '')).toBe(1);
    });

    it('returns 0 for completely different strings of same length', () => {
      expect(similarityScore('abc', 'xyz')).toBe(0);
    });

    it('calculates correct similarity', () => {
      // "hello" vs "hallo" = distance 1, max length 5
      // similarity = 1 - (1/5) = 0.8
      expect(similarityScore('hello', 'hallo')).toBe(0.8);

      // "cat" vs "cats" = distance 1, max length 4
      // similarity = 1 - (1/4) = 0.75
      expect(similarityScore('cat', 'cats')).toBe(0.75);
    });

    it('returns lower scores for more different strings', () => {
      const exactMatch = similarityScore('react', 'react');
      const oneOff = similarityScore('react', 'reac');
      const twoOff = similarityScore('react', 'rea');

      expect(exactMatch).toBeGreaterThan(oneOff);
      expect(oneOff).toBeGreaterThan(twoOff);
    });
  });

  describe('findSimilarTerms', () => {
    const dictionary = [
      'react',
      'redux',
      'router',
      'render',
      'reduce',
      'angular',
      'vue',
      'svelte',
      'component',
      'javascript',
    ];

    it('finds exact matches', () => {
      const results = findSimilarTerms('react', dictionary);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].term).toBe('react');
      expect(results[0].distance).toBe(0);
      expect(results[0].similarity).toBe(1);
    });

    it('finds terms with typos', () => {
      // "raect" is a transposition of "react"
      const results = findSimilarTerms('raect', dictionary);
      expect(results.some((r) => r.term === 'react')).toBe(true);
    });

    it('finds terms with missing characters', () => {
      const results = findSimilarTerms('rect', dictionary);
      expect(results.some((r) => r.term === 'react')).toBe(true);
    });

    it('finds terms with extra characters', () => {
      const results = findSimilarTerms('reactt', dictionary);
      expect(results.some((r) => r.term === 'react')).toBe(true);
    });

    it('respects maxDistance option', () => {
      const strictResults = findSimilarTerms('raect', dictionary, {
        maxDistance: 1,
      });
      const looseResults = findSimilarTerms('raect', dictionary, {
        maxDistance: 3,
      });

      expect(looseResults.length).toBeGreaterThanOrEqual(strictResults.length);
    });

    it('respects minSimilarity option', () => {
      const strictResults = findSimilarTerms('reac', dictionary, {
        minSimilarity: 0.9,
      });
      const looseResults = findSimilarTerms('reac', dictionary, {
        minSimilarity: 0.5,
      });

      expect(looseResults.length).toBeGreaterThanOrEqual(strictResults.length);
    });

    it('respects maxResults option', () => {
      const results = findSimilarTerms('r', dictionary, {
        maxResults: 3,
        maxDistance: 10,
        minSimilarity: 0,
      });
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('respects caseSensitive option', () => {
      const caseInsensitive = findSimilarTerms('REACT', dictionary, {
        caseSensitive: false,
      });
      const caseSensitive = findSimilarTerms('REACT', dictionary, {
        caseSensitive: true,
      });

      expect(caseInsensitive.some((r) => r.term === 'react')).toBe(true);
      expect(caseSensitive.some((r) => r.term === 'react')).toBe(false);
    });

    it('respects useTranspositions option', () => {
      // "raect" has distance 1 with Damerau-Levenshtein (transposition)
      // but distance 2 with standard Levenshtein
      const withTranspositions = findSimilarTerms('raect', dictionary, {
        useTranspositions: true,
        maxDistance: 1,
      });
      const withoutTranspositions = findSimilarTerms('raect', dictionary, {
        useTranspositions: false,
        maxDistance: 1,
      });

      expect(withTranspositions.some((r) => r.term === 'react')).toBe(true);
      expect(withoutTranspositions.some((r) => r.term === 'react')).toBe(false);
    });

    it('uses prefix filter when enabled', () => {
      // With prefix filter, "raect" won't match "react" because "ra" != "re"
      const withPrefixFilter = findSimilarTerms('raect', dictionary, {
        usePrefixFilter: true,
        prefixLength: 2,
        maxDistance: 2,
      });
      const withoutPrefixFilter = findSimilarTerms('raect', dictionary, {
        usePrefixFilter: false,
        maxDistance: 2,
      });

      expect(withPrefixFilter.some((r) => r.term === 'react')).toBe(false);
      expect(withoutPrefixFilter.some((r) => r.term === 'react')).toBe(true);
    });

    it('returns results sorted by similarity (descending)', () => {
      const results = findSimilarTerms('react', dictionary, {
        maxDistance: 5,
        minSimilarity: 0,
      });

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].similarity).toBeGreaterThanOrEqual(
          results[i].similarity
        );
      }
    });

    it('returns empty array for empty query', () => {
      const results = findSimilarTerms('', dictionary);
      expect(results).toEqual([]);
    });

    it('skips empty or invalid dictionary terms', () => {
      const dictWithEmpty = ['react', '', null as any, undefined as any, 'vue'];
      const results = findSimilarTerms('react', dictWithEmpty);
      expect(results.length).toBe(1);
      expect(results[0].term).toBe('react');
    });

    it('handles real-world typo scenarios', () => {
      const cmsTerms = [
        'tinacms',
        'content',
        'collection',
        'document',
        'schema',
        'template',
        'field',
        'markdown',
        'frontmatter',
      ];

      // Common typos
      expect(
        findSimilarTerms('tincams', cmsTerms).some((r) => r.term === 'tinacms')
      ).toBe(true);
      expect(
        findSimilarTerms('contnet', cmsTerms).some((r) => r.term === 'content')
      ).toBe(true);
      expect(
        findSimilarTerms('colection', cmsTerms).some(
          (r) => r.term === 'collection'
        )
      ).toBe(true);
      expect(
        findSimilarTerms('documnet', cmsTerms).some(
          (r) => r.term === 'document'
        )
      ).toBe(true);
    });
  });

  describe('FuzzyCache', () => {
    it('stores and retrieves results', () => {
      const cache = new FuzzyCache();
      const results = [{ term: 'react', distance: 0, similarity: 1 }];

      cache.set('react', {}, results);
      expect(cache.get('react', {})).toEqual(results);
    });

    it('returns undefined for cache misses', () => {
      const cache = new FuzzyCache();
      expect(cache.get('nonexistent', {})).toBeUndefined();
    });

    it('uses options in cache key', () => {
      const cache = new FuzzyCache();
      const results1 = [{ term: 'react', distance: 0, similarity: 1 }];
      const results2 = [{ term: 'redux', distance: 1, similarity: 0.8 }];

      cache.set('re', { maxDistance: 1 }, results1);
      cache.set('re', { maxDistance: 2 }, results2);

      expect(cache.get('re', { maxDistance: 1 })).toEqual(results1);
      expect(cache.get('re', { maxDistance: 2 })).toEqual(results2);
    });

    it('respects maxSize limit (LRU eviction)', () => {
      const cache = new FuzzyCache(3);

      cache.set('a', {}, []);
      cache.set('b', {}, []);
      cache.set('c', {}, []);

      expect(cache.size).toBe(3);

      // Adding a 4th item should evict the oldest (a)
      cache.set('d', {}, []);

      expect(cache.size).toBe(3);
      expect(cache.get('a', {})).toBeUndefined();
      expect(cache.get('b', {})).toBeDefined();
      expect(cache.get('c', {})).toBeDefined();
      expect(cache.get('d', {})).toBeDefined();
    });

    it('updates LRU order on get', () => {
      const cache = new FuzzyCache(3);

      cache.set('a', {}, []);
      cache.set('b', {}, []);
      cache.set('c', {}, []);

      // Access 'a' to make it most recently used
      cache.get('a', {});

      // Add new item - should evict 'b' (now oldest) instead of 'a'
      cache.set('d', {}, []);

      expect(cache.get('a', {})).toBeDefined();
      expect(cache.get('b', {})).toBeUndefined();
      expect(cache.get('c', {})).toBeDefined();
      expect(cache.get('d', {})).toBeDefined();
    });

    it('clears all entries', () => {
      const cache = new FuzzyCache();

      cache.set('a', {}, []);
      cache.set('b', {}, []);

      expect(cache.size).toBe(2);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('a', {})).toBeUndefined();
    });

    it('reports correct size', () => {
      const cache = new FuzzyCache();

      expect(cache.size).toBe(0);

      cache.set('a', {}, []);
      expect(cache.size).toBe(1);

      cache.set('b', {}, []);
      expect(cache.size).toBe(2);

      cache.clear();
      expect(cache.size).toBe(0);
    });
  });

  describe('DEFAULT_FUZZY_OPTIONS', () => {
    it('has expected default values', () => {
      expect(DEFAULT_FUZZY_OPTIONS.maxDistance).toBe(2);
      expect(DEFAULT_FUZZY_OPTIONS.minSimilarity).toBe(0.6);
      expect(DEFAULT_FUZZY_OPTIONS.maxResults).toBe(10);
      expect(DEFAULT_FUZZY_OPTIONS.useTranspositions).toBe(true);
      expect(DEFAULT_FUZZY_OPTIONS.caseSensitive).toBe(false);
      expect(DEFAULT_FUZZY_OPTIONS.usePrefixFilter).toBe(false);
      expect(DEFAULT_FUZZY_OPTIONS.prefixLength).toBe(2);
    });
  });
});
