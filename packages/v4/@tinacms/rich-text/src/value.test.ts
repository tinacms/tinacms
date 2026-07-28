import { describe, expect, it } from 'vitest';
import { EMPTY_RICH_TEXT } from './value';

describe('EMPTY_RICH_TEXT', () => {
  // It is shared, not copied: a field descriptor's defaultValue reaches form
  // values by reference, so every empty rich-text field in every open document
  // points at this one object. A mutation would surface as one document's edits
  // appearing in another — and a form store comparing structurally would not
  // notice. Frozen, so it throws instead.
  it('cannot be mutated', () => {
    expect(Object.isFrozen(EMPTY_RICH_TEXT)).toBe(true);
    expect(Object.isFrozen(EMPTY_RICH_TEXT.children)).toBe(true);
  });

  it('throws rather than silently accepting a write in strict mode', () => {
    expect(() => {
      (EMPTY_RICH_TEXT.children as RichTextNodeArray).push({ type: 'p' });
    }).toThrow();
  });

  it('is an empty document, not a document with an empty paragraph', () => {
    // `required` counts children, so a stray placeholder node would make every
    // untouched field read as filled in.
    expect(EMPTY_RICH_TEXT).toEqual({ type: 'root', children: [] });
  });
});

type RichTextNodeArray = { type: string }[];
