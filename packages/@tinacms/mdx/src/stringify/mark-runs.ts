/**
 * Helpers shared by the MDX (`./marks`) and markdown (`../next/stringify/marks`)
 * serializers for grouping adjacent marked text nodes into one element.
 */

import type * as Md from 'mdast';
import type { MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import type * as Plate from '../parse/plate';
import { isSafeCssColor } from '../sanitize-css-color';
import { type Marks, getMarks, isTextElement } from './index';

export type InlineElementWithCallback = Plate.InlineElement & {
  linkifyTextNode?: (arg: Md.Text) => Md.Link;
};

type ColorMark = Extract<Marks, 'highlight' | 'textColor'>;

/**
 * Whether `node` carries `mark` exactly as `first` does. Colour marks only
 * match when their colours do, so differently coloured neighbours get their
 * own elements.
 */
const hasSameMark = (
  node: Plate.InlineElement,
  mark: Marks,
  first: Plate.TextElement
) => {
  if (!isTextElement(node) || !getMarks(node).includes(mark)) {
    return false;
  }
  if (mark === 'highlight') {
    return (
      node.highlightColor === first.highlightColor &&
      node.textColor === first.textColor
    );
  }
  if (mark === 'textColor') {
    return node.textColor === first.textColor;
  }
  return true;
};

/**
 * Number of leading nodes in `content` that share `mark` with the first. A
 * colour run carries on across a line break, since splitting it would put the
 * next `<mark>`/`<span>` at the start of a line, where the break is dropped.
 */
const markRunLength = (
  content: Plate.InlineElement[],
  mark: Marks,
  first: Plate.TextElement
) => {
  let length = 0;
  while (length < content.length) {
    const node = content[length];
    const next = content[length + 1];
    if (node && hasSameMark(node, mark, first)) {
      length++;
    } else if (
      node?.type === 'break' &&
      isColorMark(mark) &&
      next &&
      hasSameMark(next, mark, first)
    ) {
      length += 2;
    } else {
      break;
    }
  }
  return length;
};

const isColorMark = (mark: Marks): mark is ColorMark =>
  mark === 'highlight' || mark === 'textColor';

/** The colour mark (`<mark>` or `<span>`) a node would be wrapped in, if any. */
const colorMarkOf = (node: Plate.InlineElement | undefined) =>
  node ? getMarks(node).find(isColorMark) : undefined;

/**
 * Whether `node` is written as bare text with a letter or digit at `edge`.
 * Marked neighbours start/end with a delimiter or tag, which is punctuation.
 */
const touchesWordChar = (
  node: InlineElementWithCallback | undefined,
  edge: 'start' | 'end'
) =>
  !!node &&
  isTextElement(node) &&
  !node.linkifyTextNode &&
  getMarks(node).length === 0 &&
  (edge === 'start' ? /^[\p{L}\p{N}]/u : /[\p{L}\p{N}]$/u).test(node.text);

/**
 * Number of leading nodes that are plain inline code and so must share one
 * code span, since back-to-back spans would merge on the next parse. Nodes
 * differing only in marks markdown can't write (e.g. underline) end up here.
 */
const codeRunLength = (content: InlineElementWithCallback[]) => {
  const isPlainCode = (node: InlineElementWithCallback | undefined) =>
    !!node && !node.linkifyTextNode && getMarks(node).join() === 'inlineCode';
  if (content[0]?.linkifyTextNode) {
    return 1;
  }
  const end = content.findIndex((node) => !isPlainCode(node));
  return end === -1 ? content.length : end;
};

/**
 * Picks which of `first`'s marks becomes the outermost element: the one
 * shared by the longest run of leading nodes, ties going to the earliest mark
 * in `getMarks` order. Only that run is wrapped, so neighbours without the
 * mark are never pulled into it. Inline code can't hold children, so it is
 * only picked once no other mark is left.
 *
 * `**`, `*` and `~~` only open or close beside a letter when the other side
 * isn't punctuation, and a colour element's `<`/`>` is. So `x**<span>a</span>**`
 * or `**a<span>b</span>**y` would lose their bold on the next parse. When a
 * word character (`previous` / the node after the run) touches such an edge,
 * the colour element is moved outside the delimiters instead:
 * `x**a**<span>**b**</span>y`.
 */
export const pickMarkToProcess = (
  content: InlineElementWithCallback[],
  first: Plate.TextElement,
  previous?: InlineElementWithCallback
): { markToProcess: Marks | null; runLength: number } => {
  const marks = getMarks(first);
  let markToProcess: Marks | null = null;
  let runLength = 0;
  for (const mark of marks) {
    if (mark === 'inlineCode') {
      continue;
    }
    const length = markRunLength(content, mark, first);
    if (length > runLength) {
      runLength = length;
      markToProcess = mark;
    }
  }
  if (!markToProcess) {
    return marks.includes('inlineCode')
      ? { markToProcess: 'inlineCode', runLength: codeRunLength(content) }
      : { markToProcess, runLength };
  }
  if (isColorMark(markToProcess)) {
    return { markToProcess, runLength };
  }
  const firstColor = colorMarkOf(first);
  const colorRun = firstColor && {
    markToProcess: firstColor,
    runLength: markRunLength(content, firstColor, first),
  };
  if (colorRun && touchesWordChar(previous, 'end')) {
    return colorRun;
  }
  if (touchesWordChar(content[runLength], 'start')) {
    while (runLength > 0 && colorMarkOf(content[runLength - 1])) {
      runLength--;
    }
    if (runLength === 0 && colorRun) {
      return colorRun;
    }
  }
  return { markToProcess, runLength };
};

/** The CSS a colour mark carries, as `[property, value]` pairs. Unsafe colours are dropped. */
const colorMarkStyle = (node: Plate.TextElement, mark: ColorMark) => {
  const style: ['background-color' | 'color', string][] = [];
  if (
    mark === 'highlight' &&
    node.highlightColor &&
    isSafeCssColor(node.highlightColor)
  ) {
    style.push(['background-color', node.highlightColor]);
  }
  if (node.textColor && isSafeCssColor(node.textColor)) {
    style.push(['color', node.textColor]);
  }
  return style;
};

/**
 * MDX form: wraps children in `<mark>` (highlight, optionally with a text
 * colour) or `<span>` (text colour alone), styled with
 * `style={{ backgroundColor, color }}`.
 */
export const colorMarkElement = (
  first: Plate.TextElement,
  mark: ColorMark,
  children: Md.PhrasingContent[]
): MdxJsxTextElement => {
  const style = colorMarkStyle(first, mark).map(
    ([property, value]) =>
      // JSON.stringify is a no-op for grammar-approved colours, but keeps the
      // JSX expression well-formed if the grammar is ever loosened.
      `${property === 'color' ? 'color' : 'backgroundColor'}: ${JSON.stringify(value)}`
  );
  return {
    type: 'mdxJsxTextElement',
    name: mark === 'highlight' ? 'mark' : 'span',
    attributes: style.length
      ? [
          {
            type: 'mdxJsxAttribute',
            name: 'style',
            value: {
              type: 'mdxJsxAttributeValueExpression',
              value: `{ ${style.join(', ')} }`,
            },
          },
        ]
      : [],
    children,
  };
};

/**
 * Markdown form: plain HTML tags around the children, since markdown has no
 * JSX (`<span style="color: #CC4141">…</span>`).
 */
export const colorMarkHtml = (
  first: Plate.TextElement,
  mark: ColorMark,
  children: Md.PhrasingContent[]
): Md.PhrasingContent[] => {
  const name = mark === 'highlight' ? 'mark' : 'span';
  const style = colorMarkStyle(first, mark)
    .map(([property, value]) => `${property}: ${value}`)
    .join('; ');
  return [
    { type: 'html', value: style ? `<${name} style="${style}">` : `<${name}>` },
    ...children,
    { type: 'html', value: `</${name}>` },
  ];
};

/** The Plate properties each mark is stored under. */
const markProperties: Record<Marks, string[]> = {
  textColor: ['textColor'],
  strong: ['bold'],
  emphasis: ['italic'],
  inlineCode: ['code'],
  delete: ['strikethrough'],
  highlight: ['highlight', 'highlightColor', 'textColor'],
};

/** Copies `node` without `mark`, ready to be serialized inside that mark's element. */
export const cleanNode = (
  node: InlineElementWithCallback,
  mark: Marks | null
): Plate.InlineElement => {
  if (!mark) {
    return node;
  }
  const cleanedNode: Record<string, unknown> = {};
  const propertiesToClear = markProperties[mark];
  Object.entries(node).map(([key, value]) => {
    if (!propertiesToClear.includes(key)) {
      cleanedNode[key] = value;
    }
  });
  if (node.linkifyTextNode) {
    cleanedNode.callback = node.linkifyTextNode;
  }
  return cleanedNode as Plate.InlineElement;
};
