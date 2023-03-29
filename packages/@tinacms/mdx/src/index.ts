import { stringifyMDX } from './stringify'

export * from './parse/plate'

// export { parseMDX }
export { stringifyMDX }

import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { SlateRoot } from './parser'
import type { SlateElementType, SlateRootType } from './parser'

export const parseMDX = (value: string) => {
  const mdast = fromMarkdown(value, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  })

  const result = SlateRoot.safeParse(mdast)
  if (!result.success) {
    console.dir(result.error.format().children, { depth: 8 })
  } else {
    console.dir(result, { depth: null })
    return result.data
  }
}

export type { SlateRootType, SlateElementType }
