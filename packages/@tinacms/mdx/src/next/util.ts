import type { RichTextField, RichTextTemplate } from '@tinacms/schema-tools'
import type { Pattern } from './shortcodes'

export const getFieldPatterns = (field: RichTextField) => {
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
        templateName: template.name,
        type: template.inline ? 'inline' : 'flow',
        leaf: !template.fields.some((f) => f.name === 'children'),
      })
    }
  })
  return patterns
}

// Since the markdown parser doesn't care where in the string
// of markdown we are, it's not possible (or at least, not easy)
// to know whether a node is nested inside a parent field without
// making multiple passes at it. Instead, just treat all templates
// as top-level.
const hoistAllTemplates = (
  field: RichTextField,
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
