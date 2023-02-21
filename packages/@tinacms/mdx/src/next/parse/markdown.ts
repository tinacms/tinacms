import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'
import { mdxJsx } from '../shortcodes'
import { mdxJsxFromMarkdown } from '../shortcodes/mdast'
import { getFieldPatterns } from '../util'
import * as acorn from 'acorn'
import type { RichTypeInner, Template } from '@tinacms/schema-tools'
import type { Options } from '../shortcodes'

export const fromMarkdown = (value: string, field: RichTypeInner) => {
  const patterns = getFieldPatterns(field)
  const acornDefault = acorn as unknown as Options['acorn']
  const tree = mdastFromMarkdown(value, {
    extensions: [mdxJsx({ acorn: acornDefault, patterns, addResult: true })],
    mdastExtensions: [mdxJsxFromMarkdown({ patterns })],
  })

  return tree
}
