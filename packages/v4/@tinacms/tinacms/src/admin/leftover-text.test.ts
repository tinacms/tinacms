import { describe, expect, it } from 'vitest';
import { leftoverText } from './leftover-text';

describe('leftoverText', () => {
  it('uses the singular for one field', () => {
    expect(leftoverText('Title', 1)).toBe(
      'Your earlier edit to Title is still kept.'
    );
  });

  it('uses the plural for several fields', () => {
    expect(leftoverText('Title, a, b, c, d, 4 more', 6)).toBe(
      'Your earlier edits to Title, a, b, c, d, 4 more are still kept.'
    );
  });

  it('names no field when none is left to name', () => {
    expect(leftoverText('', 0)).toBe('Your earlier edits are still kept.');
  });
});
