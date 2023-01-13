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

import { Node } from 'prosemirror-model'

export const anchor = {
  attrs: {
    name: {},
    id: { default: null as any },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[name]',
      getAttrs(dom: HTMLElement) {
        return {
          // href: dom.getAttribute('href'),
          name: dom.getAttribute('name'),
          id: dom.getAttribute('id'),
        }
      },
    },
  ],
  toDOM(node: Node) {
    const { attrs } = node
    // @ts-ignore
    attrs.style = `color: red;`
    return ['a', attrs]
  },
  toDocument(node: Node) {
    return ['a', node.attrs]
  },
}
