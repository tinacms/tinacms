import type * as Md from 'mdast';
import { describe, expect, it } from 'vitest';
import { serializeBreaks } from './break-serialization';

const paragraph = (children: unknown[]): Md.Root =>
  ({ type: 'root', children: [{ type: 'paragraph', children }] }) as Md.Root;

const text = (value: string) => ({ type: 'text', value });
const brk = { type: 'break' };

const typesIn = (tree: Md.Root) =>
  JSON.stringify(tree, (key, value) => (key === 'value' ? undefined : value));

const root = (children: unknown[]): Md.Root =>
  ({ type: 'root', children }) as Md.Root;

const heading = (children: unknown[], depth = 3) => ({
  type: 'heading',
  depth,
  children,
});

describe('serializeBreaks, dangling breaks', () => {
  it('drops a break with nothing after it', () => {
    const tree = paragraph([text('one'), brk]);
    expect(serializeBreaks(tree).children[0]).toMatchObject({
      children: [{ type: 'text' }],
    });
  });

  it('keeps a break with something after it', () => {
    const tree = paragraph([text('one'), brk, text('two')]);
    expect(typesIn(serializeBreaks(tree))).toBe(
      typesIn(paragraph([text('one'), brk, text('two')]))
    );
  });

  it('drops a break trailing inside the last mark of a block', () => {
    const tree = paragraph([{ type: 'strong', children: [text('one'), brk] }]);
    expect(serializeBreaks(tree).children[0]).toMatchObject({
      children: [{ type: 'strong', children: [{ type: 'text' }] }],
    });
  });

  it('keeps a break inside a mark when the block continues after it', () => {
    const nested = () => [
      { type: 'strong', children: [text('one'), brk] },
      text(' two'),
    ];
    expect(typesIn(serializeBreaks(paragraph(nested())))).toBe(
      typesIn(paragraph(nested()))
    );
  });

  /**
   * The shape the editor produces: Slate keeps a text node after a trailing
   * inline void, so the break is never literally the last child.
   */
  it('drops a break followed only by an empty text node', () => {
    const tree = paragraph([text('one'), brk, { type: 'text', value: '' }]);
    serializeBreaks(tree);
    expect(JSON.stringify(tree).includes('"break"')).toBe(false);
  });

  it('keeps an empty text node that is not trailing a break', () => {
    const tree = paragraph([{ type: 'text', value: '' }]);
    expect(typesIn(serializeBreaks(tree))).toBe(
      typesIn(paragraph([{ type: 'text', value: '' }]))
    );
  });

  it('leaves a break at the start of a block alone', () => {
    const tree = paragraph([brk, text('one')]);
    expect(typesIn(serializeBreaks(tree))).toBe(
      typesIn(paragraph([brk, text('one')]))
    );
  });
});

describe('serializeBreaks, headings', () => {
  it('splits a heading on a break, keeping the level', () => {
    const tree = root([heading([text('one'), brk, text('two')], 4)]);
    expect(serializeBreaks(tree).children).toMatchObject([
      { type: 'heading', depth: 4, children: [{ type: 'text' }] },
      { type: 'heading', depth: 4, children: [{ type: 'text' }] },
    ]);
  });

  it('leaves a heading without a break as one node', () => {
    const tree = root([heading([text('one two')])]);
    expect(serializeBreaks(tree).children).toHaveLength(1);
  });

  it('does not emit an empty heading for consecutive breaks', () => {
    const tree = root([heading([text('one'), brk, brk, text('two')])]);
    expect(serializeBreaks(tree).children).toHaveLength(2);
  });

  it('drops a heading-final break rather than splitting on it', () => {
    const tree = root([heading([text('one'), brk])]);
    expect(serializeBreaks(tree).children).toMatchObject([
      { type: 'heading', children: [{ type: 'text' }] },
    ]);
  });

  it('does not emit a bare heading for the editor trailing-break shape', () => {
    const tree = root([
      heading([text('one'), brk, { type: 'text', value: '' }]),
    ]);
    expect(serializeBreaks(tree).children).toMatchObject([
      { type: 'heading', children: [{ type: 'text' }] },
    ]);
  });

  it('splits the ancestor too when the break is nested', () => {
    const tree = root([
      heading([
        { type: 'link', url: '/x', children: [text('one'), brk, text('two')] },
      ]),
    ]);
    expect(serializeBreaks(tree).children).toMatchObject([
      { type: 'heading', children: [{ type: 'link', url: '/x' }] },
      { type: 'heading', children: [{ type: 'link', url: '/x' }] },
    ]);
  });

  it('keeps the content either side of a nested split', () => {
    const tree = root([
      heading([
        text('a '),
        { type: 'link', url: '/x', children: [text('one'), brk, text('two')] },
        text(' b'),
      ]),
    ]);
    const [first, second] = serializeBreaks(tree).children as Md.Heading[];
    expect(first?.children).toHaveLength(2);
    expect(second?.children).toHaveLength(2);
  });

  /**
   * Trim runs over the whole tree before any split. Splitting first would leave
   * the second heading holding only what followed the break — an empty copy of
   * the link, written out as `### [](/x)`.
   */
  it('does not leave an empty link behind when the break ends one', () => {
    const tree = root([
      heading([
        {
          type: 'link',
          url: '/x',
          children: [text('one'), brk, { type: 'text', value: '' }],
        },
        { type: 'text', value: '' },
      ]),
    ]);
    expect(serializeBreaks(tree).children).toMatchObject([
      { type: 'heading', children: [{ type: 'link', url: '/x' }] },
    ]);
  });

  it('drops an emptied link but keeps what followed it', () => {
    const tree = root([
      heading([
        {
          type: 'link',
          url: '/x',
          children: [text('one'), brk, { type: 'text', value: '' }],
        },
        text(' tail'),
      ]),
    ]);
    const [first, second] = serializeBreaks(tree).children as Md.Heading[];
    expect(first?.children).toMatchObject([{ type: 'link' }]);
    expect(second?.children).toMatchObject([{ type: 'text' }]);
  });

  it('splits a heading nested in a blockquote', () => {
    const tree = root([
      {
        type: 'blockquote',
        children: [heading([text('one'), brk, text('two')])],
      },
    ]);
    expect(
      (serializeBreaks(tree).children[0] as Md.Blockquote).children
    ).toHaveLength(2);
  });

  /**
   * `#` and `##` have a setext form, so the break survives as a real break in
   * one heading. Files already carry that shape — splitting them would
   * restructure content that round-trips correctly.
   */
  it.each([1, 2])('leaves an h%i intact for setext to carry', (depth) => {
    const tree = root([heading([text('one'), brk, text('two')], depth)]);
    expect(serializeBreaks(tree).children).toMatchObject([
      {
        type: 'heading',
        depth,
        children: [{ type: 'text' }, { type: 'break' }, { type: 'text' }],
      },
    ]);
  });

  it.each([1, 2])('still drops a trailing break in an h%i', (depth) => {
    const tree = root([heading([text('one'), brk], depth)]);
    expect(serializeBreaks(tree).children).toMatchObject([
      { type: 'heading', depth, children: [{ type: 'text' }] },
    ]);
  });
});
