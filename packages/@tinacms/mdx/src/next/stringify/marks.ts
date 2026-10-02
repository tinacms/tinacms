import type { RichTextField } from '@tinacms/schema-tools';
import type * as Md from 'mdast';
import type * as Plate from '../../parse/plate';
import { isTextElement } from '../../stringify';
import { stringifyPropsInline } from './acorn';
import {
  cleanNode,
  colorMarkHtml,
  type InlineElementWithCallback,
  pickMarkToProcess,
} from '../../stringify/mark-runs';

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

/**
 * Serializes inline nodes, grouping neighbours that share a mark.
 * `previous` is the sibling just written as bare text, if any; see `pickMarkToProcess`.
 */
export const eat = (
  c: InlineElementWithCallback[],
  field: RichTextField,
  imageCallback: (url: string) => string,
  previous?: InlineElementWithCallback
): Md.PhrasingContent[] => {
  const content = replaceLinksWithTextNodes(c);
  const first = content[0];
  if (!first) {
    return [];
  }
  if (!isTextElement(first)) {
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
  const { markToProcess, runLength } = pickMarkToProcess(
    content,
    first,
    previous
  );
  if (!markToProcess) {
    const node = text({ text: first.text });
    return [
      first.linkifyTextNode?.(node) ?? node,
      ...eat(content.slice(1), field, imageCallback, first),
    ];
  }
  const rest = eat(content.slice(runLength), field, imageCallback);
  if (markToProcess === 'inlineCode') {
    if (runLength > 1) {
      throw new Error(
        "Inline code can't have other formatting on it. Remove the formatting from the code text."
      );
    }
    const node = {
      type: markToProcess,
      value: first.text,
    };
    return [
      // @ts-ignore
      first.linkifyTextNode?.(node) ?? node,
      ...rest,
    ];
  }
  // Everything in the run shares this mark, so serialize it once around them
  const children = eat(
    content.slice(0, runLength).map((node) => cleanNode(node, markToProcess)),
    field,
    imageCallback
  );
  if (markToProcess === 'highlight' || markToProcess === 'textColor') {
    return [...colorMarkHtml(first, markToProcess, children), ...rest];
  }
  return [
    {
      type: markToProcess,
      children,
    },
    ...rest,
  ];
};
