import type { RichTextField } from '@tinacms/schema-tools';
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx';
import { describe, expect, it } from 'vitest';
import { stringifyProps as stringifyPropsNext } from '../next/stringify/acorn';
import { eat as eatNext } from '../next/stringify/marks';
import { parseMDX } from '../parse';
import type * as Plate from '../parse/plate';
import { serializeMDX } from '.';
import { stringifyProps } from './acorn';
import { eat } from './marks';

const passthrough = (v: string) => v;

const field = {
  name: 'body',
  type: 'rich-text',
  templates: [
    {
      name: 'Callout',
      fields: [
        { type: 'string', name: 'tags', list: true },
        { type: 'datetime', name: 'dates', list: true },
        { type: 'reference', name: 'refs', list: true, collections: ['post'] },
        { type: 'image', name: 'images', list: true },
        { type: 'number', name: 'numbers', list: true },
        { type: 'boolean', name: 'flags', list: true },
        { type: 'number', name: 'count' },
        { type: 'boolean', name: 'enabled' },
        {
          type: 'object',
          name: 'meta',
          fields: [
            { type: 'number', name: 'offset' },
            { type: 'number', name: 'scores', list: true },
          ],
        },
      ],
    },
  ],
} as RichTextField;

const element = (props: Record<string, unknown>) =>
  ({
    type: 'mdxJsxFlowElement',
    name: 'Callout',
    props,
    children: [{ type: 'text', text: '' }],
  }) as unknown as Plate.MdxBlockElement;

const attributes = (
  stringify: typeof stringifyProps,
  props: Record<string, unknown>
) => stringify(element(props), field, false, passthrough).attributes;

const roundTrip = (props: Record<string, unknown>) => {
  const root = {
    type: 'root',
    children: [element(props)],
  } as Plate.RootElement;
  const mdx = serializeMDX(root, field, passthrough) as string;
  const [node] = parseMDX(mdx, field, passthrough).children;
  if (node?.type !== 'mdxJsxFlowElement') {
    throw new Error(`Did not load back: ${JSON.stringify(node)}`);
  }
  return node.props;
};

const awkwardText = [
  'news',
  'say "hi"',
  'C:\\path\\to',
  'line one\nline two',
  'a, b) }]',
  "it's `quoted`",
  'café 🚀',
];

describe('rich-text component values', () => {
  describe.each(['tags', 'dates', 'refs', 'images'])('%s list', (name) => {
    it('keeps plain values unchanged in the output', () => {
      const [attribute] = attributes(stringifyProps, {
        [name]: ['news', 'tech'],
      });
      expect(attribute?.value).toMatchObject({ value: '["news", "tech"]' });
    });

    it('loads values with special characters back unchanged', () => {
      expect(roundTrip({ [name]: awkwardText })).toEqual({
        [name]: awkwardText,
      });
    });
  });

  describe('number list', () => {
    it('loads numbers back as numbers', () => {
      expect(roundTrip({ numbers: [1, -2.5, '3'] })).toEqual({
        numbers: [1, -2.5, 3],
      });
    });

    it('keeps plain values unchanged in the output', () => {
      const [attribute] = attributes(stringifyProps, { numbers: [1, 2.5] });
      expect(attribute?.value).toMatchObject({ value: '[1, 2.5]' });
    });

    it('loads a cleared item back as null', () => {
      expect(roundTrip({ numbers: [1, ''] })).toEqual({ numbers: [1, null] });
    });

    it.each([['abc'], [Number.NaN], [Number.POSITIVE_INFINITY]])(
      'rejects %s',
      (item) => {
        expect(() => roundTrip({ numbers: [1, item] })).toThrow(
          /"numbers" field/
        );
      }
    );
  });

  describe('boolean list', () => {
    it('loads booleans back as booleans', () => {
      expect(roundTrip({ flags: [true, false, 'true'] })).toEqual({
        flags: [true, false, true],
      });
    });

    it.each([['yes'], [1]])('rejects %s', (item) => {
      expect(() => roundTrip({ flags: [true, item] })).toThrow(/"flags" field/);
    });
  });

  describe('single number and boolean', () => {
    it('loads the value back', () => {
      expect(roundTrip({ count: -4, enabled: false })).toEqual({
        count: -4,
        enabled: false,
      });
    });

    it.each(['', undefined, null])('loads %o back as null', (value) => {
      expect(roundTrip({ count: value, enabled: value })).toEqual({
        count: null,
        enabled: null,
      });
    });

    it('rejects a value that is not a number', () => {
      expect(() => roundTrip({ count: 'abc' })).toThrow(/"count" field/);
    });

    it('rejects a value that is not a boolean', () => {
      expect(() => roundTrip({ enabled: 'yes' })).toThrow(/"enabled" field/);
    });
  });

  it('loads negative numbers in an object back', () => {
    const meta = { offset: -1, scores: [-1, 2] };
    expect(roundTrip({ meta })).toEqual({ meta });
  });

  it('writes the same values with the markdown parser', () => {
    const props = {
      tags: awkwardText,
      images: awkwardText,
      numbers: [1, -2.5, ''],
      flags: [true, 'false'],
      count: '',
      enabled: true,
    };
    expect(attributes(stringifyPropsNext, props)).toEqual(
      attributes(stringifyProps, props)
    );
  });
});

describe.each([
  ['mdx', eat],
  ['markdown', eatNext],
] as const)('highlight colour (%s parser)', (_, eatMarks) => {
  const mark = (highlightColor: string) => {
    const [node] = eatMarks(
      [{ type: 'text', text: 'hi', highlight: true, highlightColor }],
      field,
      passthrough
    ) as unknown as { name: string; attributes: MdxJsxAttribute[] }[];
    return node!;
  };

  it.each([
    '#FEF08A',
    '#fff',
    'rebeccapurple',
    'rgb(1, 2, 3)',
    'hsla(120 50% 50% / 0.5)',
    'var(--brand-highlight)',
    'var(--brand, #fff)',
    'oklch(70% 0.15 200)',
    'var(--café)',
  ])('keeps %s', (colour) => {
    expect(mark(colour).attributes[0]?.value).toMatchObject({
      value: `{ backgroundColor: "${colour}" }`,
    });
  });

  it.each(['red"', '#ff00ff;', 'red}', 'blue\\9', 'x'.repeat(101)])(
    'drops the colour %s but keeps the highlight',
    (colour) => {
      const node = mark(colour);
      expect(node.name).toBe('mark');
      expect(node.attributes).toEqual([]);
    }
  );
});
