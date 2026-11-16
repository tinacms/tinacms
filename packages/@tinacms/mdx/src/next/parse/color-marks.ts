import type { HTML as Html } from 'mdast';
import type { MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import type { Node, Parent } from 'unist';
import { getColorMarks } from '../../parse/mark';

const OPEN_TAG = /^<(span)(?:\s+style=(?:"([^"]*)"|'([^']*)'))?\s*>$/i;

const isHtml = (node: Node | undefined): node is Html => node?.type === 'html';

const isParent = (node: Node): node is Parent =>
  Array.isArray((node as Partial<Parent>).children);

/** Turns an opening `<span style="…">` html tag into a JSX element we'd parse as a text colour. */
const openColorMark = (html: Html): MdxJsxTextElement | null => {
  const match = OPEN_TAG.exec(html.value.trim());
  if (!match) {
    return null;
  }
  const [, name = '', double, single] = match;
  const style = double ?? single;
  const element: MdxJsxTextElement = {
    type: 'mdxJsxTextElement',
    name: name.toLowerCase(),
    attributes:
      style === undefined
        ? []
        : [{ type: 'mdxJsxAttribute', name: 'style', value: style }],
    children: [],
  };
  return getColorMarks(element) ? element : null;
};

/** Index of the html node closing the tag opened at `start`, or -1. */
const findClosingTag = (siblings: Node[], start: number, name: string) => {
  let depth = 0;
  for (let index = start; index < siblings.length; index++) {
    const sibling = siblings[index];
    if (!isHtml(sibling)) {
      continue;
    }
    const value = sibling.value.trim().toLowerCase();
    if (new RegExp(`^<${name}[\\s>]`).test(value)) {
      depth++;
    } else if (value === `</${name}>`) {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
};

/** Parents whose children are inline, where an html open/close pair can be one element. */
const PHRASING_PARENTS = new Set([
  'paragraph',
  'heading',
  'emphasis',
  'strong',
  'delete',
  'link',
  'tableCell',
]);

/** Folds text colour tag pairs among phrasing `siblings` into JSX elements. */
const foldSiblings = (siblings: Node[]): Node[] => {
  const folded: Node[] = [];
  for (let index = 0; index < siblings.length; index++) {
    const sibling = siblings[index];
    if (!sibling) {
      continue;
    }
    const element = isHtml(sibling) ? openColorMark(sibling) : null;
    const close = element
      ? findClosingTag(siblings, index, element.name ?? '')
      : -1;
    if (element && close !== -1) {
      element.children = foldSiblings(
        siblings.slice(index + 1, close)
      ) as MdxJsxTextElement['children'];
      folded.push(element);
      index = close;
      continue;
    }
    folded.push(sibling);
  }
  return folded;
};

/**
 * Markdown has no JSX, so text colour is written as HTML
 * (`<span style="color: …">…</span>`) and arrives here as separate
 * opening/closing `html` nodes. Folds each matched
 * pair (siblings inside the same inline parent) into a JSX element so it
 * parses into marks just like the MDX form. Tags at block level, and tags we
 * wouldn't claim, are left as raw HTML.
 */
export const foldColorMarkHtml = <T extends Node>(node: T): T => {
  if (isParent(node)) {
    if (PHRASING_PARENTS.has(node.type)) {
      node.children = foldSiblings(node.children);
    }
    node.children.forEach(foldColorMarkHtml);
  }
  return node;
};
