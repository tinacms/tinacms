/**

Copyright 2019 Forestry.io Inc

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

import { Token } from './types'
import { Schema } from 'prosemirror-model'

const RELREF_LINK_REGEX = /\[(.+)\]\((\{\{\<\srelref ".*"\s>\}\}\))/g

export const createHugoLinks = (state: any, tok: Token, schema: Schema) => {
  let match
  let start = 0
  const { link } = schema.marks
  const text = tok.content
  while ((match = RELREF_LINK_REGEX.exec(text)) !== null) {
    state.addText(text.substr(start, match.index))
    state.openMark(link.create({ href: match[2] }))
    state.addText(match[1])
    state.closeMark(link)
    start = match.index + match[0].length
  }
  if (start < text.length) state.addText(text.substr(start, text.length))
}
