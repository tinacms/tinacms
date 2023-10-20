import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'
import { mdxJsx } from '../shortcodes'
import { mdxJsxFromMarkdown } from '../shortcodes/mdast'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { getFieldPatterns } from '../util'
import * as acorn from 'acorn'
import type { RichTextField, Template } from '@tinacms/schema-tools'
import type { Options } from '../shortcodes'

export const fromMarkdown = (value: string, field: RichTextField) => {
  const patterns = getFieldPatterns(field)
  const acornDefault = acorn as unknown as Options['acorn']
  const skipHTML = false
  // if (field.parser?.type === 'markdown') {
  //   if (['all', 'html'].includes(field.parser?.skipEscaping || '')) {
  //     skipHTML = true
  //   }
  // }
  const tree = mdastFromMarkdown(value, {
    extensions: [
      gfm(),
      mdxJsx({ acorn: acornDefault, patterns, addResult: true, skipHTML }),
    ],
    mdastExtensions: [gfmFromMarkdown(), mdxJsxFromMarkdown({ patterns })],
  })

  return tree
}
