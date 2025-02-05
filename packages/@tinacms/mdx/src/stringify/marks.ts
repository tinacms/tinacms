/**



*/

import { getMarks } from './index'
import type * as Md from 'mdast'
import type * as Plate from '../parse/plate'
import type { RichTextType } from '@tinacms/schema-tools'
import { stringifyPropsInline } from './acorn'

const matches = (a: string[], b: string[]) => {
  return a.some((v) => b.includes(v))
}

type InlineElementWithCallback = Plate.InlineElement & {
  linkifyTextNode?: (arg: Md.Text) => Md.Link
}

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
  const newItems: InlineElementWithCallback[] = []
  content?.forEach((item) => {
    if (item.type === 'a') {
      if (item.children.length === 1) {
        const firstChild = item.children[0]
        if (firstChild?.type === 'text') {
          newItems.push({
            ...firstChild,
            linkifyTextNode: (a) => {
              return {
                type: 'link',
                url: item.url,
                title: item.title,
                children: [a],
              }
            },
          })
        } else {
          newItems.push(item)
        }
      } else {
        newItems.push(item)
      }
    } else {
      newItems.push(item)
    }
  })
  return newItems
}

/**
 * Links should be processed via 'linkifyTextNode', otherwise handle phrasing content
 */
const inlineElementExceptLink = (
  content: InlineElementWithCallback,
  field: RichTextType,
  imageCallback: (url: string) => string
): Md.PhrasingContent[] => {
  switch (content.type) {
    case 'a':
      throw new Error(
        `Unexpected node of type "a", link elements should be processed after all inline elements have resolved`
      )
    case 'img':
      return [
        {
          type: 'image',
          url: imageCallback(content.url),
          alt: content.alt,
          title: content.caption,
        },
      ]
    case 'break':
      return [
        {
          type: 'break',
        },
      ]
    case 'mdxJsxTextElement': {
      const { attributes, children } = stringifyPropsInline(
        content,
        field,
        imageCallback
      )
      return [
        {
          type: 'mdxJsxTextElement',
          name: content.name,
          attributes,
          children,
        },
      ]
    }
    case 'html_inline': {
      return [
        {
          type: 'html',
          value: content.value,
        },
      ]
    }
    default:
      // @ts-expect-error type is 'never'
      if (!content.type && typeof content.text === 'string') {
        // It's possible that a node's `type` value is stripped out
        // While that is a bug that should be fixed, we can handle it
        // by assuming it's a text node and processing it as such
        const contentAsObject = content as { text: string }
        const nodes = eat(
          [{ type: 'text', ...contentAsObject }],
          field,
          imageCallback
        )

        if (nodes.length > 0) {
          return nodes
        } else {
          return [text(content)]
        }
      }
      throw new Error(`InlineElement: ${content.type} is not supported`)
  }
}

const text = (content: { text: string }) => {
  return {
    type: 'text' as const,
    value: content.text,
  }
}

export const eat = (
  c: InlineElementWithCallback[],
  field: RichTextType,
  imageCallback: (url: string) => string
): Md.PhrasingContent[] => {
  const content = replaceLinksWithTextNodes(c)
  const first = content[0]
  if (!first) {
    return []
  }
  if (first && first?.type !== 'text') {
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
      ]
    }
    // non-text nodes can't be merged. Eg. img, break. So process them and move on to the rest
    const nodes = inlineElementExceptLink(first, field, imageCallback)
    return [...nodes, ...eat(content.slice(1), field, imageCallback)]
  }
  const marks = getMarks(first)

  if (marks.length === 0) {
    if (first.linkifyTextNode) {
      return [
        first.linkifyTextNode(text(first)),
        ...eat(content.slice(1), field, imageCallback),
      ]
    } else {
      const rest = content.slice(1)

      const restNodes = eat(rest, field, imageCallback)

      const res = [text(first), ...restNodes]
      return res
    }
  }
  let nonMatchingSiblingIndex: number = 0
  if (
    content.slice(1).every((content, index) => {
      if (matches(marks, getMarks(content))) {
        return true
      } else {
        nonMatchingSiblingIndex = index
        return false
      }
    })
  ) {
    // Every sibling matches, so capture all of them in this node
    nonMatchingSiblingIndex = content.length - 1
  }
  const matchingSiblings = content.slice(1, nonMatchingSiblingIndex + 1)
  const markCounts: { [key in 'strong' | 'emphasis' | 'inlineCode']?: number } =
    {}
  marks.forEach((mark) => {
    let count = 1
    matchingSiblings.every((sibling, index) => {
      if (getMarks(sibling).includes(mark)) {
        count = index + 1
        return true
      }
    })
    markCounts[mark] = count
  })
  let count = 0
  let markToProcess: 'strong' | 'emphasis' | 'inlineCode' | null = null
  Object.entries(markCounts).forEach(([mark, markCount]) => {
    const m = mark as 'strong' | 'emphasis' | 'inlineCode'
    if (markCount > count) {
      count = markCount
      markToProcess = m
    }
  })
  if (!markToProcess) {
    return [text(first), ...eat(content.slice(1), field, imageCallback)]
  }
  if (markToProcess === 'inlineCode') {
    if (nonMatchingSiblingIndex) {
      throw new Error(`Marks inside inline code are not supported`)
    }
    const node = {
      type: markToProcess,
      value: first.text,
    }
    return [
      first.linkifyTextNode?.(node) ?? node,
      ...eat(content.slice(nonMatchingSiblingIndex + 1), field, imageCallback),
    ]
  }

  const children = eat(
    [
      ...[first, ...matchingSiblings].map((sibling) =>
        cleanNode(sibling, markToProcess)
      ),
    ],
    field,
    imageCallback
  )

  const firstChild = children[0]
  const lastChild = children[children.length - 1]
  const beginSpaces = { type: 'text' as const, value: '' }
  const endSpaces = { type: 'text' as const, value: '' }
  /**
   * If the last child is a text node and ends with a space, we need to split it into two nodes
   * because the the stringify logic doesn't understand that `*hello *world` should be `*hello* world`
   */
  if (firstChild?.type === 'text') {
    const firstSpaceIndex = firstChild.value.search(/\S/)
    if (firstSpaceIndex !== -1) {
      const text = firstChild.value.slice(firstSpaceIndex)
      beginSpaces.value = firstChild.value.slice(0, firstSpaceIndex)
      firstChild.value = text
    }
  }
  if (lastChild?.type === 'text') {
    const lastCharacter = lastChild.value.slice(-1)
    if (lastCharacter === ' ') {
      function lastNonSpaceIndex(str: string) {
        const trimmedLength = str.trimEnd().length
        return trimmedLength > 0 ? trimmedLength - 1 : -1
      }
      const indexOfLastNonSpace = lastNonSpaceIndex(lastChild.value)
      const text = lastChild.value.slice(0, indexOfLastNonSpace + 1)
      endSpaces.value = lastChild.value.slice(indexOfLastNonSpace + 1)
      lastChild.value = text
    }
  }

  const nextChildren = eat(
    content.slice(nonMatchingSiblingIndex + 1),
    field,
    imageCallback
  )

  const phrasingContent: Md.PhrasingContent[] = [
    {
      type: markToProcess,
      children,
    },
  ]
  if (beginSpaces.value.length > 0) {
    phrasingContent.unshift(beginSpaces)
  }
  phrasingContent.push(endSpaces)
  if (nextChildren.length > 0) {
    phrasingContent.push(...nextChildren)
  }
  return phrasingContent
}
const cleanNode = (
  node: InlineElementWithCallback,
  mark: 'strong' | 'emphasis' | 'inlineCode' | null
): Plate.InlineElement => {
  if (!mark) {
    return node
  }
  const cleanedNode: Record<string, unknown> = {}
  const markToClear = {
    strong: 'bold',
    emphasis: 'italic',
    inlineCode: 'code',
  }[mark]
  Object.entries(node).map(([key, value]) => {
    if (key !== markToClear) {
      cleanedNode[key] = value
    }
  })
  if (node.linkifyTextNode) {
    cleanedNode.callback = node.linkifyTextNode
  }
  return cleanedNode as Plate.InlineElement
}
