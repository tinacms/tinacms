import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'
import { mdxJsx } from '../shortcodes'
import { mdxJsxFromMarkdown } from '../shortcodes/mdast'
import * as acorn from 'acorn'
import type { RichTypeInner, Template } from '@tinacms/schema-tools'
import type { Options } from '../shortcodes'
import { getFieldPatterns } from '../util'

export const fromMarkdown = (value: string, field: RichTypeInner) => {
  const patterns = getFieldPatterns(field)
  const acornDefault = acorn as unknown as Options['acorn']
  const tree = mdastFromMarkdown(value, {
    extensions: [mdxJsx({ acorn: acornDefault, patterns, addResult: true })],
    mdastExtensions: [mdxJsxFromMarkdown()],
  })

  return tree
}

type RichTextTemplate = Template<false> & { inline?: boolean }
