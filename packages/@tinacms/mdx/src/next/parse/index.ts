import { RichTypeInner } from '@tinacms/schema-tools'
import { fromMarkdown } from './markdown'
import { fromMarkdown as fromMDX } from './mdx'

export const parseMDX = (
  value: string,
  field: RichTypeInner,
  imageCallback?: (s: string) => string
) => {
  if (field.parser?.type === 'markdown') {
    return fromMarkdown(value, field)
  }
  return fromMDX(value, field)
}
