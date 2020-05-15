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

export const image = {
  inline: true,
  attrs: {
    src: {},
    align: { default: null },
    alt: { default: null },
    title: { default: null },
    width: { default: null },
    height: { default: null },
  },
  group: 'inline',
  draggable: true,
  allowGapCursor: true,
  parseDOM: [
    {
      tag: 'img[src]',
      getAttrs(dom: HTMLElement) {
        return {
          src: dom.getAttribute('src'),
          title: dom.getAttribute('title'),
          alt: dom.getAttribute('alt'),
          align: getAlignFromDOM(dom),
          width: dom.getAttribute('width'),
          height: dom.getAttribute('height'),
        }
      },
    },
  ],
  toDOM(node: Node) {
    const attrs: any = {
      src: node.attrs.src,
    }

    if (node.attrs.title) attrs.title = node.attrs.title
    if (node.attrs.alt) attrs.alt = node.attrs.alt
    if (node.attrs.width) attrs.width = node.attrs.width
    if (node.attrs.height) attrs.height = node.attrs.height
    if (node.attrs.align) attrs['class'] = `align-${node.attrs.align}`

    return ['img', attrs]
  },
}

const alignRegex = /align-([a-z]*)/

export function getAlignFromDOM(image: HTMLElement) {
  const className = image.getAttribute('class') || ''

  const match = alignRegex.exec(className)

  if (match && match.length > 1) {
    return match[1]
  }

  return null
}
