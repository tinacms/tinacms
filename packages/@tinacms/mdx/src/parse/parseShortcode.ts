/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import { Template } from '../../../schema-tools/src'
import { replaceAll } from '.'

export function parseShortcode(
  preprocessedString: string,
  template: Template<false> & { inline?: boolean }
) {
  const match = template.match!

  const unkeyedAttributes = !!template.fields.find((t) => t.name == 'text')

  const hasChildren = !!template.fields.find((t) => t.name == 'children')

  const replacement = `<${template.name} ${
    unkeyedAttributes ? 'text="$1"' : '$1'
  }>${hasChildren ? '$2' : '\n'}</${template.name}>`

  const endRegex = `((?:.|\\n)*)${match.start}\\s\/\\s*${
    match.name || template.name
  }[\\s]*${match.end}`

  const regex = `${match.start}\\s*${match.name || template.name}[\\s]+${
    unkeyedAttributes ? '[\'"]?(.*?)[\'"]?' : '(.*?)'
  }[\\s]*${match.end}${hasChildren ? endRegex : ''}`

  return replaceAll(preprocessedString, regex, replacement)
}
