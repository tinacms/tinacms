import { describe, expect, it } from 'vitest';
import {
  INVALID_MARKDOWN_TYPE,
  type InvalidMarkdownElement,
  buildErrorMessage,
} from './error-message';

const element = (
  overrides: Partial<InvalidMarkdownElement>
): InvalidMarkdownElement => ({
  type: INVALID_MARKDOWN_TYPE,
  value: '<<<',
  message: 'Could not parse the block',
  children: [{ type: 'text', text: '' }],
  ...overrides,
});

describe('buildErrorMessage', () => {
  /**
   * The author fixes the file by hand. The line and column are the only part
   * of this message that tell them where to look.
   */
  it('points at the line and column when the parser reports a position', () => {
    const message = buildErrorMessage(
      element({
        position: {
          start: { line: 4, column: 7 },
          end: { line: 4, column: 12 },
        },
      })
    );

    expect(message).toBe('Could not parse the block at line: 4, column: 7');
  });

  it('reports the start of the range, not the end', () => {
    const message = buildErrorMessage(
      element({
        position: {
          start: { line: 2, column: 3 },
          end: { line: 9, column: 11 },
        },
      })
    );

    expect(message).toContain('line: 2');
    expect(message).not.toContain('line: 9');
  });

  it('gives the message alone when the parser reports no position', () => {
    expect(buildErrorMessage(element({}))).toBe('Could not parse the block');
  });

  /**
   * Plate renders this element before the value settles, so the component
   * asks for a message while it still holds nothing.
   */
  it('returns an empty string for a missing element', () => {
    expect(buildErrorMessage(undefined as unknown as InvalidMarkdownElement)).toBe(
      ''
    );
  });
});
