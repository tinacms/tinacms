import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import {
  LexicalPhrasingContentSchemaType,
  LexicalRootSchema,
  LexicalRootSchemaType,
  LexicalStaticPhrasingContentSchemaType,
  LexicalTopLevelContentSchemaType,
} from './validator'
import type * as M from 'mdast'
import { stringifyMDX } from '@tinacms/mdx'

export const exportToMarkdownAst = (
  json: SerializedEditorState<SerializedLexicalNode>
) => {
  console.log(json.root)
  const result = LexicalRootSchema.safeParse(json.root)
  if (result.success) {
    console.log(result)
    const tree = root(result.data)
    const string = stringifyMDX(tree)
    console.log(string)
  } else {
    console.log(result.error)
  }
}
const staticPhrasingContent = (
  node: LexicalStaticPhrasingContentSchemaType
): M.StaticPhrasingContent => {
  switch (node.type) {
    case 'linebreak': {
      return { type: 'break' }
    }
    case 'text': {
      return { type: 'text', value: node.text }
    }
  }
}

const phrasingContent = (
  node: LexicalPhrasingContentSchemaType
): M.PhrasingContent => {
  switch (node.type) {
    case 'text': {
      return { type: 'text', value: node.text }
    }
    case 'linebreak': {
      return { type: 'break' }
    }
    case 'link': {
      const link: M.Link = {
        type: 'link',
        url: node.url,
        children: node.children.map((child) => staticPhrasingContent(child)),
      }
      return link
    }
    default: {
      // @ts-expect-error
      console.warn(`Nothing for ${node.type}`)
      return { type: 'text', value: '' }
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
