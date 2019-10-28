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
import { SchemaNodePlugin } from '../..'

/**
 * Ordered List
 */
export const ordered_list = {
  content: 'list_item+',
  group: 'block',
  attrs: { order: { default: 1 }, tight: { default: false } },
  parseDOM: [
    {
      tag: 'ol',
      getAttrs(dom: Element) {
        return {
          order: dom.hasAttribute('start') ? +(dom.getAttribute('start') || 0) : 1,
          tight: dom.hasAttribute('data-tight'),
        }
      },
    },
  ],
  toDOM(node: Node) {
    return [
      'ol',
      {
        start: node.attrs.order == 1 ? null : node.attrs.order,
        'data-tight': node.attrs.tight ? 'true' : null,
      },
      0,
    ]
  },
}

export default {
  __type: 'wysiwyg:schema:node',
  name: 'ordered_list',
  node: ordered_list,
} as SchemaNodePlugin
