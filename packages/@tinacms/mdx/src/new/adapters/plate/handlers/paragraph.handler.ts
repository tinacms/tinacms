import type { Context, Md, Plate } from '../types';
import flatten from 'lodash.flatten';
import { phrasingContent } from './phrasing-content.handler';

export const handleParagraph = (
  content: Md.Paragraph,
  context: Context
): Plate.ParagraphElement | Plate.HTMLElement => {
  const children = flatten(content.children.map((child) => phrasingContent(child, context)));

  // Handle inline HTML
  if (children.length === 1 && children[0]?.type === 'html_inline') {
    return {
      ...children[0],
      type: 'html',
    };
  }

  return {
    type: 'p',
    children,
  };
};

