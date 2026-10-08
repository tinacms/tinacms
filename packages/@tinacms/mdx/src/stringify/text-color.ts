import type * as Md from 'mdast';
import type * as Plate from '../parse/plate';
import { isSafeCssColor } from '../sanitize-css-color';
import { type Marks, getMarks } from './index';

const safeTextColor = ({ textColor }: Plate.TextElement) =>
  textColor && isSafeCssColor(textColor) ? textColor : undefined;

/**
 * Wraps a leaf in its colour, leaving edge whitespace outside so a
 * surrounding `**`, `*` or `~~` can still move it out of the delimiters.
 */
const wrapColor = (
  content: Plate.TextElement,
  node: Md.PhrasingContent,
  wrap: (color: string, node: Md.PhrasingContent) => Md.PhrasingContent[]
): Md.PhrasingContent[] => {
  const color = safeTextColor(content);
  if (!color) {
    return [node];
  }
  if (node.type !== 'text') {
    return wrap(color, node);
  }
  const [, lead = '', core = '', trail = ''] =
    /^(\s*)([\s\S]*?)(\s*)$/.exec(node.value) ?? [];
  if (!core) {
    return [node];
  }
  return [
    ...(lead ? [{ type: 'text' as const, value: lead }] : []),
    ...wrap(color, { type: 'text', value: core }),
    ...(trail ? [{ type: 'text' as const, value: trail }] : []),
  ];
};

/**
 * MDX form of a text colour, always the innermost element:
 * `<span style={{ color: "#CC4141" }}>text</span>`.
 */
export const textColorElement = (
  content: Plate.TextElement,
  node: Md.PhrasingContent
): Md.PhrasingContent[] =>
  wrapColor(content, node, (color, child) => [
    {
      type: 'mdxJsxTextElement',
      name: 'span',
      attributes: [
        {
          type: 'mdxJsxAttribute',
          name: 'style',
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: `{ color: ${JSON.stringify(color)} }`,
          },
        },
      ],
      children: [child],
    },
  ]);

/** Markdown form, as raw HTML: `<span style="color: #CC4141">text</span>`. */
export const textColorHtml = (
  content: Plate.TextElement,
  node: Md.PhrasingContent
): Md.PhrasingContent[] =>
  wrapColor(content, node, (color, child) => [
    { type: 'html', value: `<span style="color: ${color}">` },
    child,
    { type: 'html', value: '</span>' },
  ]);

/**
 * Picks the mark to write outermost: the one shared by the longest run of
 * leading nodes, ties going to the earliest in `getMarks` order. Only that
 * run is wrapped, so neighbours without the mark never gain it.
 */
export const longestMarkRun = <M extends Marks>(
  content: Plate.InlineElement[],
  marks: M[]
) => {
  let markToProcess: M | undefined;
  let runLength = 0;
  for (const mark of marks) {
    const end = content.findIndex((node) => !getMarks(node).includes(mark));
    const length = end === -1 ? content.length : end;
    if (length > runLength) {
      markToProcess = mark;
      runLength = length;
    }
  }
  return { markToProcess, runLength };
};
