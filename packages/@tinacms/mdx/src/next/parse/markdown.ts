import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'
import { mdxJsx } from '../shortcodes'
import { mdxJsxFromMarkdown } from '../shortcodes/mdast'
import * as acorn from 'acorn'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type { Options, Pattern } from '../shortcodes'

export const fromMarkdown = (value: string, field: RichTypeInner) => {
  // const patterns = [{ start: '{{<', end: '>}}', type: 'flow', leaf: true }]
  const patterns: Pattern[] = []
  field.templates?.forEach((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates not supported')
    }
    if (template.match) {
      patterns.push({
        start: template.match.start,
        end: template.match.end,
        name: template.name,
        leaf: !template.fields.some((f) => f.name === 'children'),
      })
    }
  })
  const acornDefault = acorn as unknown as Options['acorn']
  return mdastFromMarkdown(value, {
    extensions: [mdxJsx({ acorn: acornDefault, patterns, addResult: true })],
    mdastExtensions: [mdxJsxFromMarkdown()],
  })
}
