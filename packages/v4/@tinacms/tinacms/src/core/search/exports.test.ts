import { describe, expect, it } from 'vitest';
import * as client from '../../client';
import * as root from '../../index';
import type * as rootTypes from '../../index';
import type * as clientTypes from '../../client';
import type * as serverTypes from '../../server';
import type { SearchHit } from './contract';

describe('search entries', () => {
  it('puts each name on the entries the contract lists', () => {
    expect(typeof root.defineSearchPlugin).toBe('function');
    expect(typeof root.searchIndex).toBe('function');
    expect(typeof root.SearchError).toBe('function');
    expect(typeof client.createSearchClient).toBe('function');
    expect(typeof client.SearchError).toBe('function');
    expect(root).not.toHaveProperty('createSearchClient');
    for (const entry of [root, client]) {
      expect(entry).not.toHaveProperty('isSearchProvider');
      expect(entry).not.toHaveProperty('isSearchErrorCode');
    }
  });

  it('keeps the provider side types on the server entry only', () => {
    type OnServer = [serverTypes.SearchIndexProvider, serverTypes.SearchRecord];
    // @ts-expect-error SearchIndexProvider is a server entry type.
    type OnRoot = rootTypes.SearchIndexProvider;
    // @ts-expect-error SearchRecord is a server entry type.
    type OnClient = clientTypes.SearchRecord;
    const names: [OnServer?, OnRoot?, OnClient?] = [];
    expect(names).toEqual([]);
  });

  it('types a hit ref as a document pointer', () => {
    // @ts-expect-error A ref is { collection, path }, not a string.
    const hit: SearchHit = { ref: 'x', score: 1, snippet: '' };
    expect(hit.score).toBe(1);
  });
});
