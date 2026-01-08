import type { FuzzySearchOptions, FuzzyMatch } from './types';
import { normalizeFuzzyOptions } from './types';

export const PREFIX_MATCH_MIN_SIMILARITY = 0.8;

export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  const dp: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) dp[i][0] = i;
  for (let j = 0; j <= len2; j++) dp[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }

  return dp[len1][len2];
}

export function similarityScore(
  str1: string,
  str2: string,
  useTranspositions: boolean = false
): number {
  const distance = useTranspositions
    ? damerauLevenshteinDistance(str1, str2)
    : levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  return 1 - distance / maxLength;
}

export function damerauLevenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const maxDist = len1 + len2;

  const charLastPosition: Record<string, number> = {};
  const dp: number[][] = Array(len1 + 2)
    .fill(null)
    .map(() => Array(len2 + 2).fill(0));

  dp[0][0] = maxDist;

  for (let i = 0; i <= len1; i++) {
    dp[i + 1][0] = maxDist;
    dp[i + 1][1] = i;
  }

  for (let j = 0; j <= len2; j++) {
    dp[0][j + 1] = maxDist;
    dp[1][j + 1] = j;
  }

  for (let i = 1; i <= len1; i++) {
    let lastMatchingCol = 0;

    for (let j = 1; j <= len2; j++) {
      const lastRowWithMatch = charLastPosition[str2[j - 1]] || 0;
      const lastColWithMatch = lastMatchingCol;

      let cost = 1;
      if (str1[i - 1] === str2[j - 1]) {
        cost = 0;
        lastMatchingCol = j;
      }

      dp[i + 1][j + 1] = Math.min(
        dp[i][j] + cost,
        dp[i + 1][j] + 1,
        dp[i][j + 1] + 1,
        dp[lastRowWithMatch][lastColWithMatch] +
          (i - lastRowWithMatch - 1) +
          1 +
          (j - lastColWithMatch - 1)
      );
    }

    charLastPosition[str1[i - 1]] = i;
  }

  return dp[len1 + 1][len2 + 1];
}

export function getNgrams(str: string, n: number = 2): Set<string> {
  const ngrams = new Set<string>();
  if (str.length < n) {
    ngrams.add(str);
    return ngrams;
  }
  for (let i = 0; i <= str.length - n; i++) {
    ngrams.add(str.substring(i, i + n));
  }
  return ngrams;
}

export function ngramOverlap(
  ngrams1: Set<string>,
  ngrams2: Set<string>
): number {
  if (ngrams1.size === 0 || ngrams2.size === 0) return 0;

  let overlap = 0;
  for (const ngram of ngrams1) {
    if (ngrams2.has(ngram)) overlap++;
  }

  const minSize = Math.min(ngrams1.size, ngrams2.size);
  return overlap / minSize;
}

export function findSimilarTerms(
  query: string,
  dictionary: string[],
  options: FuzzySearchOptions = {}
): FuzzyMatch[] {
  const opts = normalizeFuzzyOptions(options);
  const normalizedQuery = opts.caseSensitive ? query : query.toLowerCase();

  if (normalizedQuery.length === 0) return [];

  const matches: FuzzyMatch[] = [];
  const distanceFunc = opts.useTranspositions
    ? damerauLevenshteinDistance
    : levenshteinDistance;

  const queryNgrams = opts.useNgramFilter
    ? getNgrams(normalizedQuery, opts.ngramSize)
    : null;

  for (const term of dictionary) {
    if (typeof term !== 'string' || term.length === 0) continue;

    const normalizedTerm = opts.caseSensitive ? term : term.toLowerCase();

    if (queryNgrams) {
      const termNgrams = getNgrams(normalizedTerm, opts.ngramSize);
      const overlap = ngramOverlap(queryNgrams, termNgrams);
      if (overlap < opts.minNgramOverlap) continue;
    }

    if (normalizedTerm.startsWith(normalizedQuery)) {
      const prefixSimilarity = normalizedQuery.length / normalizedTerm.length;
      matches.push({
        term,
        distance: normalizedTerm.length - normalizedQuery.length,
        similarity: Math.max(prefixSimilarity, PREFIX_MATCH_MIN_SIMILARITY),
      });
      continue;
    }

    const distance = distanceFunc(normalizedQuery, normalizedTerm);
    if (distance > opts.maxDistance) continue;

    const similarity = similarityScore(
      normalizedQuery,
      normalizedTerm,
      opts.useTranspositions
    );
    if (similarity >= opts.minSimilarity) {
      matches.push({ term, distance, similarity });
    }
  }

  matches.sort((a, b) => {
    if (Math.abs(a.similarity - b.similarity) < 0.001) {
      return a.distance - b.distance;
    }
    return b.similarity - a.similarity;
  });

  return matches.slice(0, opts.maxTermExpansions);
}
