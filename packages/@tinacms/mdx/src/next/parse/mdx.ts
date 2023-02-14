import { fromMarkdown as mdastFromMarkdown } from 'mdast-util-from-markdown'
import type { RichTypeInner } from '@tinacms/schema-tools'

export const fromMarkdown = (value: string, field: RichTypeInner) => {
  return mdastFromMarkdown(value, {
    // extensions: [tinaDirective(patterns)],
    // mdastExtensions: [directiveFromMarkdown],
  })
}
