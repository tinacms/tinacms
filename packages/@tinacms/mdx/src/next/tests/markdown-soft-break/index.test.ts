import { expect, it } from 'vitest';
import { serializeMDX } from '../../../stringify';
import { field } from './field';

/**
 * SoftBreakPlugin (Shift+Enter) inserts a literal `\n` into the text node's
 * `.text` string rather than a separate `{ type: 'break' }` node. Verify
 * that the serializer converts those embedded newlines into proper Markdown
 * hard breaks (`\` at end of line).
 */
it('serializes embedded \\n in text node as a Markdown hard break', () => {
  const tree = {
    type: 'root' as const,
    children: [
      {
        type: 'p' as const,
        children: [{ type: 'text' as const, text: 'Line one\nLine two' }],
      },
    ],
  };

  const result = serializeMDX(tree, field, (v) => v);
  expect(result).toBe('Line one\\\nLine two\n');
});

it('serializes multiple embedded \\n as multiple hard breaks', () => {
  const tree = {
    type: 'root' as const,
    children: [
      {
        type: 'p' as const,
        children: [
          {
            type: 'text' as const,
            text: '123 Abc Street\nTown Central, CA\n90210',
          },
        ],
      },
    ],
  };

  const result = serializeMDX(tree, field, (v) => v);
  expect(result).toBe('123 Abc Street\\\nTown Central, CA\\\n90210\n');
});
