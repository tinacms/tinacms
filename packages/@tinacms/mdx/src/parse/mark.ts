import type * as Plate from './plate';
import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxTextElement,
} from 'mdast-util-mdx-jsx';

export const getHighlightColorFromAttributes = (
  attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[] = []
) => {
  const styleAttribute = attributes.find(
    (attribute) =>
      attribute.type === 'mdxJsxAttribute' && attribute.name === 'style'
  );

  if (!styleAttribute || typeof styleAttribute.value !== 'string') {
    return undefined;
  }

  const backgroundColorMatch = /background-color:\s*([^;]+)/i.exec(
    styleAttribute.value
  );

  return backgroundColorMatch?.[1]?.trim();
};

export const parseMarkMdxText = (
  content: MdxJsxTextElement,
  extraMarks: Record<string, boolean> = {}
): Plate.InlineElement[] | null => {
  if (content.name !== 'mark') {
    return null;
  }

  const highlightColor = getHighlightColorFromAttributes(content.attributes);

  return (content.children || []).flatMap((child) => {
    if (child.type === 'text') {
      return [
        {
          type: 'text' as const,
          text: child.value,
          highlight: true,
          highlightColor,
          ...extraMarks,
        },
      ];
    }
    return [];
  });
};
