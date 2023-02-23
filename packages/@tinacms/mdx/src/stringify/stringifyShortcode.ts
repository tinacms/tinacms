/**



*/

import { RichTextTemplate } from '@tinacms/schema-tools'
import { replaceAll } from '../parse'

export function stringifyShortcode(
  preprocessedString: string,
  template: RichTextTemplate
) {
  const match = template.match!
  const unkeyedAttributes = !!template.fields.find((t) => t.name == '_value')
  const regex = `<[\\s]*${template.name}[\\s]*${
    unkeyedAttributes ? '(?:_value=(.*?))?' : '(.+?)?'
  }[\\s]*>[\\s]*((?:.|\n)*?)[\\s]*<\/[\\s]*${template.name}[\\s]*>`

  const closingRegex = `\n$2\n${match.start} /${match.name || template.name} ${
    match.end
  }`
  const replace = `${match.start} ${match.name || template.name} $1 ${
    match.end
  }${template.fields.find((t) => t.name == 'children') ? closingRegex : ''}`
  return replaceAll(preprocessedString, regex, replace)
}
