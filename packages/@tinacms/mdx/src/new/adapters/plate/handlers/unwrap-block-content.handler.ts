import type { Context, Md, Plate } from '../types';
import { flattenPhrasingContent } from './flatten-phrasing-content.handler';
import { html_inline } from './html_inline.handler';

export const unwrapBlockContent = (
  content: Md.BlockContent | Md.DefinitionContent,
  context: Context
): Plate.InlineElement[] => {
  switch (content.type) {
    case 'heading':
    case 'paragraph':
      return content.children.map((child) => flattenPhrasingContent(child, context));
    case 'html':
      return [html_inline(content)];
    default:
      throw new Error(`UnwrapBlock: Unknown block content of type ${content.type}`);
  }
};

