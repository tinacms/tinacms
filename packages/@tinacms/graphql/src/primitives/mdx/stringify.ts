import { toMarkdown } from 'mdast-util-to-markdown'
import { mdxToMarkdown } from 'mdast-util-mdx'
import { stringify } from './slate/serialize'
import type { RichTypeInner } from '../types'

export const stringifyMDX = (value: unknown, field: RichTypeInner) => {
  // @ts-ignore: FIXME: validate this shape
  const slateTree: SlateNodeType[] = value.children
  try {
    const tree = slateTree.map((item) => stringify(item, field))
    const out = toMarkdown(
      {
        type: 'root',
        // @ts-ignore
        children: tree,
      },
      {
        extensions: [mdxToMarkdown],
      }
    )
    return out.replace(/&#x22;/g, `"`)
  } catch (e) {
    console.log(e)
  }
}
