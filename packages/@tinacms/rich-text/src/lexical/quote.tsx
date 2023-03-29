import {
  $createParagraphNode,
  DOMConversionMap,
  ElementNode,
  LexicalNode,
  NodeKey,
} from 'lexical'

import { $applyNodeReplacement } from 'lexical'

import { HeadingNode, QuoteNode, $createHeadingNode } from '@lexical/rich-text'
import { ListItemNode } from '@lexical/list'

export class TinaQuoteNode extends QuoteNode {
  static getType(): string {
    return 'tina-quotenode'
  }

  static clone(node: TinaQuoteNode): TinaQuoteNode {
    return new TinaQuoteNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  static importDOM(): DOMConversionMap | null {
    return QuoteNode.importDOM()
  }

  // SerializedListItemNode is not exported
  static importJSON(serializedNode: any) {
    return QuoteNode.importJSON(serializedNode)
  }

  /**
   * This allows markdown transforms to work within this node
   *
   * NOT SURE WHAT ELSE IT DOES
   */
  isShadowRoot(): boolean {
    return true
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'tina-quotenode',
      version: 1,
    }
  }

  append(...nodes: LexicalNode[]): this {
    return this.splice(this.getChildrenSize(), 0, nodes)
  }
}

export function $createTinaQuoteNode(): TinaQuoteNode {
  return $applyNodeReplacement(new TinaQuoteNode())
}
export function $isTinaQuoteNode(
  node: LexicalNode | null | undefined
): node is TinaQuoteNode {
  return node instanceof TinaQuoteNode
}
