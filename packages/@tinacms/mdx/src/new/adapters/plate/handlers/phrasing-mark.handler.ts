import { flatten } from 'es-toolkit';
import type { Context, Md, Plate } from '../types';
import { imageHandler } from './image.handler';
import { sanitizeUrl } from '../../../utils/sanitize-url';
import { MarkTypes } from '../types/plate-types';
import { w } from 'vitest/dist/types-198fd1d9';

type MarkHandler = (
  node: Md.PhrasingContent,
  context: Context,
  marks: MarkTypes[]
) => Plate.InlineElement[];

const markHandlers: Record<Md.PhrasingContent['type'], MarkHandler> = {
  emphasis: (node, context, marks) =>
    flatten(
      node.children.map((child) =>
        phrasingMarkHandler(child, context, [...marks, 'italic'])
      )
    ),

  inlineCode: (node, context, marks) => {
    const markProps: Record<string, boolean> = {};
    marks.forEach((mark) => (markProps[mark] = true));
    return [
      {
        type: 'text',
        text: node.value,
        code: true,
        ...markProps,
      },
    ];
  },

  delete: (node, context, marks) =>
    flatten(
      node.children.map((child) =>
        phrasingMarkHandler(child, context, [...marks, 'strikethrough'])
      )
    ),

  strong: (node, context, marks) =>
    flatten(
      node.children.map((child) =>
        phrasingMarkHandler(child, context, [...marks, 'bold'])
      )
    ),

  image: (node, context) => [imageHandler(node as Md.Image, context)],

  link: (node, context, marks) => {
    const children = flatten(
      node.children.map((child) => phrasingMarkHandler(child, context, marks))
    );
    return [
      {
        type: 'a',
        url: sanitizeUrl((node as Md.Link).url),
        title: (node as Md.Link).title,
        children,
      },
    ];
  },

  text: (node, context, marks) => {
    const markProps: Record<string, boolean> = {};
    marks.forEach((mark) => (markProps[mark] = true));
    return [
      {
        type: 'text',
        text: (node as Md.Text).value,
        ...markProps,
      },
    ];
  },

  break: () => [breakHandler()],
};

export const phrasingMarkHandler = (
  node: Md.PhrasingContent,
  context: Context,
  marks: ('strikethrough' | 'bold' | 'italic' | 'code')[] = []
): Plate.InlineElement[] => {
  const handler = markHandlers[node.type];
  if (!handler) {
    throw new Error(`Unexpected inline element of type ${node.type}`);
  }
  return handler(node, context, marks);
};

