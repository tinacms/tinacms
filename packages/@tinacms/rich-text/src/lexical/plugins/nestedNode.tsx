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

const NestedComponent = React.lazy(
  // @ts-ignore
  () => import('./nestedComponent')
)

export function $isNestedNode(
  node: LexicalNode | null | undefined
): node is NestedNode {
  return node instanceof NestedNode
}

export function $createNestedNode(): NestedNode {
  return new NestedNode()
}

export type SerializedNestedNode = Spread<
  {
    type: 'nested'
    version: 1
  },
  SerializedLexicalNode
>

export class NestedNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'nested'
  }

  static clone(node: NestedNode): NestedNode {
    return new NestedNode()
  }

  static importJSON(serializedNode: SerializedNestedNode): NestedNode {
    const node = $createNestedNode()
    return node
  }

  constructor() {
    super()
  }

  exportJSON(): SerializedNestedNode {
    return {
      type: 'nested',
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
    return false
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
        <NestedComponent nodeKey={this.__key} />
      </Suspense>
    )
  }
}
