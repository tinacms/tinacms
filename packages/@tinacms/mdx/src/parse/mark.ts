import type * as Plate from './plate';
import type { PhrasingContent } from 'mdast';
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

export const parseMarkMdxText = <
  TChild extends PhrasingContent = PhrasingContent,
>(
  content: MdxJsxTextElement & { children?: TChild[] },
  extraMarks: Record<string, boolean | string> = {},
  parseChild?: (child: TChild) => Plate.InlineElement | Plate.InlineElement[]
): Plate.InlineElement[] | null => {
  if (content.name !== 'mark') {
    return null;
  }

  const highlightColor = getHighlightColorFromAttributes(content.attributes);
  const markProps = {
    highlight: true,
    ...(highlightColor ? { highlightColor } : {}),
    ...extraMarks,
  };

  return (content.children || []).flatMap((child) => {
    if (parseChild) {
      return applyMarksToInlineElements(parseChild(child as TChild), markProps);
    }

    if (child.type === 'text') {
      return [
        {
          type: 'text' as const,
          text: child.value,
          ...markProps,
        },
      ];
    }

    return [];
  });
};

const applyMarksToInlineElements = (
  elements: Plate.InlineElement | Plate.InlineElement[],
  marks: Record<string, boolean | string>
): Plate.InlineElement[] => {
  const items = Array.isArray(elements) ? elements : [elements];

  return items.map((item) => {
    if (item.type === 'text') {
      return {
        ...item,
        ...marks,
      };
    }

    if (item.type === 'a') {
      return {
        ...item,
        children: applyMarksToInlineElements(item.children, marks),
      };
    }

    return item;
  });
};
