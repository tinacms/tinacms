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
type ColorStyle = { backgroundColor?: string; color?: string };

/** Style keys (string and object forms) mapped to the colour they set. */
const COLOR_STYLE_KEYS: Record<string, keyof ColorStyle> = {
  color: 'color',
  'background-color': 'backgroundColor',
  backgroundColor: 'backgroundColor',
};

/** Adds one declaration to `style`, or returns false if it isn't a safe colour. */
const addColor = (style: ColorStyle, key: string, value: string) => {
  const property = COLOR_STYLE_KEYS[key];
  if (!property || !isSafeCssColor(value)) {
    return false;
  }
  style[property] = value;
  return true;
};

/** Reads `style="color: #CC4141; background-color: #FEF08A"`. */
const readStringStyle = (value: string): ColorStyle | null => {
  const style: ColorStyle = {};
  const declarations = value.split(';').filter((part) => part.trim());
  for (const declaration of declarations) {
    const [key = '', ...rest] = declaration.split(':');
    if (!addColor(style, key.trim().toLowerCase(), rest.join(':').trim())) {
      return null;
    }
  }
  return style;
};

/**
 * Reads `style={{ color: "#CC4141" }}` from its estree: only an object literal
 * whose properties are plain keys with string literal values qualifies, so
 * variables, spreads and expressions are never guessed at.
 */
const readExpressionStyle = (
  value: MdxJsxAttributeValueExpression
): ColorStyle | null => {
  const [statement, ...others] = value.data?.estree?.body ?? [];
  if (
    others.length ||
    statement?.type !== 'ExpressionStatement' ||
    statement.expression.type !== 'ObjectExpression'
  ) {
    return null;
  }
  const style: ColorStyle = {};
  for (const property of statement.expression.properties) {
    if (
      property.type !== 'Property' ||
      property.computed ||
      property.kind !== 'init' ||
      property.value.type !== 'Literal' ||
      typeof property.value.value !== 'string'
    ) {
      return null;
    }
    const key =
      property.key.type === 'Identifier'
        ? property.key.name
        : property.key.type === 'Literal'
          ? String(property.key.value)
          : '';
    if (!addColor(style, key, property.value.value)) {
      return null;
    }
  }
  return style;
};

/**
 * The colours in an element's `style`: `{}` when it has none, null when the
 * style holds anything but safe `color` / `background-color` values (which
 * means the element must stay raw so nothing is lost).
 */
const readColorStyle = (
  // Missing on shortcode elements, whose attributes post-processing turns into props
  attributes: JsxAttribute[] = []
): ColorStyle | null => {
  const styleAttribute = attributes.find(
    (attribute): attribute is MdxJsxAttribute =>
      attribute.type === 'mdxJsxAttribute' && attribute.name === 'style'
  );
  const value = styleAttribute?.value;
  if (value === null || value === undefined) {
    return {};
  }
  return typeof value === 'string'
    ? readStringStyle(value)
    : readExpressionStyle(value);
};

/**
 * The Plate marks a `<mark>` or colour `<span>` stands for, or null when the
 * element isn't one of ours. A `<span>` is only claimed when its sole
 * attribute is a style holding just `color`, so spans carrying anything else
 * (classes, other styles) keep round-tripping as raw HTML. Unsafe colours
 * (see `isSafeCssColor`) leave either element raw.
 */
export const getColorMarks = (
  content: MdxJsxTextElement
): ColorMarks | null => {
  if (content.name !== 'mark' && content.name !== 'span') {
    return null;
  }
  const style = readColorStyle(content.attributes);
  if (!style) {
    return null;
  }
  if (content.name === 'mark') {
    return {
      highlight: true,
      ...(style.backgroundColor
        ? { highlightColor: style.backgroundColor }
        : {}),
      ...(style.color ? { textColor: style.color } : {}),
    };
  }
  if (
    content.name === 'span' &&
    (content.attributes ?? []).length === 1 &&
    style.color &&
    !style.backgroundColor
  ) {
    return { textColor: style.color };
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
