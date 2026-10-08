import type { RichTextField } from '@tinacms/schema-tools';
import type * as Md from 'mdast';
import type * as Plate from '../../parse/plate';
import { getMarks } from '../../stringify';
import { stringifyPropsInline } from './acorn';
import { longestMarkRun, textColorHtml } from '../../stringify/text-color';

type InlineElementWithCallback = Plate.InlineElement & {
  linkifyTextNode?: (arg: Md.Text) => Md.Link;
};

/**
 *
 * Links can contain marks inside them, and in the scenario that there is a link with a single
 * child with a mark on it, we want to possibly merge those marks with adjacent ones:
 * ```markdown
 * *Hello [world](https://example.com)*
 * ```
 * Without "flattening" text nodes like this, this shape:
 * ```js
 * [
 *   {
 *      type: 'text',
 *      text: 'Hello',
 *      italic: true
 *    },
 *    {
 *      type: 'link',
 *      url: 'https://example.com',
 *      children: [{
 *        type: 'text',
 *        text: 'world',
 *        italic: true
 *      }]
 *    }
 *  ]
 * ```
 * Would result in this markdown:
 * ```markdown
 * *Hello **[world](https://example.com)*
 * ```
 * So instead we place a callback on the text node, treat is any other text node,
 * and at the end we replace it with it's callback value (inside cleanNodes)
 */
const replaceLinksWithTextNodes = (content: Plate.InlineElement[]) => {
  const newItems: InlineElementWithCallback[] = [];
  content?.forEach((item) => {
    if (item.type === 'a') {
      if (item.children.length === 1) {
        const firstChild = item.children[0];
        if (firstChild?.type === 'text') {
          newItems.push({
            ...firstChild,
            linkifyTextNode: (a) => {
              return {
                type: 'link',
                url: item.url,
                title: item.title,
                children: [a],
              };
            },
          });
        } else {
          newItems.push(item);
        }
      } else {
        newItems.push(item);
      }
    } else {
      newItems.push(item);
    }
  });
  return newItems;
};

/**
 * Links should be processed via 'linkifyTextNode', otherwise handle phrasing content
 */
const inlineElementExceptLink = (
  content: InlineElementWithCallback,
  field: RichTextField,
  imageCallback: (url: string) => string
): Md.PhrasingContent => {
  switch (content.type) {
    case 'a':
      throw new Error(
        `Unexpected node of type "a", link elements should be processed after all inline elements have resolved`
      );
    case 'img':
      return {
        type: 'image',
        url: imageCallback(content.url),
        alt: content.alt,
        title: content.caption,
      };
    case 'break':
      return {
        type: 'break',
      };
    case 'mdxJsxTextElement': {
      const { attributes, children } = stringifyPropsInline(
        content,
        field,
        imageCallback
      );
      let c = children;
      if (children.length) {
        const firstChild = children[0];
        // @ts-ignore FIXME: we're going outside of the MDAST type, which can include a paragraph here
        if (firstChild && firstChild.type === 'paragraph') {
          // @ts-ignore
          c = firstChild.children;
        }
      }
      return {
        type: 'mdxJsxTextElement',
        name: content.name,
        attributes,
        children: c,
      };
    }
    case 'html_inline': {
      return {
        type: 'html',
        value: content.value,
      };
    }
    default:
      // @ts-ignore type is 'never'
      if (!content.type && typeof content.text === 'string') {
        return text(content);
      }
      throw new Error(
        `This content can't be saved as markdown ("${content.type}"). Remove it from the field to continue.`
      );
  }
};

const text = (content: { text: string }) => {
  return {
    type: 'text' as const,
    value: content.text,
  };
};

const markAttributes = (content: Plate.TextElement) => {
  if (!content.highlightColor) {
    return [];
  }

  return [
    {
      type: 'mdxJsxAttribute' as const,
      name: 'style',
      value: {
        type: 'mdxJsxAttributeValueExpression' as const,
        value: `{ backgroundColor: "${content.highlightColor}" }`,
      },
    },
  ];
};

export const eat = (
  c: InlineElementWithCallback[],
  field: RichTextField,
  imageCallback: (url: string) => string
): Md.PhrasingContent[] => {
  const content = replaceLinksWithTextNodes(c);
  const first = content[0];
  if (!first) {
    return [];
  }
  const firstIsText =
    first.type === 'text' ||
    (!first.type && typeof (first as any).text === 'string');
  if (first && !firstIsText) {
    if (first.type === 'a') {
      return [
        {
          type: 'link',
          url: first.url,
          title: first.title,
          children: eat(
            first.children,
            field,
            imageCallback
          ) as Md.StaticPhrasingContent[],
        },
        ...eat(content.slice(1), field, imageCallback),
      ];
    }
    // non-text nodes can't be merged. Eg. img, break. So process them and move on to the rest
    return [
      inlineElementExceptLink(first, field, imageCallback),
      ...eat(content.slice(1), field, imageCallback),
    ];
  }
  const textNode = first as Plate.TextElement & InlineElementWithCallback;
  const { markToProcess, runLength } = longestMarkRun(
    content,
    getMarks(textNode)
  );
  if (!markToProcess) {
    return [
      ...leaf(textNode, text(textNode)),
      ...eat(content.slice(1), field, imageCallback),
    ];
  }
  if (markToProcess === 'highlight') {
    if (runLength > 1) {
      throw new Error(
        "Highlighted text can't have other formatting on it. Remove the formatting from the highlighted text."
      );
    }
    return [
      {
        type: 'mdxJsxTextElement',
        name: 'mark',
        attributes: markAttributes(textNode),
        children: leaf(textNode, text(textNode)),
      } as unknown as Md.PhrasingContent,
      ...eat(content.slice(1), field, imageCallback),
    ];
  }
  if (markToProcess === 'inlineCode') {
    if (runLength > 1) {
      throw new Error(
        "Inline code can't have other formatting on it. Remove the formatting from the code text."
      );
    }
    return [
      ...leaf(textNode, { type: 'inlineCode', value: textNode.text }),
      ...eat(content.slice(1), field, imageCallback),
    ];
  }

  return [
    {
      type: markToProcess,
      children: eat(
        content
          .slice(0, runLength)
          .map((sibling) => cleanNode(sibling, markToProcess)),
        field,
        imageCallback
      ),
    },
    ...eat(content.slice(runLength), field, imageCallback),
  ];
};

/** A text leaf, wrapped in its text colour and then its link, if any. */
const leaf = (
  first: Plate.TextElement & InlineElementWithCallback,
  node: Md.PhrasingContent
): Md.PhrasingContent[] => {
  const children = textColorHtml(first, node);
  return first.linkifyTextNode
    ? [
        {
          ...first.linkifyTextNode({ type: 'text', value: '' }),
          children: children as Md.Link['children'],
        },
      ]
    : children;
};

const cleanNode = (
  node: InlineElementWithCallback,
  mark: 'strong' | 'emphasis' | 'inlineCode' | 'delete' | 'highlight' | null
): Plate.InlineElement => {
  if (!mark) {
    return node;
  }
  const cleanedNode: Record<string, unknown> = {};
  const markToClear = {
    strong: 'bold',
    emphasis: 'italic',
    inlineCode: 'code',
    delete: 'strikethrough',
    highlight: 'highlight',
  }[mark];
  Object.entries(node).map(([key, value]) => {
    if (key !== markToClear) {
      cleanedNode[key] = value;
    }
  });
  if (node.linkifyTextNode) {
    cleanedNode.callback = node.linkifyTextNode;
  }
  return cleanedNode as Plate.InlineElement;
};
