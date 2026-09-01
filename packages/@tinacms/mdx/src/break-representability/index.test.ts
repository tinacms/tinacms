import type { RichTextField } from '@tinacms/schema-tools';
import { toMatchFile } from 'jest-file-snapshot';
import { describe, expect, it } from 'vitest';
import { parseMDX } from '../parse';
import type * as Plate from '../parse/plate';
import { serializeMDX } from '../stringify';

expect.extend({ toMatchFile });

/**
 * Where a hard break survives, and where it does not.
 *
 * Every container is keyed off the `BlockElement` / `InlineElement` unions in
 * `parse/plate.ts`, so adding an element type there fails typecheck until
 * someone says what a break does inside it. Prior attempts at #7415 each
 * hand-maintained a partial list and regressed a container they had not
 * thought of.
 *
 * The matrix records current behaviour, including the broken rows. Fixes flip
 * rows in the snapshot rather than adding assertions to it.
 */

const passthrough = (value: string) => value;

const markdownField: RichTextField = {
  name: 'body',
  type: 'rich-text',
  parser: { type: 'markdown' },
};

const mdxField: RichTextField = {
  name: 'body',
  type: 'rich-text',
};

/**
 * `md` is parsed into a real tree and the break injected into the result. Hand
 * written node literals are how a wrong node shape ends up producing empty
 * output that reads as a finding.
 *
 * `path` indexes `children` from the root, down to the node holding the inline
 * content. The text `one two` inside it is the injection site.
 */
type Container =
  | { skip: string }
  | { md: string; path: number[]; inline?: boolean; beforeNeighbour?: boolean };

const BLOCKS: Record<Plate.BlockElement['type'], Container> = {
  p: { md: 'one two\n', path: [0] },
  h1: { md: '# one two\n', path: [0] },
  h2: { md: '## one two\n', path: [0] },
  h3: { md: '### one two\n', path: [0] },
  h4: { md: '#### one two\n', path: [0] },
  h5: { md: '##### one two\n', path: [0] },
  h6: { md: '###### one two\n', path: [0] },
  blockquote: { md: '> one two\n', path: [0] },
  li: { md: '* one two\n', path: [0, 0, 0] },
  td: { md: '| h |\n| - |\n| one two |\n', path: [0, 1, 0, 0] },
  code_block: { skip: 'wants a literal newline, not a break' },
  hr: { skip: 'void' },
  html: { skip: 'carries a raw value, no inline children' },
  img: { skip: 'void' },
  invalid_markdown: { skip: 'carries a parse error, not authored content' },
  mdxJsxFlowElement: {
    skip: 'children live in props, covered by the mdx fixtures',
  },
  ol: { skip: 'holds list items' },
  ul: { skip: 'holds list items' },
  table: { skip: 'holds rows' },
  tr: { skip: 'holds cells' },
};

const INLINES: Record<
  Exclude<Plate.InlineElement['type'], 'break'>,
  Container
> = {
  a: { md: '[one two](/x)\n', path: [0, 0], inline: true },
  text: { skip: 'the injection site of every block row above' },
  img: { skip: 'void' },
  html_inline: { skip: 'carries a raw value, no inline children' },
  mdxJsxTextElement: { skip: 'children live in props' },
};

/**
 * The third axis: what the break sits in FRONT of. A break puts its neighbour at
 * the start of a line, and some neighbours read differently there — which
 * container by position alone cannot express, and which hid three corruptions.
 */
const NEIGHBOURS: [string, Container][] = [
  [
    'html after',
    { md: 'one two <em>x</em>\n', path: [0], beforeNeighbour: true },
  ],
  [
    'inline template after',
    {
      skip:
        'needs a field carrying templates, which this matrix has none of — ' +
        'covered end to end in break-neighbours.test.ts',
    },
  ],
];

/**
 * Nesting combinations rather than types. The type axis never crosses a block
 * container with an inline one, and that gap hid a defect where a break ending
 * a link inside a heading wrote a spurious empty heading.
 */
const NESTED: [string, Container][] = [
  ['a in h3', { md: '### [one two](/x)\n', path: [0, 0], inline: true }],
  ['a in li', { md: '* [one two](/x)\n', path: [0, 0, 0, 0], inline: true }],
  ['a in blockquote', { md: '> [one two](/x)\n', path: [0, 0], inline: true }],
];

/**
 * Pairs, not a merged object: `img` is a key of both unions, so spreading them
 * together drops the block entry and the matrix loses a row silently.
 */
const CONTAINERS: [string, Container][] = [
  ...Object.entries(BLOCKS).map(
    ([type, container]) => [type, container] as [string, Container]
  ),
  ...Object.entries(INLINES).map(
    ([type, container]) =>
      [`${type} (inline)`, container] as [string, Container]
  ),
  ...NESTED,
  ...NEIGHBOURS,
];

/**
 * `final-editor` is the shape the editor actually produces: Slate keeps a text
 * node after a trailing inline void, and `createHardBreakPlugin` inserts one
 * explicitly. A bare trailing break only ever came from a synthetic fixture, so
 * testing `final` alone hides every defect on the path users take.
 */
type Position =
  | 'mid'
  | 'final'
  | 'final-editor'
  | 'final-editor-twice'
  | 'before-neighbour';

const POSITIONS: Position[] = [
  'mid',
  'final',
  'final-editor',
  'final-editor-twice',
];

const newBreak = (): Plate.BreakElement => ({
  type: 'break',
  children: [{ type: 'text', text: '' }],
});

const nodeAt = (tree: Plate.RootElement, path: number[]) =>
  path.reduce<any>((node, index) => node.children[index], tree);

const emptyText = (): Plate.EmptyTextElement => ({ type: 'text', text: '' });

const inject = (children: Plate.InlineElement[], position: Position) => {
  if (position === 'before-neighbour') {
    // The two parsers tokenise inline html differently — one node for mdx, an
    // open/close pair for markdown — so anchor on the first of them.
    const at = children.findIndex((child) =>
      ['html_inline', 'mdxJsxTextElement'].includes(
        (child as { type?: string }).type ?? ''
      )
    );
    children.splice(at, 0, newBreak());
    return;
  }
  if (position === 'mid') {
    const index = children.findIndex(
      (child) => (child as Plate.TextElement).text === 'one two'
    );
    const target = children[index] as Plate.TextElement;
    children.splice(index, 1, { ...target, text: 'one' }, newBreak(), {
      ...target,
      text: 'two',
    });
    return;
  }
  children.push(newBreak());
  if (position === 'final') {
    return;
  }
  children.push(emptyText());
  if (position === 'final-editor-twice') {
    children.push(newBreak(), emptyText());
  }
};

const countBreaks = (node: unknown): number => {
  if (!node || typeof node !== 'object') {
    return 0;
  }
  const { type, children } = node as { type?: string; children?: unknown[] };
  const here = type === 'break' ? 1 : 0;
  return (children ?? []).reduce<number>(
    (total, child) => total + countBreaks(child),
    here
  );
};

const roundTrip = (
  container: { md: string; path: number[]; inline?: boolean },
  position: Position,
  field: RichTextField
) => {
  const tree = parseMDX(container.md, field, passthrough);
  inject(nodeAt(tree, container.path).children, position);
  // Slate keeps a spacer after a trailing inline void at every level, so a
  // break ending a link leaves one inside the link AND after it. Missing the
  // outer one is what hid the break-inside-a-link defect.
  if (container.inline && position !== 'mid' && position !== 'final') {
    nodeAt(tree, container.path.slice(0, -1)).children.push(emptyText());
  }

  const written = serializeMDX(tree, field, passthrough) as string;
  const reread = parseMDX(written, field, passthrough);

  let rewritten: string | null = null;
  try {
    rewritten = serializeMDX(reread, field, passthrough) as string;
  } catch {
    // The markdown parser has no `invalid_markdown` case on the way back out,
    // so a field that failed to parse throws on the next save.
    rewritten = null;
  }

  return {
    written,
    blocks: reread.children.length,
    breaks: countBreaks(reread),
    // A block-final break writes a dangling `\`, which reads back as literal
    // text and re-writes as `\\`. Bytes alone would call that a pass.
    stable: rewritten === written,
    resaves: rewritten !== null,
    // A break in a link is byte-stable yet collapses the whole field.
    parses: reread.children[0]?.type !== 'invalid_markdown',
  };
};

const COLUMNS = ['container', 'position', 'written', 'blocks', 'breaks', 'ok'];

const rows = (field: RichTextField) =>
  CONTAINERS.flatMap(([name, container]) => {
    if ('skip' in container) {
      return [[name, '-', `skipped: ${container.skip}`, '-', '-', '-']];
    }
    const positions = container.beforeNeighbour
      ? (['before-neighbour'] as Position[])
      : POSITIONS;
    return positions.map((position) => {
      const { written, blocks, breaks, stable, resaves, parses } = roundTrip(
        container,
        position,
        field
      );
      const flags = [
        parses ? 'parses' : 'INVALID',
        stable ? '' : 'UNSTABLE',
        resaves ? '' : 'RESAVE THREW',
      ];
      return [
        name,
        position,
        JSON.stringify(written),
        String(blocks),
        String(breaks),
        flags.filter(Boolean).join(' '),
      ];
    });
  });

const matrix = (field: RichTextField) => {
  const body = rows(field);
  const widths = COLUMNS.map((_, column) =>
    Math.max(...[COLUMNS, ...body].map((row) => (row[column] ?? '').length))
  );
  return [COLUMNS, ...body]
    .map((row) =>
      row
        .map((cell, index) => cell.padEnd(widths[index] ?? 0))
        .join('  ')
        .trimEnd()
    )
    .join('\n');
};

/** The issue claims both parsers write byte-identical markdown; this pins it. */
const writtenColumn = (field: RichTextField) =>
  rows(field)
    .filter((row) => row[1] !== '-')
    .map((row) => `${row[0]} ${row[1]} ${row[2]}`);

describe('a hard break in every container', () => {
  it('round-trips through the markdown parser', () => {
    expect(`${matrix(markdownField)}\n`).toMatchFile(
      `${__dirname}/markdown.md`
    );
  });

  it('round-trips through the mdx parser', () => {
    expect(`${matrix(mdxField)}\n`).toMatchFile(`${__dirname}/mdx.md`);
  });

  it('writes the same markdown from either parser', () => {
    expect(writtenColumn(mdxField)).toEqual(writtenColumn(markdownField));
  });
});
