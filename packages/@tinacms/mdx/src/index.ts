// import { stringifyMDX } from './stringify'

// export * from './parse/plate'

// export { parseMDX }
// export { stringifyMDX }

import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown, gfmToMarkdown } from 'mdast-util-gfm'
import type { SlateElementType, SlateRootType } from './parser'
import { toMarkdown } from 'mdast-util-to-markdown'
import { Root } from 'mdast-util-from-markdown/lib'

export const parseMDX = (value: string) => {
  return fromMarkdown(value, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  })
}

export const stringifyMDX = (tree: Root) => {
  return toMarkdown(tree, {
    extensions: [gfmToMarkdown()],
  })
}

export type { SlateRootType, SlateElementType }
export * from './parser/types'
