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

import { Template } from '@tinacms/schema-tools'
import { replaceAll } from '../parse'

export function stringifyShortcode(
  preprocessedString: string,
  template: Template<false> & { inline?: boolean }
) {
  const match = template.match!
  const unkeyedAttributes = !!template.fields.find((t) => t.name == 'text')
  const regex = `<[\\s]*${template.name}[\\s]*${
    unkeyedAttributes ? '(?:text=(.*?))?' : '(.+?)?'
  }[\\s]*>[\\s]*((?:.|\n)*?)[\\s]*<\/[\\s]*${template.name}[\\s]*>`

  const closingRegex = `\n$2\n${match.start} /${match.name || template.name} ${
    match.end
  }`
  const replace = `${match.start} ${match.name || template.name} $1 ${
    match.end
  }${template.fields.find((t) => t.name == 'children') ? closingRegex : ''}`
  return replaceAll(preprocessedString, regex, replace)
}
