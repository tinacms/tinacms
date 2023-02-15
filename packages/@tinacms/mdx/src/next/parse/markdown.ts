import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'
import { mdxJsx } from '../shortcodes'
import { mdxJsxFromMarkdown } from '../shortcodes/mdast'
import * as acorn from 'acorn'
import type { RichTypeInner, Template } from '@tinacms/schema-tools'
import type { Options, Pattern } from '../shortcodes'
import { visit } from 'unist-util-visit'

export const fromMarkdown = (value: string, field: RichTypeInner) => {
  // const patterns = [{ start: '{{<', end: '>}}', type: 'flow', leaf: true }]
  const patterns: Pattern[] = []
  const templates: RichTextTemplate[] = []
  hoistAllTemplates(field, templates)
  templates?.forEach((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates not supported')
    }
    if (template.match) {
      patterns.push({
        start: template.match.start,
        end: template.match.end,
        name: template.match.name || template.name,
        type: template.inline ? 'inline' : 'flow',
        leaf: !template.fields.some((f) => f.name === 'children'),
      })
    }
  })
  const acornDefault = acorn as unknown as Options['acorn']
  const tree = mdastFromMarkdown(value, {
    extensions: [mdxJsx({ acorn: acornDefault, patterns, addResult: true })],
    mdastExtensions: [mdxJsxFromMarkdown()],
  })

  // console.dir(tree, { depth: null })
  // visit(tree, 'mdxJsxFlowElement', (node) => {
  //   console.log(node)
  // })
  return tree
}

// Since the markdown parser doesn't care where in the string
// of markdown we are, it's not possible (or at least, not easy)
// to know whether a node is nested inside a parent field without
// making multiple passes at it. Instead, just treat all templates
// as top-level.
const hoistAllTemplates = (
  field: RichTypeInner,
  templates: RichTextTemplate[] = []
) => {
  field.templates?.forEach((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates not supported')
    }
    templates.push(template)
    template.fields.forEach((field) => {
      if (field.type === 'rich-text') {
        hoistAllTemplates(field, templates)
      }
    })
  })
  return templates
}

type RichTextTemplate = Template<false> & { inline?: boolean }
