import { describe, expect, it } from 'vitest';
import { EMPTY_RICH_TEXT } from './value';

describe('EMPTY_RICH_TEXT', () => {
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
    expect(EMPTY_RICH_TEXT).toEqual({ type: 'root', children: [] });
  });
});

type RichTextNodeArray = { type: string }[];
