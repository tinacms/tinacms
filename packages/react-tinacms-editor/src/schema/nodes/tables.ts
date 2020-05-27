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

import { tableNodes } from 'prosemirror-tables'
import { Node } from 'prosemirror-model'

const tables = tableNodes({
  tableGroup: 'block',
  cellContent: 'inline*',
  cellAttributes: {},
})

tables.table_cell = {
  ...tables.table_cell,
  marks: '_',
  attrs: { ...tables.table_cell.attrs, align: { default: null } },
  toDOM(node: Node) {
    const attrs: { style?: string } = {}
    if (node.attrs.align) {
      attrs.style = `text-align: ${node.attrs.align};`
    }
    return ['td', attrs, 0]
  },
} as any

tables.table_header = {
  ...tables.table_header,
  marks: '_',
  attrs: { ...tables.table_header.attrs, align: { default: null } },
  toDOM(node: Node) {
    const attrs: { style?: string } = {}
    if (node.attrs.align) {
      attrs.style = `text-align: ${node.attrs.align};`
    }
    return ['th', attrs, 0]
  },
} as any

export { tables }
