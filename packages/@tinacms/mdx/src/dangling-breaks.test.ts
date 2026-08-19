import type * as Md from 'mdast';
import { describe, expect, it } from 'vitest';
import { dropDanglingBreaks } from './dangling-breaks';

const paragraph = (children: unknown[]): Md.Root =>
  ({ type: 'root', children: [{ type: 'paragraph', children }] }) as Md.Root;

const text = (value: string) => ({ type: 'text', value });
const brk = { type: 'break' };

const typesIn = (tree: Md.Root) =>
  JSON.stringify(tree, (key, value) => (key === 'value' ? undefined : value));

describe('dropDanglingBreaks', () => {
  it('drops a break with nothing after it', () => {
    const tree = paragraph([text('one'), brk]);
    expect(dropDanglingBreaks(tree).children[0]).toMatchObject({
      children: [{ type: 'text' }],
    });
  });

  it('keeps a break with something after it', () => {
    const tree = paragraph([text('one'), brk, text('two')]);
    expect(typesIn(dropDanglingBreaks(tree))).toBe(
      typesIn(paragraph([text('one'), brk, text('two')]))
    );
  });

  it('drops a break trailing inside the last mark of a block', () => {
    const tree = paragraph([{ type: 'strong', children: [text('one'), brk] }]);
    expect(dropDanglingBreaks(tree).children[0]).toMatchObject({
      children: [{ type: 'strong', children: [{ type: 'text' }] }],
    });
  });

  it('keeps a break inside a mark when the block continues after it', () => {
    const nested = () => [
      { type: 'strong', children: [text('one'), brk] },
      text(' two'),
    ];
    expect(typesIn(dropDanglingBreaks(paragraph(nested())))).toBe(
      typesIn(paragraph(nested()))
    );
  });

  it('leaves a break at the start of a block alone', () => {
    const tree = paragraph([brk, text('one')]);
    expect(typesIn(dropDanglingBreaks(tree))).toBe(
      typesIn(paragraph([brk, text('one')]))
    );
  });
});
