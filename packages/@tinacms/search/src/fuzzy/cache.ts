import type { FuzzyMatch, FuzzySearchOptions } from './types';

export class FuzzyCache {
  private cache: Map<string, FuzzyMatch[]>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  private getCacheKey(
    query: string,
    options: Partial<FuzzySearchOptions>
  ): string {
    return JSON.stringify({ query, options });
  }

  get(
    query: string,
    options: Partial<FuzzySearchOptions>
  ): FuzzyMatch[] | undefined {
    const key = this.getCacheKey(query, options);
    const value = this.cache.get(key);

    if (value) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }

    return value;
  }

  set(
    query: string,
    options: Partial<FuzzySearchOptions>,
    results: FuzzyMatch[]
  ): void {
    const key = this.getCacheKey(query, options);

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, results);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
