import { describe, expect, it } from 'vitest';
import { countFailingFields } from './field-errors';

describe('countFailingFields', () => {
  it('counts one missing title in a list item once, not once per parent address', () => {
    expect(countFailingFields(['blocks', 'blocks.0', 'blocks.0.title'])).toBe(
      1
    );
  });

  it('counts sibling failures separately', () => {
    expect(
      countFailingFields(['title', 'blocks', 'blocks.0.title', 'blocks.1.body'])
    ).toBe(3);
  });

  it('does not treat a longer name as a child', () => {
    expect(countFailingFields(['title', 'titleAlt'])).toBe(2);
  });
});
