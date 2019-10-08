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
import { SchemaMarkPlugin } from '../..'

/**
 * Link
 */
const link = {
  attrs: {
    href: {},
    title: { default: null as any },
    editing: { default: null as any },
    creating: { default: null as any },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs(dom: HTMLElement) {
        return {
          href: dom.getAttribute('href'),
          title: dom.getAttribute('title'),
          // Internal Use Only
          editing: dom.getAttribute('editing'),
          creating: dom.getAttribute('creating'),
        }
      },
    },
  ],
  toDOM(node: Node) {
    return ['a', node.attrs]
  },
  toDocument(node: Node) {
    const { editing, creating, ...attrs } = node.attrs
    return ['a', attrs]
  },
}

export default {
  __type: 'wysiwyg:schema:mark',
  name: 'link',
  mark: link,
} as SchemaMarkPlugin
