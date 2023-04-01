import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import {
  LexicalPhrasingContentSchemaType,
  LexicalRootSchema,
  LexicalRootSchemaType,
  LexicalStaticPhrasingContentSchemaType,
  LexicalTextSchemaType,
  LexicalTopLevelContentSchemaType,
} from './validator'
import type * as M from 'mdast'

export const exportToMarkdownAst = (
  json: SerializedEditorState<SerializedLexicalNode>
): M.Root | undefined => {
  const result = LexicalRootSchema.safeParse(json.root)
  if (result.success) {
    const tree = root(result.data)
    return tree
  } else {
    console.log(result.error)
    return undefined
  }
}

const textNode = (node: LexicalTextSchemaType): M.Text => {
  return { type: 'text', value: node.text }
}
/**
 * FIXME: this is a pretty rough first attempt at serializing these,
 * probably a few ways to tackle this, but this doesn't do well
 * when formatting cross over link elements
 */
const wrapText = (node: LexicalTextSchemaType): M.StaticPhrasingContent => {
  // 0 default
  // 1 strong
  // 2 emphasis
  // 3 strong + emphasis
  // 4 strikethrough
  // 5 strikethrough + strong
  // 6 strikethrough + emphasis
  // 7 strikethrough + strong + emphasis
  switch (node.format) {
    case 0: {
      return textNode(node)
    }
    case 1: {
      return { type: 'strong', children: [textNode(node)] }
    }
    case 2: {
      return {
        type: 'emphasis',
        children: [textNode(node)],
      }
    }
    case 3: {
      return {
        type: 'strong',
        children: [{ type: 'emphasis', children: [textNode(node)] }],
      }
    }
    case 4: {
      return {
        type: 'delete',
        children: [textNode(node)],
      }
    }
    case 5: {
      return {
        type: 'delete',
        children: [{ type: 'strong', children: [textNode(node)] }],
      }
    }
    case 6: {
      return {
        type: 'delete',
        children: [{ type: 'emphasis', children: [textNode(node)] }],
      }
    }
    case 7: {
      return {
        type: 'delete',
        children: [
          {
            type: 'strong',
            children: [{ type: 'emphasis', children: [textNode(node)] }],
          },
        ],
      }
    }
  }
  return textNode(node)
}

const staticPhrasingContent = (
  node: LexicalStaticPhrasingContentSchemaType
): M.StaticPhrasingContent => {
  switch (node.type) {
    case 'linebreak': {
      return { type: 'break' }
    }
    case 'text': {
      return wrapText(node)
    }
  }
}

const phrasingContent = (
  node: LexicalPhrasingContentSchemaType
): M.PhrasingContent => {
  switch (node.type) {
    case 'link': {
      const link: M.Link = {
        type: 'link',
        url: node.url,
        children: node.children.map((child) => staticPhrasingContent(child)),
      }
      return link
    }
    default: {
      return staticPhrasingContent(node)
    }
  }
}

const blockContent = (
  node: LexicalTopLevelContentSchemaType
): M.BlockContent => {
  switch (node.type) {
    case 'code': {
      return {
        type: 'code',
        value: node.children
          .map((child) => {
            if (child.type === 'code-highlight') {
              return child.text
            }
            return '\n'
          })
          .join(''),
      }
    }
    case 'tina-paragraph': {
      return {
        type: 'paragraph',
        children: node.children.map((child) => phrasingContent(child)),
      }
    }
    case 'horizontalrule': {
      return { type: 'thematicBreak' }
    }
    case 'tina-quotenode': {
      return {
        type: 'blockquote',
        children: node.children.map((child) => blockContent(child)),
      }
    }
    case 'tina-heading': {
      const depthMap = {
        h1: 1,
        h2: 2,
        h3: 3,
        h4: 4,
        h5: 5,
        h6: 6,
      } as const
      return {
        type: 'heading',
        depth: depthMap[node.tag],
        children: node.children.map((child) => phrasingContent(child)),
      }
    }
    case 'list': {
      return {
        type: 'list',
        children: node.children.map((child) => {
          return {
            type: 'listItem',
            children: child.children.map((child) => blockContent(child)),
          }
        }),
      }
    }
    case 'table': {
      return {
        type: 'table',
        children: node.children.map((child) => {
          return {
            type: 'tableRow',
            children: child.children.map((subChild) => {
              return {
                type: 'tableCell',
                children: subChild.children.map((cellChild) =>
                  phrasingContent(cellChild)
                ),
              }
            }),
          }
        }),
      }
    }
    default: {
      // @ts-expect-error
      console.warn(`Nothing for ${node.type}`)
      return {
        type: 'paragraph',
        children: [{ type: 'text', value: '' }],
      }
    }
  }
}

const topLevelContent = (
  node: LexicalTopLevelContentSchemaType
): M.TopLevelContent => {
  return blockContent(node)
}

const root = (node: LexicalRootSchemaType): M.Root => ({
  type: 'root',
  children: node.children.map((child) => topLevelContent(child)),
})
