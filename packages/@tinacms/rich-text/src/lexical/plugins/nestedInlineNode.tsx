import type {
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'

import { $setSelection, createEditor, DecoratorNode } from 'lexical'
import * as React from 'react'
import { Suspense } from 'react'
import { createPortal } from 'react-dom'

const NestedInlineComponent = React.lazy(
  // @ts-ignore
  () => import('./nestedInlineComponent')
)

export function $isNestedInlineNode(
  node: LexicalNode | null | undefined
): node is NestedInlineNode {
  return node instanceof NestedInlineNode
}

export function $createNestedInlineNode(): NestedInlineNode {
  return new NestedInlineNode()
}

export type SerializedNestedNode = Spread<
  {
    type: 'nested-inline'
    version: 1
  },
  SerializedLexicalNode
>

export class NestedInlineNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'nested-inline'
  }

  static clone(node: NestedInlineNode): NestedInlineNode {
    return new NestedInlineNode()
  }

  static importJSON(serializedNode: SerializedNestedNode): NestedInlineNode {
    const node = $createNestedInlineNode()
    return node
  }

  constructor() {
    super()
  }

  exportJSON(): SerializedNestedNode {
    return {
      type: 'nested-inline',
      version: 1,
    }
  }

  static importDOM(): null {
    return null
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-lexical-nested', this.__question)
    return { element }
  }

  createDOM(): HTMLElement {
    const elem = document.createElement('span')
    // elem.style.display = "inline-block";
    return elem
  }

  updateDOM(): false {
    return false
  }

  isInline(): boolean {
    return true
  }

  isKeyboardSelectable(): boolean {
    return true
  }

  // isIsolated(): boolean {
  //   return true;
  // }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <NestedInlineComponent nodeKey={this.__key} />
      </Suspense>
    )
  }
}
