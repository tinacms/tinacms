/**



*/

import { RichTextTemplate } from '@tinacms/schema-tools'
import { replaceAll } from '.'

export function parseShortcode(
  preprocessedString: string,
  template: RichTextTemplate
) {
  const match = template.match!

  const unkeyedAttributes = !!template.fields.find((t) => t.name === '_value')

  const hasChildren = !!template.fields.find((t) => t.name == 'children')

  const replacement = `<${template.name} ${
    unkeyedAttributes ? '_value="$1"' : '$1'
  }>${hasChildren ? '$2' : '\n'}</${template.name}>`

  const endRegex = `((?:.|\\n)*)${match.start}\\s\/\\s*${
    match.name || template.name
  }[\\s]*${match.end}`

  const regex = `${match.start}\\s*${match.name || template.name}[\\s]+${
    unkeyedAttributes ? '[\'"]?(.*?)[\'"]?' : '(.*?)'
  }[\\s]*${match.end}${hasChildren ? endRegex : ''}`

  return replaceAll(preprocessedString, regex, replacement)
}
