import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'
import { mdxJsx } from '../shortcodes'
import { mdxJsxFromMarkdown } from '../shortcodes/mdast'
import { getFieldPatterns } from '../util'
import * as acorn from 'acorn'
import type { RichTextField, Template } from '@tinacms/schema-tools'
import type { Options } from '../shortcodes'

export const fromMarkdown = (value: string, field: RichTextField) => {
  const patterns = getFieldPatterns(field)
  const acornDefault = acorn as unknown as Options['acorn']
  let skipHTML = false
  if (field.parser?.type === 'markdown') {
    if (['all', 'html'].includes(field.parser?.skipEscaping || '')) {
      skipHTML = true
    }
  }
  const tree = mdastFromMarkdown(value, {
    extensions: [
      mdxJsx({ acorn: acornDefault, patterns, addResult: true, skipHTML }),
    ],
    mdastExtensions: [mdxJsxFromMarkdown({ patterns })],
  })

  return tree
}
