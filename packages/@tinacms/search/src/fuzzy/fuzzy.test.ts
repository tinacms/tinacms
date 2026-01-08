import {
  levenshteinDistance,
  damerauLevenshteinDistance,
  similarityScore,
  findSimilarTerms,
  getNgrams,
  ngramOverlap,
} from './distance';
import { FuzzyCache } from './cache';
import { DEFAULT_FUZZY_OPTIONS, normalizeFuzzyOptions } from './types';

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
      expect(levenshteinDistance('react', 'raect')).toBe(2);
    });

    it('handles common typos', () => {
      expect(levenshteinDistance('javascript', 'javscript')).toBe(1);
      expect(levenshteinDistance('function', 'funtion')).toBe(1);
      expect(levenshteinDistance('receive', 'recieve')).toBe(2);
    });
  });

  describe('damerauLevenshteinDistance', () => {
    it('returns 0 for identical strings', () => {
      expect(damerauLevenshteinDistance('hello', 'hello')).toBe(0);
      expect(damerauLevenshteinDistance('', '')).toBe(0);
    });

    it('returns 1 for transpositions (unlike Levenshtein)', () => {
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
      expect(damerauLevenshteinDistance('abcd', 'badc')).toBe(2);
    });

    it('handles common typos better than Levenshtein', () => {
      expect(damerauLevenshteinDistance('form', 'from')).toBe(1);
      expect(levenshteinDistance('form', 'from')).toBe(2);

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
      expect(similarityScore('hello', 'hallo')).toBe(0.8);

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

    it('respects maxTermExpansions option', () => {
      const results = findSimilarTerms('r', dictionary, {
        maxTermExpansions: 3,
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

      cache.get('a', {});

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
      expect(DEFAULT_FUZZY_OPTIONS.maxTermExpansions).toBe(10);
      expect(DEFAULT_FUZZY_OPTIONS.useTranspositions).toBe(true);
      expect(DEFAULT_FUZZY_OPTIONS.caseSensitive).toBe(false);
      expect(DEFAULT_FUZZY_OPTIONS.useNgramFilter).toBe(true);
      expect(DEFAULT_FUZZY_OPTIONS.ngramSize).toBe(2);
      expect(DEFAULT_FUZZY_OPTIONS.minNgramOverlap).toBe(0.2);
    });
  });

  describe('normalizeFuzzyOptions', () => {
    it('returns defaults when no options provided', () => {
      const result = normalizeFuzzyOptions();
      expect(result).toEqual(DEFAULT_FUZZY_OPTIONS);
    });

    it('clamps maxDistance to valid range', () => {
      expect(normalizeFuzzyOptions({ maxDistance: -5 }).maxDistance).toBe(0);
      expect(normalizeFuzzyOptions({ maxDistance: 0 }).maxDistance).toBe(0);
      expect(normalizeFuzzyOptions({ maxDistance: 5 }).maxDistance).toBe(5);
      expect(normalizeFuzzyOptions({ maxDistance: 10 }).maxDistance).toBe(10);
      expect(normalizeFuzzyOptions({ maxDistance: 100 }).maxDistance).toBe(10);
    });

    it('clamps minSimilarity to valid range', () => {
      expect(normalizeFuzzyOptions({ minSimilarity: -0.5 }).minSimilarity).toBe(
        0
      );
      expect(normalizeFuzzyOptions({ minSimilarity: 0 }).minSimilarity).toBe(0);
      expect(normalizeFuzzyOptions({ minSimilarity: 0.5 }).minSimilarity).toBe(
        0.5
      );
      expect(normalizeFuzzyOptions({ minSimilarity: 1 }).minSimilarity).toBe(1);
      expect(normalizeFuzzyOptions({ minSimilarity: 2 }).minSimilarity).toBe(1);
    });

    it('clamps maxTermExpansions to valid range', () => {
      expect(
        normalizeFuzzyOptions({ maxTermExpansions: -10 }).maxTermExpansions
      ).toBe(1);
      expect(
        normalizeFuzzyOptions({ maxTermExpansions: 0 }).maxTermExpansions
      ).toBe(1);
      expect(
        normalizeFuzzyOptions({ maxTermExpansions: 1 }).maxTermExpansions
      ).toBe(1);
      expect(
        normalizeFuzzyOptions({ maxTermExpansions: 50 }).maxTermExpansions
      ).toBe(50);
      expect(
        normalizeFuzzyOptions({ maxTermExpansions: 100 }).maxTermExpansions
      ).toBe(100);
      expect(
        normalizeFuzzyOptions({ maxTermExpansions: 500 }).maxTermExpansions
      ).toBe(100);
    });

    it('clamps minNgramOverlap to valid range', () => {
      expect(
        normalizeFuzzyOptions({ minNgramOverlap: -0.5 }).minNgramOverlap
      ).toBe(0);
      expect(
        normalizeFuzzyOptions({ minNgramOverlap: 0 }).minNgramOverlap
      ).toBe(0);
      expect(
        normalizeFuzzyOptions({ minNgramOverlap: 0.5 }).minNgramOverlap
      ).toBe(0.5);
      expect(
        normalizeFuzzyOptions({ minNgramOverlap: 1 }).minNgramOverlap
      ).toBe(1);
      expect(
        normalizeFuzzyOptions({ minNgramOverlap: 2 }).minNgramOverlap
      ).toBe(1);
    });

    it('clamps ngramSize to valid range', () => {
      expect(normalizeFuzzyOptions({ ngramSize: -1 }).ngramSize).toBe(1);
      expect(normalizeFuzzyOptions({ ngramSize: 0 }).ngramSize).toBe(1);
      expect(normalizeFuzzyOptions({ ngramSize: 1 }).ngramSize).toBe(1);
      expect(normalizeFuzzyOptions({ ngramSize: 3 }).ngramSize).toBe(3);
      expect(normalizeFuzzyOptions({ ngramSize: 5 }).ngramSize).toBe(5);
      expect(normalizeFuzzyOptions({ ngramSize: 10 }).ngramSize).toBe(5);
    });

    it('preserves boolean options without clamping', () => {
      expect(
        normalizeFuzzyOptions({ useTranspositions: false }).useTranspositions
      ).toBe(false);
      expect(normalizeFuzzyOptions({ caseSensitive: true }).caseSensitive).toBe(
        true
      );
      expect(
        normalizeFuzzyOptions({ useNgramFilter: false }).useNgramFilter
      ).toBe(false);
    });

    it('clamps multiple options at once', () => {
      const result = normalizeFuzzyOptions({
        maxDistance: 999,
        minSimilarity: -5,
        maxTermExpansions: 0,
      });
      expect(result.maxDistance).toBe(10);
      expect(result.minSimilarity).toBe(0);
      expect(result.maxTermExpansions).toBe(1);
    });
  });

  describe('prefix matching', () => {
    it('matches terms that start with the query', () => {
      const dictionary = ['markdown', 'mario', 'market', 'markup', 'mars'];
      const results = findSimilarTerms('mark', dictionary);

      // All terms starting with "mark" should be found
      expect(results.some((r) => r.term === 'markdown')).toBe(true);
      expect(results.some((r) => r.term === 'market')).toBe(true);
      expect(results.some((r) => r.term === 'markup')).toBe(true);
    });

    it('prioritizes prefix matches over edit distance matches', () => {
      const dictionary = ['markdown', 'mario', 'market'];
      const results = findSimilarTerms('mark', dictionary, {
        maxDistance: 2,
        minSimilarity: 0.5,
      });

      // "markdown" and "market" should rank higher than "mario"
      // because they start with "mark"
      const markdownResult = results.find((r) => r.term === 'markdown');
      const marioResult = results.find((r) => r.term === 'mario');

      expect(markdownResult).toBeDefined();
      if (markdownResult && marioResult) {
        expect(markdownResult.similarity).toBeGreaterThan(
          marioResult.similarity
        );
      }
    });

    it('gives prefix matches a minimum similarity of 0.8', () => {
      const dictionary = ['markdown'];
      const results = findSimilarTerms('mark', dictionary);

      expect(results.length).toBe(1);
      expect(results[0].term).toBe('markdown');
      expect(results[0].similarity).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe('n-gram filtering', () => {
    it('generates correct n-grams', () => {
      const ngrams = getNgrams('react', 2);
      expect(ngrams.has('re')).toBe(true);
      expect(ngrams.has('ea')).toBe(true);
      expect(ngrams.has('ac')).toBe(true);
      expect(ngrams.has('ct')).toBe(true);
      expect(ngrams.size).toBe(4);
    });

    it('handles short strings', () => {
      const ngrams = getNgrams('a', 2);
      expect(ngrams.has('a')).toBe(true);
      expect(ngrams.size).toBe(1);
    });

    it('calculates n-gram overlap correctly', () => {
      const ngrams1 = getNgrams('react', 2);
      const ngrams2 = getNgrams('raect', 2);

      const overlap = ngramOverlap(ngrams1, ngrams2);
      expect(overlap).toBe(0.25);
    });

    it('allows transpositions with n-gram filter', () => {
      const dictionary = ['react', 'redux', 'angular', 'vue'];
      const results = findSimilarTerms('raect', dictionary, {
        useNgramFilter: true,
        minNgramOverlap: 0.2,
      });

      expect(results.some((r) => r.term === 'react')).toBe(true);
    });

    it('filters out completely unrelated terms', () => {
      const dictionary = ['react', 'xyz123'];
      const results = findSimilarTerms('raect', dictionary, {
        useNgramFilter: true,
        minNgramOverlap: 0.2,
        maxDistance: 5,
        minSimilarity: 0,
      });

      expect(results.some((r) => r.term === 'xyz123')).toBe(false);
    });
  });
});
