import type { RichTextField } from '@tinacms/schema-tools';
import { parse } from 'acorn';
import type { Node } from 'estree';
import type { MdxJsxAttribute } from 'mdast-util-mdx-jsx';
import { describe, expect, it } from 'vitest';
import { stringifyProps as stringifyPropsNext } from '../next/stringify/acorn';
import { eat as eatNext } from '../next/stringify/marks';
import type * as Plate from '../parse/plate';
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
      ],
    },
  ],
} as RichTextField;

const serializers = [
  ['mdx', stringifyProps, eat],
  ['markdown', stringifyPropsNext, eatNext],
] as const;

/**
 * Return the value of an expression built only from literals, arrays and
 * objects. Throw for any other node, because a site that evaluates the MDX
 * would run it.
 */
const literalValue = (node: Node): unknown => {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'UnaryExpression':
      if (node.operator === '-' && node.argument.type === 'Literal') {
        return -(node.argument.value as number);
      }
      break;
    case 'ArrayExpression':
      return node.elements.map((element) => literalValue(element as Node));
    case 'ObjectExpression':
      return Object.fromEntries(
        node.properties.map((property) => {
          if (property.type !== 'Property' || property.computed) {
            throw new Error(`Unexpected ${property.type} in object`);
          }
          const key =
            property.key.type === 'Identifier'
              ? property.key.name
              : literalValue(property.key);
          return [key, literalValue(property.value as Node)];
        })
      );
  }
  throw new Error(`Unexpected ${node.type} in attribute value`);
};

const evaluateAttribute = (attribute: MdxJsxAttribute | undefined) => {
  const value = attribute?.value;
  if (!value || typeof value === 'string') {
    throw new Error('Expected an expression attribute');
  }
  const program = parse(`(${value.value})`, { ecmaVersion: 'latest' });
  const [statement, ...rest] = program.body as Node[];
  if (statement?.type !== 'ExpressionStatement' || rest.length) {
    throw new Error('Expected a single expression');
  }
  return literalValue(statement.expression);
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

describe.each(serializers)(
  'attribute values (%s parser)',
  (_, stringify, eatMarks) => {
    const attribute = (props: Record<string, unknown>) => {
      const element = {
        type: 'mdxJsxFlowElement',
        name: 'Callout',
        props,
        children: [{ type: 'text', text: '' }],
      } as unknown as Plate.MdxBlockElement;
      const { attributes } = stringify(element, field, false, passthrough);
      return attributes[0] as MdxJsxAttribute;
    };

    describe.each(['tags', 'dates', 'refs', 'images'])('%s list', (name) => {
      it('keeps plain values unchanged in the output', () => {
        expect(attribute({ [name]: ['news', 'tech'] }).value).toMatchObject({
          value: '["news", "tech"]',
        });
      });

      it('keeps values with special characters as literal strings', () => {
        const value = evaluateAttribute(attribute({ [name]: awkwardText }));
        expect(value).toEqual(awkwardText);
      });
    });

    describe('number list', () => {
      it('writes numbers as numbers', () => {
        expect(
          evaluateAttribute(attribute({ numbers: [1, -2.5, '3'] }))
        ).toEqual([1, -2.5, 3]);
      });

      it('keeps plain values unchanged in the output', () => {
        expect(attribute({ numbers: [1, 2.5] }).value).toMatchObject({
          value: '[1, 2.5]',
        });
      });

      it.each([['(1)'], ['abc'], [Number.NaN], [Number.POSITIVE_INFINITY]])(
        'rejects %s',
        (item) => {
          expect(() => attribute({ numbers: [1, item] })).toThrow(
            /"numbers" field/
          );
        }
      );
    });

    describe('boolean list', () => {
      it('writes booleans as booleans', () => {
        expect(
          evaluateAttribute(attribute({ flags: [true, false, 'true'] }))
        ).toEqual([true, false, true]);
      });

      it.each([['(1)'], ['yes'], [1]])('rejects %s', (item) => {
        expect(() => attribute({ flags: [true, item] })).toThrow(
          /"flags" field/
        );
      });
    });

    describe('single number and boolean', () => {
      it('writes the value as a literal', () => {
        expect(evaluateAttribute(attribute({ count: 4 }))).toBe(4);
        expect(evaluateAttribute(attribute({ enabled: false }))).toBe(false);
      });

      it('rejects a value that is not a number', () => {
        expect(() => attribute({ count: '(1)' })).toThrow(/"count" field/);
      });

      it('rejects a value that is not a boolean', () => {
        expect(() => attribute({ enabled: '(1)' })).toThrow(/"enabled" field/);
      });
    });

    describe('highlight colour', () => {
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
      ])('keeps %s', (colour) => {
        expect(mark(colour).attributes[0]?.value).toMatchObject({
          value: `{ backgroundColor: "${colour}" }`,
        });
      });

      it.each(['red"', '#ff00ff;', 'red} p {', 'blue\\9', 'x'.repeat(101)])(
        'drops the colour %s but keeps the highlight',
        (colour) => {
          const node = mark(colour);
          expect(node.name).toBe('mark');
          expect(node.attributes).toEqual([]);
        }
      );
    });
  }
);
