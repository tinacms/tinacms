import { describe, expect, it } from 'vitest';
import { resolveRichTextNode } from './resolve';
import type { SuppliedComponents, TinaMarkdownContent } from './types';

const node = (value: Record<string, unknown>) => value as TinaMarkdownContent;
const none: SuppliedComponents = {};
const supplying = (...keys: string[]): SuppliedComponents =>
  Object.fromEntries(keys.map((key) => [key, () => null]));

describe('block nodes', () => {
  it('falls back to the tag of the node', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'h2', children: [{ type: 'text', text: 'Title' }] }),
      none
    );
    expect(instruction).toMatchObject({ kind: 'element', tag: 'h2' });
  });

  it('names the supplied component instead', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'h2', children: [] }),
      supplying('h2')
    );
    expect(instruction).toMatchObject({ kind: 'component', key: 'h2' });
  });

  it('reads a component that is present but undefined as absent', () => {
    const instruction = resolveRichTextNode(node({ type: 'p', children: [] }), {
      p: undefined,
    });
    expect(instruction).toMatchObject({ kind: 'element', tag: 'p' });
  });

  it('prefers blockquote over the deprecated block_quote', () => {
    expect(
      resolveRichTextNode(
        node({ type: 'blockquote', children: [] }),
        supplying('blockquote', 'block_quote')
      )
    ).toMatchObject({ kind: 'component', key: 'blockquote' });
    expect(
      resolveRichTextNode(
        node({ type: 'blockquote', children: [] }),
        supplying('block_quote')
      )
    ).toMatchObject({ kind: 'component', key: 'block_quote' });
  });

  it('renders list item content as a div', () => {
    expect(
      resolveRichTextNode(node({ type: 'lic', children: [] }), none)
    ).toMatchObject({ kind: 'element', tag: 'div' });
  });

  it('renders a break as br and a rule as hr', () => {
    expect(resolveRichTextNode(node({ type: 'break' }), none)).toMatchObject({
      kind: 'element',
      tag: 'br',
    });
    expect(resolveRichTextNode(node({ type: 'hr' }), none)).toMatchObject({
      kind: 'element',
      tag: 'hr',
    });
  });
});

describe('urls', () => {
  it('sanitizes a link href', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'a', url: 'javascript:alert(1)', children: [] }),
      none
    );
    expect(instruction).toMatchObject({ kind: 'element', tag: 'a' });
    expect((instruction as any).props.href).not.toContain('javascript');
  });

  it('sanitizes an image src', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'img', url: 'javascript:alert(1)', alt: 'x' }),
      none
    );
    expect((instruction as any).props.src).not.toContain('javascript');
  });

  it('hands the raw node to a supplied component and lets it decide', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'a', url: 'https://tina.io', children: [] }),
      supplying('a')
    );
    expect(instruction).toMatchObject({
      kind: 'component',
      key: 'a',
      props: { url: 'https://tina.io' },
    });
  });
});

describe('leaves', () => {
  it('orders marks outermost first, with the tag each falls back to', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'text', text: 'hi', bold: true, italic: true, code: true }),
      none
    );
    expect(instruction).toEqual({
      kind: 'leaf',
      text: 'hi',
      marks: [
        { kind: 'element', tag: 'strong', props: {} },
        { kind: 'element', tag: 'em', props: {} },
        { kind: 'element', tag: 'code', props: {} },
      ],
    });
  });

  it('carries the highlight colour whether or not a component takes it', () => {
    const highlighted = node({
      type: 'text',
      text: 'hi',
      highlight: true,
      highlightColor: '#ff0',
    });
    expect((resolveRichTextNode(highlighted, none) as any).marks).toEqual([
      { kind: 'element', tag: 'mark', props: { color: '#ff0' } },
    ]);
    expect(
      (resolveRichTextNode(highlighted, supplying('highlight')) as any).marks
    ).toEqual([
      { kind: 'component', key: 'highlight', props: { color: '#ff0' } },
    ]);
  });

  it('puts a supplied text component innermost', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'text', text: 'hi', bold: true }),
      supplying('text')
    );
    expect((instruction as any).marks).toEqual([
      { kind: 'element', tag: 'strong', props: {} },
      { kind: 'component', key: 'text', props: {} },
    ]);
  });

  it('treats an untyped node carrying text as a leaf', () => {
    expect(
      resolveRichTextNode(node({ type: 'something-else', text: 'hi' }), none)
    ).toMatchObject({ kind: 'leaf', text: 'hi' });
  });

  it('renders nothing for a node it does not know', () => {
    expect(resolveRichTextNode(node({ type: 'something-else' }), none)).toEqual(
      { kind: 'nothing' }
    );
  });
});

describe('code blocks', () => {
  it('joins the lines of a code block into one string', () => {
    const instruction = resolveRichTextNode(
      node({
        type: 'code_block',
        children: [
          { type: 'code_line', children: [{ type: 'text', text: 'one' }] },
          { type: 'code_line', children: [{ type: 'text', text: 'two' }] },
        ],
      }),
      supplying('code_block')
    );
    expect((instruction as any).props.value).toBe('one\ntwo');
  });

  it('falls back to the value of the node', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'code_block', value: 'plain' }),
      supplying('code_block')
    );
    expect((instruction as any).props.value).toBe('plain');
  });

  it('wraps the fallback in pre and code', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'code_block', value: 'plain' }),
      none
    );
    expect(instruction).toMatchObject({
      kind: 'element',
      tag: 'pre',
      children: {
        kind: 'nodes',
        nodes: [
          {
            kind: 'element',
            tag: 'code',
            children: { kind: 'text', text: 'plain' },
          },
        ],
      },
    });
  });
});

describe('mdx elements', () => {
  const hero = node({
    type: 'mdxJsxFlowElement',
    name: 'Hero',
    props: { title: 'Hi' },
  });

  it('passes the props of the element straight through', () => {
    expect(resolveRichTextNode(hero, supplying('Hero'))).toEqual({
      kind: 'component',
      key: 'Hero',
      props: { title: 'Hi' },
      children: { kind: 'none' },
    });
  });

  it('uses component_missing when the site supplied one', () => {
    expect(resolveRichTextNode(hero, supplying('component_missing'))).toEqual({
      kind: 'component',
      key: 'component_missing',
      props: { name: 'Hero' },
      children: { kind: 'none' },
    });
  });

  it('states the name in a span when it did not', () => {
    expect(resolveRichTextNode(hero, none)).toEqual({
      kind: 'element',
      tag: 'span',
      props: {},
      children: { kind: 'text', text: 'No component provided for Hero' },
    });
  });

  it('escapes raw html rather than injecting it', () => {
    expect(
      resolveRichTextNode(
        node({ type: 'html', value: '<script>alert(1)</script>' }),
        none
      )
    ).toEqual({ kind: 'text', text: '<script>alert(1)</script>' });
  });

  it('renders nothing for a node still being edited', () => {
    expect(
      resolveRichTextNode(node({ type: 'maybe_mdx', children: [] }), none)
    ).toEqual({ kind: 'nothing' });
  });
});

describe('tables', () => {
  const tableRows = [
    { tableCells: [{ value: { type: 'p' } }, { value: { type: 'p' } }] },
    { tableCells: [{ value: { type: 'p' } }, { value: { type: 'p' } }] },
  ];

  it('splits the header off an mdx table when the flag is set', () => {
    const instruction = resolveRichTextNode(
      node({
        type: 'mdxJsxFlowElement',
        name: 'table',
        props: { firstRowHeader: true, align: ['left', 'right'], tableRows },
      }),
      none
    ) as any;
    expect(instruction.source).toBe('mdx');
    expect(instruction.align).toEqual(['left', 'right']);
    expect(instruction.header).toHaveLength(2);
    expect(instruction.rows).toHaveLength(1);
  });

  it('keeps every row in the body without the flag', () => {
    const instruction = resolveRichTextNode(
      node({
        type: 'mdxJsxFlowElement',
        name: 'table',
        props: { tableRows },
      }),
      none
    ) as any;
    expect(instruction.header).toBeNull();
    expect(instruction.rows).toHaveLength(2);
  });

  it('survives a row with no cells', () => {
    const instruction = resolveRichTextNode(
      node({
        type: 'mdxJsxFlowElement',
        name: 'table',
        props: { tableRows: [{}] },
      }),
      none
    ) as any;
    expect(instruction.rows).toEqual([[]]);
  });

  it('normalises a pipe table into the same shape, treating its first row as the header', () => {
    const instruction = resolveRichTextNode(
      node({
        type: 'table',
        children: [
          { type: 'tr', children: [{ type: 'td', children: [] }] },
          { type: 'tr', children: [{ type: 'td', children: [] }] },
        ],
      }),
      none
    ) as any;
    expect(instruction.source).toBe('gfm');
    expect(instruction.header).toEqual([{ content: [] }]);
    expect(instruction.rows).toEqual([[{ content: [] }]]);
  });

  it('treats an empty pipe table as having no header', () => {
    const instruction = resolveRichTextNode(
      node({ type: 'table', children: [] }),
      none
    ) as any;
    expect(instruction.header).toBeNull();
    expect(instruction.rows).toEqual([]);
  });

  it('keeps a column position when its alignment is not one of the three keywords', () => {
    const instruction = resolveRichTextNode(
      node({
        type: 'mdxJsxFlowElement',
        name: 'table',
        props: { align: ['left', 'centre', null, 'right'], tableRows },
      }),
      none
    ) as any;
    expect(instruction.align).toEqual(['left', undefined, undefined, 'right']);
  });

  it('prefers a supplied table component over the mdx fallback', () => {
    expect(
      resolveRichTextNode(
        node({ type: 'mdxJsxFlowElement', name: 'table', props: {} }),
        supplying('table')
      )
    ).toMatchObject({ kind: 'component', key: 'table' });
  });
});
