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
import { EditorView, NodeView } from 'prosemirror-view'

export class ImageView implements NodeView {
  node: Node
  view: EditorView
  getPos: () => number
  dom?: HTMLElement
  img?: HTMLImageElement

  constructor(node: Node, view: EditorView, getPos: () => number) {
    this.node = node
    this.view = view
    this.getPos = getPos

    this.dom = document.createElement('span')
    this.dom.classList.add('tinacms-image-wrapper')
    this.img = document.createElement('img')
    const { src, align, alt, title, width, height } = node.attrs
    this.img.src = src
    if (height) this.img.style.height = height
    if (width) this.img.style.width = width
    if (align) this.img.classList.add(`align-${align}`)
    if (alt) this.img.alt = alt
    if (title) this.img.title = title
    this.dom.appendChild(this.img)
  }

  selectNode = () => {
    if (this.img) this.img.style.outline = '4px solid #0084FF'
  }

  deselectNode = () => {
    if (this.img) this.img.style.outline = ''
  }
}
