import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from './parse';
import type * as Plate from './parse/plate';
import { serializeMDX } from './stringify';

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
type Container = { skip: string } | { md: string; path: number[] };

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
  a: { md: '[one two](/x)\n', path: [0, 0] },
  text: { skip: 'the injection site of every block row above' },
  img: { skip: 'void' },
  html_inline: { skip: 'carries a raw value, no inline children' },
  mdxJsxTextElement: { skip: 'children live in props' },
};

const CONTAINERS = { ...BLOCKS, ...INLINES };

type Position = 'mid' | 'final';

const newBreak = (): Plate.BreakElement => ({
  type: 'break',
  children: [{ type: 'text', text: '' }],
});

const nodeAt = (tree: Plate.RootElement, path: number[]) =>
  path.reduce<any>((node, index) => node.children[index], tree);

const inject = (children: Plate.InlineElement[], position: Position) => {
  if (position === 'final') {
    children.push(newBreak());
    return;
  }
  const index = children.findIndex(
    (child) => (child as Plate.TextElement).text === 'one two'
  );
  const target = children[index] as Plate.TextElement;
  children.splice(index, 1, { ...target, text: 'one' }, newBreak(), {
    ...target,
    text: 'two',
  });
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
  container: { md: string; path: number[] },
  position: Position,
  field: RichTextField
) => {
  const tree = parseMDX(container.md, field, passthrough);
  inject(nodeAt(tree, container.path).children, position);

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

const matrix = (field: RichTextField) => {
  const rows = Object.entries(CONTAINERS).flatMap(([name, container]) => {
    if ('skip' in container) {
      return [[name, '-', `skipped: ${container.skip}`, '-', '-', '-']];
    }
    return (['mid', 'final'] as Position[]).map((position) => {
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

  const widths = COLUMNS.map((_, column) =>
    Math.max(...[COLUMNS, ...rows].map((row) => (row[column] ?? '').length))
  );
  return [COLUMNS, ...rows]
    .map((row) =>
      row
        .map((cell, index) => cell.padEnd(widths[index] ?? 0))
        .join('  ')
        .trimEnd()
    )
    .join('\n');
};

const writtenColumn = (field: RichTextField) =>
  Object.entries(CONTAINERS).flatMap(([name, container]) =>
    'skip' in container
      ? []
      : (['mid', 'final'] as Position[]).map(
          (position) =>
            `${name} ${position} ${roundTrip(container, position, field).written}`
        )
  );

describe('a hard break in every container', () => {
  it('round-trips through the markdown parser', () => {
    expect(`\n${matrix(markdownField)}\n`).toMatchInlineSnapshot(`
      "
      container          position  written                                                       blocks  breaks  ok
      p                  mid       "one\\\\\\ntwo\\n"                                                1       1       parses
      p                  final     "one two\\\\\\n"                                                 1       0       parses UNSTABLE
      h1                 mid       "one\\\\\\ntwo\\n===\\n"                                           1       1       parses
      h1                 final     "one two\\\\\\n\\n"                                               1       0       parses UNSTABLE
      h2                 mid       "one\\\\\\ntwo\\n---\\n"                                           1       1       parses
      h2                 final     "one two\\\\\\n\\n"                                               1       0       parses UNSTABLE
      h3                 mid       "### one two\\n"                                               1       0       parses
      h3                 final     "### one two \\n"                                              1       0       parses UNSTABLE
      h4                 mid       "#### one two\\n"                                              1       0       parses
      h4                 final     "#### one two \\n"                                             1       0       parses UNSTABLE
      h5                 mid       "##### one two\\n"                                             1       0       parses
      h5                 final     "##### one two \\n"                                            1       0       parses UNSTABLE
      h6                 mid       "###### one two\\n"                                            1       0       parses
      h6                 final     "###### one two \\n"                                           1       0       parses UNSTABLE
      blockquote         mid       "> one\\\\\\n> two\\n"                                            1       1       parses
      blockquote         final     "> one two\\\\\\n>\\n"                                            1       0       parses UNSTABLE
      li                 mid       "* one\\\\\\n  two\\n"                                            1       1       parses
      li                 final     "* one two\\\\\\n"                                               1       0       parses UNSTABLE
      td                 mid       "| h       |\\n| ------- |\\n| one two |\\n"                     1       0       parses
      td                 final     "| h        |\\n| -------- |\\n| one two  |\\n"                  1       0       parses UNSTABLE
      code_block         -         skipped: wants a literal newline, not a break                 -       -       -
      hr                 -         skipped: void                                                 -       -       -
      html               -         skipped: carries a raw value, no inline children              -       -       -
      img                -         skipped: void                                                 -       -       -
      invalid_markdown   -         skipped: carries a parse error, not authored content          -       -       -
      mdxJsxFlowElement  -         skipped: children live in props, covered by the mdx fixtures  -       -       -
      ol                 -         skipped: holds list items                                     -       -       -
      ul                 -         skipped: holds list items                                     -       -       -
      table              -         skipped: holds rows                                           -       -       -
      tr                 -         skipped: holds cells                                          -       -       -
      a                  mid       "[one\\\\\\ntwo](/x)\\n"                                          1       0       INVALID UNSTABLE RESAVE THREW
      a                  final     "[one two\\\\\\n](/x)\\n"                                         1       0       INVALID UNSTABLE RESAVE THREW
      text               -         skipped: the injection site of every block row above          -       -       -
      html_inline        -         skipped: carries a raw value, no inline children              -       -       -
      mdxJsxTextElement  -         skipped: children live in props                               -       -       -
      "
    `);
  });

  it('round-trips through the mdx parser', () => {
    expect(`\n${matrix(mdxField)}\n`).toMatchInlineSnapshot(`
      "
      container          position  written                                                       blocks  breaks  ok
      p                  mid       "one\\\\\\ntwo\\n"                                                1       1       parses
      p                  final     "one two\\\\\\n"                                                 1       0       parses UNSTABLE
      h1                 mid       "one\\\\\\ntwo\\n===\\n"                                           1       1       parses
      h1                 final     "one two\\\\\\n\\n"                                               1       0       parses UNSTABLE
      h2                 mid       "one\\\\\\ntwo\\n---\\n"                                           1       1       parses
      h2                 final     "one two\\\\\\n\\n"                                               1       0       parses UNSTABLE
      h3                 mid       "### one two\\n"                                               1       0       parses
      h3                 final     "### one two \\n"                                              1       0       parses UNSTABLE
      h4                 mid       "#### one two\\n"                                              1       0       parses
      h4                 final     "#### one two \\n"                                             1       0       parses UNSTABLE
      h5                 mid       "##### one two\\n"                                             1       0       parses
      h5                 final     "##### one two \\n"                                            1       0       parses UNSTABLE
      h6                 mid       "###### one two\\n"                                            1       0       parses
      h6                 final     "###### one two \\n"                                           1       0       parses UNSTABLE
      blockquote         mid       "> one\\\\\\n> two\\n"                                            1       1       parses
      blockquote         final     "> one two\\\\\\n>\\n"                                            1       0       parses UNSTABLE
      li                 mid       "* one\\\\\\n  two\\n"                                            1       1       parses
      li                 final     "* one two\\\\\\n"                                               1       0       parses UNSTABLE
      td                 mid       "| h       |\\n| ------- |\\n| one two |\\n"                     1       0       parses
      td                 final     "| h        |\\n| -------- |\\n| one two  |\\n"                  1       0       parses UNSTABLE
      code_block         -         skipped: wants a literal newline, not a break                 -       -       -
      hr                 -         skipped: void                                                 -       -       -
      html               -         skipped: carries a raw value, no inline children              -       -       -
      img                -         skipped: void                                                 -       -       -
      invalid_markdown   -         skipped: carries a parse error, not authored content          -       -       -
      mdxJsxFlowElement  -         skipped: children live in props, covered by the mdx fixtures  -       -       -
      ol                 -         skipped: holds list items                                     -       -       -
      ul                 -         skipped: holds list items                                     -       -       -
      table              -         skipped: holds rows                                           -       -       -
      tr                 -         skipped: holds cells                                          -       -       -
      a                  mid       "[one\\\\\\ntwo](/x)\\n"                                          1       0       INVALID
      a                  final     "[one two\\\\\\n](/x)\\n"                                         1       0       INVALID
      text               -         skipped: the injection site of every block row above          -       -       -
      html_inline        -         skipped: carries a raw value, no inline children              -       -       -
      mdxJsxTextElement  -         skipped: children live in props                               -       -       -
      "
    `);
  });

  it('writes the same markdown from either parser', () => {
    expect(writtenColumn(mdxField)).toEqual(writtenColumn(markdownField));
  });
});
