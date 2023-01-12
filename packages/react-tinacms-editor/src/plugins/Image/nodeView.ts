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
import { EditorView, NodeView } from 'prosemirror-view'
import { ImageProps } from '../../types'

const Identity = (str: string) => str

export class ImageView implements NodeView {
  node: Node
  view: EditorView
  // @ts-ignore
  dom?: HTMLElement
  img?: HTMLImageElement

  constructor(
    node: Node,
    view: EditorView,
    private previewSrc: ImageProps['previewSrc'] = Identity
  ) {
    this.node = node
    this.view = view

    this.dom = document.createElement('span')
    this.dom.classList.add('tinacms-image-wrapper')
    this.img = document.createElement('img')
    const { src, align, alt, title, width, height } = node.attrs
    this.updateImgSrc(src)
    if (height) this.img.style.height = height
    if (width) this.img.style.width = width
    if (align) this.img.classList.add(`align-${align}`)
    if (alt) this.img.alt = alt
    if (title) this.img.title = title
    this.dom.appendChild(this.img)
  }
  async updateImgSrc(src: string) {
    if (!this.img) return
    try {
      this.img.src = await this.previewSrc!(src)
    } catch {
      this.img.src = src
    }
  }

  update(node: Node) {
    if (this.img) {
      const { alt, title } = node.attrs
      if (alt) this.img.alt = alt
      if (title) this.img.title = title
    }
    return true
  }

  selectNode = () => {
    if (this.img) {
      this.img.style.outline = '4px solid #0084FF'
      this.img.classList.add('tina-selected-image')
    }
  }

  deselectNode = () => {
    if (this.img) {
      this.img.style.outline = ''
      this.img.classList.remove('tina-selected-image')
    }
  }

  destroy = () => {
    this.deselectNode()
  }
}
