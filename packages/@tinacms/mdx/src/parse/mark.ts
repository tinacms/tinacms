import type { PhrasingContent } from 'mdast';
import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxExpressionAttribute,
  MdxJsxTextElement,
} from 'mdast-util-mdx-jsx';
import { isSafeCssColor } from '../sanitize-css-color';
import type * as Plate from './plate';

type JsxAttribute = MdxJsxAttribute | MdxJsxExpressionAttribute;

type ColorMarks = Pick<
  Plate.TextElement,
  'highlight' | 'highlightColor' | 'textColor'
>;

/** The colours a `style` may carry on a colour mark. */
type ColorStyle = { color?: string };

/**
 * The safe colours read from a `style`, and whether it held anything else
 * (other properties, unsafe colours, or values that aren't string literals).
 */
type ReadStyle = { colors: ColorStyle; extra: boolean };

const readDeclarations = (
  declarations: Iterable<[key: string, value: string | null]>
): ReadStyle => {
  const colors: ColorStyle = {};
  let extra = false;
  for (const [key, value] of declarations) {
    if (key === 'color' && value !== null && isSafeCssColor(value)) {
      colors.color = value;
    } else {
      extra = true;
    }
  }
  return { colors, extra };
};

/** Reads `style="color: #CC4141; background-color: #FEF08A"`. */
const readStringStyle = (value: string): ReadStyle =>
  readDeclarations(
    value
      .split(';')
      .filter((part) => part.trim())
      .map((declaration): [string, string] => {
        const [key = '', ...rest] = declaration.split(':');
        return [key.trim().toLowerCase(), rest.join(':').trim()];
      })
  );

/**
 * Reads `style={{ color: "#CC4141" }}` from its estree. Only plain keys with
 * string literal values count as colours, so variables, spreads and
 * expressions are never guessed at.
 */
const readExpressionStyle = (
  value: MdxJsxAttributeValueExpression
): ReadStyle => {
  const [statement, ...others] = value.data?.estree?.body ?? [];
  if (
    others.length ||
    statement?.type !== 'ExpressionStatement' ||
    statement.expression.type !== 'ObjectExpression'
  ) {
    return { colors: {}, extra: true };
  }
  return readDeclarations(
    statement.expression.properties.map((property): [string, string | null] => {
      if (
        property.type !== 'Property' ||
        property.computed ||
        property.kind !== 'init' ||
        property.value.type !== 'Literal' ||
        typeof property.value.value !== 'string'
      ) {
        return ['', null];
      }
      const key =
        property.key.type === 'Identifier'
          ? property.key.name
          : property.key.type === 'Literal'
            ? String(property.key.value)
            : '';
      return [key, property.value.value];
    })
  );
};

/** The colours in an element's `style`, and whether it held anything else. */
const readColorStyle = (
  // Missing on shortcode elements, whose attributes post-processing turns into props
  attributes: JsxAttribute[] = []
): ReadStyle => {
  const styleAttribute = attributes.find(
    (attribute): attribute is MdxJsxAttribute =>
      attribute.type === 'mdxJsxAttribute' && attribute.name === 'style'
  );
  const value = styleAttribute?.value;
  if (value === null || value === undefined) {
    return { colors: {}, extra: false };
  }
  return typeof value === 'string'
    ? readStringStyle(value)
    : readExpressionStyle(value);
};

export const getHighlightColorFromAttributes = (
  attributes: (MdxJsxAttribute | MdxJsxExpressionAttribute)[] = []
) => {
  const styleAttribute = attributes.find(
    (attribute) =>
      attribute.type === 'mdxJsxAttribute' && attribute.name === 'style'
  );

  if (!styleAttribute) {
    return undefined;
  }

  if (typeof styleAttribute.value === 'string') {
    const backgroundColorMatch = /background-color:\s*([^;]+)/i.exec(
      styleAttribute.value
    );
    return backgroundColorMatch?.[1]?.trim();
  }

  if (
    styleAttribute.value &&
    typeof styleAttribute.value === 'object' &&
    styleAttribute.value.type === 'mdxJsxAttributeValueExpression'
  ) {
    const expression = styleAttribute.value.value;
    const camelMatch =
      /['"]?backgroundColor['"]?\s*:\s*['"]?([^'",}\s]+)['"]?/.exec(expression);
    if (camelMatch?.[1]) {
      return camelMatch[1].trim();
    }
    const kebabMatch =
      /['"]?background-color['"]?\s*:\s*['"]?([^'",}\s]+)['"]?/.exec(
        expression
      );
    return kebabMatch?.[1]?.trim();
  }

  return undefined;
};

/**
 * The Plate marks a `<mark>` or text colour `<span>` stands for, or null when
 * the element isn't one of ours. A `<span>` is only claimed when its sole
 * attribute is a style holding just a safe `color`, so spans carrying
 * anything else keep round-tripping as raw HTML.
 */
export const getColorMarks = (
  content: MdxJsxTextElement
): ColorMarks | null => {
  if (content.name === 'mark') {
    const highlightColor = getHighlightColorFromAttributes(content.attributes);
    return { highlight: true, ...(highlightColor ? { highlightColor } : {}) };
  }
  const { colors, extra } = readColorStyle(content.attributes);
  if (
    content.name === 'span' &&
    !extra &&
    (content.attributes ?? []).length === 1 &&
    colors.color
  ) {
    return { textColor: colors.color };
  }
  return null;
};

/**
 * Converts `<mark>` (highlight) and `<span style={{ color }}>` (text colour)
 * into marked text nodes. Children are parsed with `parseChild`, so nested
 * bold/italic/etc. keep their marks. Returns null for any other element.
 */
export const parseMarkMdxText = <
  TChild extends PhrasingContent = PhrasingContent,
>(
  content: MdxJsxTextElement & { children?: TChild[] },
  extraMarks: Record<string, boolean> = {},
  parseChild?: (child: TChild) => Plate.InlineElement | Plate.InlineElement[]
): Plate.InlineElement[] | null => {
  const colorMarks = getColorMarks(content);
  if (!colorMarks) {
    return null;
  }

  const markProps = { ...colorMarks, ...extraMarks };

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

/** The colour marks `item` already carries. */
const innerColors = (item: Plate.TextElement): ColorMarks =>
  Object.fromEntries(
    (['highlightColor', 'textColor'] as const)
      .filter((key) => item[key] !== undefined)
      .map((key) => [key, item[key]])
  );

const applyMarksToInlineElements = (
  elements: Plate.InlineElement | Plate.InlineElement[],
  marks: ColorMarks & Record<string, boolean | string | undefined>
): Plate.InlineElement[] => {
  const items = Array.isArray(elements) ? elements : [elements];

  return items.map((item) => {
    if (item.type === 'text') {
      // Colours set by an inner element win over the outer one's
      return {
        ...item,
        ...marks,
        ...innerColors(item),
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
