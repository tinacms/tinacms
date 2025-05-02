
import type { Context, Md, Plate } from '../types';
import { html_inline } from './html_inline.handler';
import { textHandler } from './text.handler';

export const phrasingContent = (
  content: Md.PhrasingContent,
  context: Context
): Plate.InlineElement | Plate.InlineElement[] => {
  switch (content.type) {
    case 'text':
      return textHandler(content);
    case 'delete':
    case 'emphasis':
    case 'strong':
    case 'inlineCode':
      return phrasingMarkHandler(content, context);
    case 'link':
      return linkHandler(content, context);
    case 'image':
      return imageHandler(content, context);
    case 'break':
      return breakHandler();
    case 'html':
      return html_inline(content);
    case 'mdxJsxTextElement':
      return mdxHandler(content, context);
    // @ts-ignore
    case 'mdxTextExpression':
      throw new Error(`Unexpected expression: ${content.value}`);
    default:
      throw new Error(`PhrasingContent: ${content.type} is not yet supported`);
  }
};

