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

export const bullet_list = {
  content: 'list_item+',
  group: 'block',
  attrs: { tight: { default: false } },
  parseDOM: [
    {
      tag: 'ul',
      getAttrs: (dom: Element) => ({ tight: dom.hasAttribute('data-tight') }),
    },
  ],
  toDOM(node: Node) {
    return ['ul', { 'data-tight': node.attrs.tight ? 'true' : null }, 0]
  },
}
