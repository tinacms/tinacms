/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $getSelection,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'

import { $applyNodeReplacement, DecoratorNode } from 'lexical'
import * as React from 'react'
import { Suspense } from 'react'
const ImageComponent = React.lazy(
  // @ts-ignore
  () => import('./component')
)

export interface ImagePayload {
  altText?: string | null | undefined
  caption?: LexicalEditor
  height?: number | undefined
  key?: NodeKey
  maxWidth?: number
  showCaption?: boolean
  src: string
  width?: number | undefined
  captionsEnabled?: boolean
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode
    const node = $createImageNode({ altText, height, src, width })
    return { node }
  }
  return null
}

export type SerializedImageNode = Spread<
  {
    altText: string
    src: string
    type: 'image'
    version: 1
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string

  static override getType(): string {
    return 'image'
  }

  static override clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__key)
  }

  static override importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, src } = serializedNode
    const node = $createImageNode({
      altText,
      src,
    })
    return node
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement('img')
    element.setAttribute('src', this.__src)
    element.setAttribute('alt', this.__altText)
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    }
  }

  constructor(src: string, altText?: string | null | undefined, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText || ''
  }

  override exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      src: this.getSrc(),
      type: 'image',
      version: 1,
    }
  }

  override isInline(): boolean {
    return true
  }

  // View

  override createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    const theme = config.theme
    const className = theme.image
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  override updateDOM(): false {
    return false
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  override decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ImageComponent
          src={this.__src}
          altText={this.__altText}
          nodeKey={this.getKey()}
        />
      </Suspense>
    )
  }
}

export function $createImageNode({
  altText,
  src,
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, key))
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode
}
