import { stringifyMDX } from './stringify'

// export * from './parse/plate'

// export { parseMDX }
export { stringifyMDX }

import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import type { SlateElementType, SlateRootType } from './parser'

export const parseMDX = (value: string) => {
  return fromMarkdown(value, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  })
}

export type { SlateRootType, SlateElementType }
export * from './parser/types'
