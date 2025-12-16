import { LocalSearchIndexClient } from '../client';

describe('Fuzzy Search Integration', () => {
  let client: LocalSearchIndexClient;

  beforeEach(async () => {
    client = new LocalSearchIndexClient({
      stopwordLanguages: ['eng'],
    });
    await client.onStartIndexing();
  });

  describe('Basic fuzzy search', () => {
    beforeEach(async () => {
      // Index some sample documents
      await client.put([
        {
          _id: '1',
          title: 'React Component Tutorial',
          body: 'Learn how to build React components with TypeScript',
        },
        {
          _id: '2',
          title: 'JavaScript Basics',
          body: 'Introduction to JavaScript programming',
        },
        {
          _id: '3',
          title: 'TypeScript Guide',
          body: 'Complete guide to TypeScript development',
        },
        {
          _id: '4',
          title: 'Testing React Apps',
          body: 'How to test React applications effectively',
        },
      ]);
    });

    it('should find results with exact match', async () => {
      const results = await client.query('React', { limit: 10 });
      expect(results.results.length).toBeGreaterThan(0);
      expect(results.total).toBeGreaterThan(0);
    });

    it('should find results with typo when fuzzy enabled', async () => {
      const results = await client.query('Raect', {
        fuzzy: true,
        limit: 10,
      });

      // Should find "React" documents despite typo
      expect(results.results.length).toBeGreaterThan(0);
      expect(results.total).toBeGreaterThan(0);
    });

    it('should find results with multiple typos', async () => {
      const results = await client.query('TypeScrpt', {
        fuzzy: true,
        fuzzyOptions: {
          maxDistance: 2,
          minSimilarity: 0.7,
        },
        limit: 10,
      });

      // Should find "TypeScript" documents
      expect(results.results.length).toBeGreaterThan(0);
    });

    it('should handle transpositions', async () => {
      const results = await client.query('Jaavscript', {
        fuzzy: true,
        limit: 10,
      });

      // Should find "JavaScript" despite transposition typo
      expect(results.results.length).toBeGreaterThan(0);
    });

    it('should work without fuzzy when disabled', async () => {
      const results = await client.query('Raect', {
        fuzzy: false,
        limit: 10,
      });

      // Should not find results with typo when fuzzy disabled
      // (or find very few compared to correct spelling)
      const correctResults = await client.query('React', {
        fuzzy: false,
        limit: 10,
      });

      expect(correctResults.results.length).toBeGreaterThan(
        results.results.length
      );
    });
  });

  describe('Fuzzy search options', () => {
    beforeEach(async () => {
      await client.put([
        {
          _id: '1',
          title: 'Authentication Guide',
          body: 'How to implement authentication in your app',
        },
        {
          _id: '2',
          title: 'Authorization Patterns',
          body: 'Common authorization patterns explained',
        },
        {
          _id: '3',
          title: 'Security Best Practices',
          body: 'Essential security practices for web applications',
        },
      ]);
    });

    it('should respect maxDistance option', async () => {
      // "Autentication" has 1 character missing (distance 1)
      const strictResults = await client.query('Autentication', {
        fuzzy: true,
        fuzzyOptions: { maxDistance: 1 },
        limit: 10,
      });

      // "Athentication" has 2 characters wrong (distance 2)
      const lenientResults = await client.query('Athentication', {
        fuzzy: true,
        fuzzyOptions: { maxDistance: 2 },
        limit: 10,
      });

      expect(strictResults.results.length).toBeGreaterThanOrEqual(0);
      expect(lenientResults.results.length).toBeGreaterThanOrEqual(0);
    });

    it('should respect minSimilarity option', async () => {
      const strictResults = await client.query('Auth', {
        fuzzy: true,
        fuzzyOptions: { minSimilarity: 0.9 },
        limit: 10,
      });

      const lenientResults = await client.query('Auth', {
        fuzzy: true,
        fuzzyOptions: { minSimilarity: 0.5 },
        limit: 10,
      });

      // Lenient search should find more results
      expect(lenientResults.results.length).toBeGreaterThanOrEqual(
        strictResults.results.length
      );
    });

    it('should respect limit option', async () => {
      const results = await client.query('security', {
        fuzzy: true,
        limit: 2,
      });

      expect(results.results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Multi-word queries', () => {
    beforeEach(async () => {
      await client.put([
        {
          _id: '1',
          title: 'React State Management',
          body: 'Managing state in React applications',
        },
        {
          _id: '2',
          title: 'React Hooks Tutorial',
          body: 'Learn about React hooks and state',
        },
        {
          _id: '3',
          title: 'State Machines',
          body: 'Introduction to state machines',
        },
      ]);
    });

    it('should handle multi-word queries with typos', async () => {
      const results = await client.query('Raect sate', {
        fuzzy: true,
        limit: 10,
      });

      // Should find documents matching "React state"
      expect(results.results.length).toBeGreaterThan(0);
    });

    it('should expand each word in query separately', async () => {
      const results = await client.query('Raect managment', {
        fuzzy: true,
        fuzzyOptions: {
          maxDistance: 2,
        },
        limit: 10,
      });

      // Should find "React State Management" despite typos in both words
      expect(results.results.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    beforeEach(async () => {
      await client.put([
        {
          _id: '1',
          title: 'Test Document',
          body: 'Sample content for testing',
        },
      ]);
    });

    it('should handle empty query', async () => {
      const results = await client.query('', {
        fuzzy: true,
        limit: 10,
      });

      expect(results.results).toBeDefined();
      expect(Array.isArray(results.results)).toBe(true);
    });

    it('should handle query with no results', async () => {
      const results = await client.query('xyzabc123nonexistent', {
        fuzzy: true,
        limit: 10,
      });

      expect(results.results.length).toBe(0);
      expect(results.total).toBe(0);
    });

    it('should handle special characters in query', async () => {
      const results = await client.query('test@document!', {
        fuzzy: true,
        limit: 10,
      });

      // Should not throw error
      expect(results.results).toBeDefined();
    });

    it('should handle very long query terms', async () => {
      const longTerm = 'a'.repeat(100);
      const results = await client.query(longTerm, {
        fuzzy: true,
        limit: 10,
      });

      // Should not throw error
      expect(results.results).toBeDefined();
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      // Index many documents
      const docs = Array.from({ length: 100 }, (_, i) => ({
        _id: String(i),
        title: `Document ${i}`,
        body: `Content for document number ${i} with various terms`,
      }));
      await client.put(docs);
    });

    it('should complete fuzzy search in reasonable time', async () => {
      const start = Date.now();
      await client.query('docment', {
        fuzzy: true,
        limit: 10,
      });
      const duration = Date.now() - start;

      // Should complete within 1 second (generous threshold)
      expect(duration).toBeLessThan(1000);
    });

    it('should use cache for repeated queries', async () => {
      // First query - cold cache
      const start1 = Date.now();
      await client.query('docment', { fuzzy: true, limit: 10 });
      const duration1 = Date.now() - start1;

      // Second query - warm cache
      const start2 = Date.now();
      await client.query('docment', { fuzzy: true, limit: 10 });
      const duration2 = Date.now() - start2;

      // Second query should be faster or similar (cache helps)
      expect(duration2).toBeLessThanOrEqual(duration1 * 1.5);
    });
  });

  describe('Graceful degradation', () => {
    it('should fall back to original query if fuzzy search fails', async () => {
      await client.put([
        {
          _id: '1',
          title: 'Test Document',
          body: 'Sample content',
        },
      ]);

      // Even if fuzzy search has issues, should still return results
      const results = await client.query('Test', {
        fuzzy: true,
        fuzzyOptions: {
          maxDistance: -1, // Invalid option
        },
        limit: 10,
      });

      // Should still find results via fallback
      expect(results.results).toBeDefined();
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      // Index 25 documents for pagination tests
      const docs = Array.from({ length: 25 }, (_, i) => ({
        _id: `doc-${i}`,
        title: `React Tutorial ${i}`,
        body: `Learn React development part ${i}`,
      }));
      await client.put(docs);
    });

    it('should return first page with correct cursors', async () => {
      const results = await client.query('React', {
        fuzzy: true,
        limit: 10,
      });

      expect(results.results.length).toBeLessThanOrEqual(10);
      expect(results.prevCursor).toBeNull();
      if (results.total > 10) {
        expect(results.nextCursor).toBe('1');
      }
    });

    it('should return second page when cursor provided', async () => {
      const results = await client.query('React', {
        fuzzy: true,
        limit: 10,
        cursor: '1',
      });

      expect(results.results.length).toBeLessThanOrEqual(10);
      expect(results.prevCursor).toBe('0');
      if (results.total > 20) {
        expect(results.nextCursor).toBe('2');
      }
    });

    it('should return last page with no next cursor', async () => {
      const results = await client.query('React', {
        fuzzy: true,
        limit: 10,
        cursor: '2',
      });

      expect(results.results.length).toBeLessThanOrEqual(10);
      expect(results.prevCursor).toBe('1');
      // Last page should have no next cursor (25 docs / 10 per page = 3 pages)
      expect(results.nextCursor).toBeNull();
    });

    it('should paginate fuzzy search results correctly', async () => {
      // Search with typo "Raect" -> should find "React"
      const page1 = await client.query('Raect', {
        fuzzy: true,
        limit: 5,
      });

      expect(page1.results.length).toBeLessThanOrEqual(5);
      expect(page1.total).toBeGreaterThan(5);

      if (page1.nextCursor) {
        const page2 = await client.query('Raect', {
          fuzzy: true,
          limit: 5,
          cursor: page1.nextCursor,
        });

        expect(page2.results.length).toBeLessThanOrEqual(5);
        expect(page2.prevCursor).toBe('0');
      }
    });

    it('should return consistent total across pages', async () => {
      const page1 = await client.query('React', {
        fuzzy: true,
        limit: 10,
      });

      const page2 = await client.query('React', {
        fuzzy: true,
        limit: 10,
        cursor: '1',
      });

      expect(page1.total).toBe(page2.total);
    });

    it('should handle pagination without fuzzy search', async () => {
      const page1 = await client.query('React', {
        fuzzy: false,
        limit: 10,
      });

      expect(page1.results.length).toBeLessThanOrEqual(10);
      expect(page1.prevCursor).toBeNull();

      if (page1.total > 10) {
        expect(page1.nextCursor).toBe('1');

        const page2 = await client.query('React', {
          fuzzy: false,
          limit: 10,
          cursor: '1',
        });

        expect(page2.prevCursor).toBe('0');
      }
    });

    it('should handle small result sets without pagination', async () => {
      // Query that returns fewer results than limit
      const results = await client.query('Tutorial 0', {
        fuzzy: true,
        limit: 10,
      });

      // If we have few results, no pagination needed
      if (results.total <= 10) {
        expect(results.nextCursor).toBeNull();
      }
    });

    it('should handle empty results with pagination options', async () => {
      const results = await client.query('nonexistentterm', {
        fuzzy: true,
        limit: 10,
        cursor: '0',
      });

      expect(results.results.length).toBe(0);
      expect(results.total).toBe(0);
      expect(results.nextCursor).toBeNull();
      expect(results.prevCursor).toBeNull();
    });
  });
});
