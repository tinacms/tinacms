import { describe, expect, it } from 'vitest';
import {
  type CollectedForm,
  formsStore,
  recordForm,
  sortByPriority,
} from '../internal/forms-store';

function makeForm(overrides: Partial<CollectedForm> = {}): CollectedForm {
  return {
    id: 'id',
    query: 'query Q',
    variables: {},
    data: {},
    ...overrides,
  };
}

describe('recordForm', () => {
  it('dedupes by id within a single request scope', () => {
    const list: CollectedForm[] = [];
    formsStore.run(list, () => {
      recordForm(makeForm({ id: 'a' }));
      recordForm(makeForm({ id: 'a' }));
      recordForm(makeForm({ id: 'b' }));
    });
    expect(list.map((f) => f.id)).toEqual(['a', 'b']);
  });

  it('upgrades an existing entry to primary when a later call asserts it', () => {
    const list: CollectedForm[] = [];
    formsStore.run(list, () => {
      // Layout calls global with no priority first.
      recordForm(makeForm({ id: 'global' }));
      // Page-level loader for the same id later flags it primary.
      recordForm(makeForm({ id: 'global', priority: 'primary' }));
    });
    expect(list).toHaveLength(1);
    expect(list[0]!.priority).toBe('primary');
  });

  it('is a no-op outside a request scope', () => {
    // Just don't throw — there's no store to read.
    expect(() => recordForm(makeForm())).not.toThrow();
  });
});

describe('sortByPriority', () => {
  it('moves primaries to the front while preserving relative order', () => {
    const forms = [
      makeForm({ id: 'a' }),
      makeForm({ id: 'b', priority: 'primary' }),
      makeForm({ id: 'c' }),
      makeForm({ id: 'd', priority: 'primary' }),
    ];
    expect(sortByPriority(forms).map((f) => f.id)).toEqual([
      'b',
      'd',
      'a',
      'c',
    ]);
  });

  it('returns a new array without mutating the input', () => {
    const forms = [makeForm({ id: 'a' }), makeForm({ id: 'b' })];
    const sorted = sortByPriority(forms);
    expect(sorted).not.toBe(forms);
    expect(forms.map((f) => f.id)).toEqual(['a', 'b']);
  });
});
