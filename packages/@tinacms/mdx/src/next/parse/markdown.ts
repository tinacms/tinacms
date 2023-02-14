import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'
import type { RichTypeInner } from '@tinacms/schema-tools'
import * as acorn from 'acorn'

import { mdxJsx } from '../shortcodes'
import type { Options } from '../shortcodes'
import { mdxJsxFromMarkdown } from '../shortcodes/mdast'

export const fromMarkdown = (value: string, field: RichTypeInner) => {
  const patterns = [{ start: '{{<', end: '>}}', type: 'flow', leaf: true }]
  const acornDefault = acorn as unknown as Options['acorn']
  return mdastFromMarkdown(value, {
    extensions: [mdxJsx({ acorn: acornDefault, patterns, addResult: true })],
    mdastExtensions: [mdxJsxFromMarkdown()],
  })
}
