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

import { Node } from 'prosemirror-model'
import { getAttrsWith, docAttrs, domAttrs } from './utils'

export const heading = {
  attrs: {
    level: { default: 1 },
    class: { default: '' },
    id: { default: '' },
  },
  content: 'inline*',
  marks: '_',
  group: 'block',
  defining: true,
  parseDOM: [
    { tag: 'h1', getAttrs: getAttrsWith({ level: 1 }) },
    { tag: 'h2', getAttrs: getAttrsWith({ level: 2 }) },
    { tag: 'h3', getAttrs: getAttrsWith({ level: 3 }) },
    { tag: 'h4', getAttrs: getAttrsWith({ level: 4 }) },
    { tag: 'h5', getAttrs: getAttrsWith({ level: 5 }) },
    { tag: 'h6', getAttrs: getAttrsWith({ level: 6 }) },
  ],
  toDocument(node: Node) {
    const { level, ...other } = node.attrs
    return ['h' + level, docAttrs(other), 0]
  },
  toDOM(node: Node) {
    const { level, ...other } = node.attrs
    return ['h' + level, domAttrs(other), 0]
  },
}
