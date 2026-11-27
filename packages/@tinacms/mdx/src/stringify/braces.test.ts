import type { RichTextField } from '@tinacms/schema-tools';
import { describe, expect, it } from 'vitest';
import { parseMDX } from '../parse';
import type * as Plate from '../parse/plate';
import { serializeMDX } from '.';

const passthrough = (v: string) => v;

const field: RichTextField = {
  name: 'body',
  type: 'rich-text',
  templates: [
    {
      name: 'Note',
      fields: [{ type: 'string', name: 'label' }],
    },
  ],
};

const save = (children: unknown[]) =>
  serializeMDX(
    { type: 'root', children } as Plate.RootElement,
    field,
    passthrough
  ) as string;

const load = (markdown: string) =>
  parseMDX(markdown, field, passthrough) as Plate.RootElement;

const text = (value: string) => ({ type: 'text', text: value });
const p = (...children: unknown[]) => ({ type: 'p', children });

/** Every text value in the tree, in order. */
const textsOf = (node: any): string[] =>
  typeof node.text === 'string'
    ? [node.text]
    : (node.children ?? []).flatMap(textsOf);

const BRACES = [
  'Hello {{ title }} there',
  'GET/{uuid}',
  '{% for x in y %}',
  'a { b',
  'a } b',
  'opens { and } closes',
];

/**
 * MDX reads `{` as the start of an expression. The serializer escaped `<` for the same reason but
 * not `{`, so text with a brace saved as written, and the whole field then failed to load — after
 * a single save of a document that had opened fine.
 */
describe('a brace in text', () => {
  const places: Record<string, (value: string) => unknown> = {
    paragraph: (value) => p(text(value)),
    heading: (value) => ({ type: 'h2', children: [text(value)] }),
    'list item': (value) => ({
      type: 'ul',
      children: [
        { type: 'li', children: [{ type: 'lic', children: [text(value)] }] },
      ],
    }),
    'table cell': (value) => ({
      type: 'table',
      children: [
        { type: 'tr', children: [{ type: 'td', children: [p(text(value))] }] },
      ],
    }),
    'link text': (value) =>
      p({ type: 'a', url: 'https://example.com', children: [text(value)] }),
    'bold text': (value) => p({ type: 'text', text: value, bold: true }),
  };

  for (const [place, build] of Object.entries(places)) {
    for (const value of BRACES) {
      it(`survives a save and a load in a ${place}: ${value}`, () => {
        const loaded = load(save([build(value)]));

        expect(loaded.children[0]?.type).not.toBe('invalid_markdown');
        expect(textsOf(loaded).join('')).toContain(value);
      });
    }
  }

  it('is written escaped', () => {
    expect(save([p(text('a {b} c'))])).toBe('a \\{b} c\n');
  });
});

describe('content that already loads', () => {
  it('saves unchanged when it holds an escaped brace', () => {
    const markdown = 'a \\{b} c\n';

    expect(save(load(markdown).children)).toBe(markdown);
  });

  it('keeps a brace in inline code unescaped', () => {
    const markdown = 'run `f({ a })` now\n';

    expect(save(load(markdown).children)).toBe(markdown);
  });

  it('keeps a brace in a code block unescaped', () => {
    const markdown = '```js\nconst a = { b: 1 };\n```\n';

    expect(save(load(markdown).children)).toBe(markdown);
  });

  it('keeps a brace in an embed’s prop as it was', () => {
    const markdown = '<Note label="{x}" />\n';

    expect(save(load(markdown).children)).toBe(markdown);
  });
});
