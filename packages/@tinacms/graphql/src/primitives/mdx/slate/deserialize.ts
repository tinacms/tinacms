export interface NodeTypes {
  paragraph: string
  block_quote: string
  code_block: string
  link: string
  image: string
  ul_list: string
  ol_list: string
  listItem: string
  heading: {
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
  }
  emphasis_mark: string
  strong_mark: string
  delete_mark: string
  inline_code_mark: string
  thematic_break: string
}

export type SlateNodeType =
  | {
      type: 'heading_one'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_two'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_three'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_four'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_five'
      children: SlateNodeType[]
    }
  | {
      type: 'heading_six'
      children: SlateNodeType[]
    }
  | {
      type: 'paragraph'
      children: SlateNodeType[]
    }
  | {
      children: SlateNodeType[]
      link: string
      type: 'link'
    }
  | {
      type: 'block_quote'
      children: SlateNodeType[]
    }
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'mdxJsxTextElement'
      props: object
      children: SlateNodeType[]
      name: string
    }
  | {
      type: 'mdxJsxFlowElement'
      props: object
      children: SlateNodeType[]
      name: string
    }
//   paragraph: 'paragraph',
//   block_quote: 'block_quote',
//   code_block: 'code_block',
//   link: 'link',
//   ul_list: 'ul_list',
//   ol_list: 'ol_list',
//   listItem: 'list_item',
//   heading: {
//     1: 'heading_one',
//     2: 'heading_two',
//     3: 'heading_three',
//     4: 'heading_four',
//     5: 'heading_five',
//     6: 'heading_six',
//   },
//   emphasis_mark: 'italic',
//   strong_mark: 'bold',
//   delete_mark: 'strikeThrough',
//   inline_code_mark: 'code',
//   thematic_break: 'thematic_break',
//   image: 'image',
// }

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export interface OptionType {
  nodeTypes?: RecursivePartial<NodeTypes>
  linkDestinationKey?: string
  imageSourceKey?: string
  imageCaptionKey?: string
}

import type { Content } from 'mdast'

export interface MdastNode {
  type?: string
  ordered?: boolean
  value?: string
  text?: string
  children?: Array<MdastNode>
  depth?: 1 | 2 | 3 | 4 | 5 | 6
  url?: string
  alt?: string
  lang?: string
  // mdast metadata
  position?: any
  spread?: any
  checked?: any
  indent?: any
}

type MdxJsxFlowElement = {
  type: 'mdxJsxFlowElement'
  name: string
  attributes: object
  children: MdxAstNode[]
}

type MdxJsxTextElement = {
  type: 'mdxJsxTextElement'
  name: string
  attributes: object
  children: MdxAstNode[]
}

type MdxAstNode = Content | MdxJsxFlowElement | MdxJsxTextElement

export const defaultNodeTypes: NodeTypes = {
  paragraph: 'paragraph',
  block_quote: 'block_quote',
  code_block: 'code_block',
  link: 'link',
  ul_list: 'ul_list',
  ol_list: 'ol_list',
  listItem: 'list_item',
  heading: {
    1: 'heading_one',
    2: 'heading_two',
    3: 'heading_three',
    4: 'heading_four',
    5: 'heading_five',
    6: 'heading_six',
  },
  emphasis_mark: 'italic',
  strong_mark: 'bold',
  delete_mark: 'strikeThrough',
  inline_code_mark: 'code',
  thematic_break: 'thematic_break',
  image: 'image',
}

export default function deserialize(node: MdxAstNode) {
  const types = {
    ...defaultNodeTypes,
    heading: {
      ...defaultNodeTypes.heading,
    },
  }

  switch (node.type) {
    case 'heading':
      return {
        type: types.heading[node.depth || 1],
        children: node.children.map(deserialize),
      }
    case 'list':
      return {
        type: node.ordered ? types.ol_list : types.ul_list,
        children: node.children.map(deserialize),
      }
    case 'listItem':
      return { type: types.listItem, children: node.children.map(deserialize) }
    case 'paragraph':
      return { type: types.paragraph, children: node.children.map(deserialize) }
    case 'link':
      return {
        type: types.link,
        link: node.url,
        children: node.children.map(deserialize),
      }
    case 'image':
      return {
        type: types.image,
        children: [{ type: 'text', text: '' }],
        link: node.url,
        caption: node.alt,
      }
    case 'blockquote':
      return {
        type: types.block_quote,
        children: node.children.map(deserialize),
      }
    case 'code':
      return {
        type: types.code_block,
        language: node.lang,
        children: [{ text: node.value }],
      }

    // case 'html':
    //   if (node.value?.includes('<br>')) {
    //     return {
    //       break: true,
    //       type: types.paragraph,
    //       children: [{ text: node.value?.replace(/<br>/g, '') || '' }],
    //     }
    //   }
    //   return { type: 'paragraph', children: [{ text: node.value || '' }] }

    case 'emphasis':
      return {
        [types.emphasis_mark]: true,
        ...forceLeafNode(node.children),
        ...persistLeafFormats(node.children),
      }
    case 'strong':
      return {
        [types.strong_mark]: true,
        ...forceLeafNode(node.children),
        ...persistLeafFormats(node.children),
      }
    case 'delete':
      return {
        [types.delete_mark]: true,
        ...forceLeafNode(node.children),
        ...persistLeafFormats(node.children),
      }
    case 'inlineCode':
      return {
        [types.inline_code_mark]: true,
        text: node.value,
      }
    case 'thematicBreak':
      return {
        type: types.thematic_break,
        children: [{ type: 'text', text: '' }],
      }
    case 'text':
      return { type: 'text', text: node.value || '' }
    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement':
      return {
        ...node,
        children: undefined,
      }
    default:
      console.log('unknown', node)
      return { type: 'text', text: '' }
  }
}

const forceLeafNode = (children: Array<MdxAstNode>) => ({
  type: 'text',
  text: children
    .map((k) => {
      switch (k.type) {
        case 'text':
          return k.value || ''
        default:
          throw new Error(`Not sure, this should be flattened to the same node`)
      }
    })
    .join(''),
})

// This function is will take any unknown keys, and bring them up a level
// allowing leaf nodes to have many different formats at once
// for example, bold and italic on the same node
function persistLeafFormats(children: Array<MdxAstNode>) {
  return children.reduce((acc, node) => {
    Object.keys(node).forEach(function (key) {
      if (key === 'children' || key === 'type' || key === 'text') return

      // @ts-ignore
      acc[key] = node[key]
    })

    return acc
  }, {})
}
