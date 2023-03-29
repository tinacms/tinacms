import { $applyNodeReplacement } from 'lexical'
import { QuoteNode } from '@lexical/rich-text'
import type { LexicalNode, DOMConversionMap, NodeKey } from 'lexical'

export class TinaQuoteNode extends QuoteNode {
  static override getType(): string {
    return 'tina-quotenode'
  }

  static override clone(node: TinaQuoteNode): TinaQuoteNode {
    return new TinaQuoteNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  static override importDOM(): DOMConversionMap | null {
    return QuoteNode.importDOM()
  }

  // SerializedListItemNode is not exported
  static override importJSON(serializedNode: any) {
    return QuoteNode.importJSON(serializedNode)
  }

  /**
   * This allows markdown transforms to work within this node
   *
   * NOT SURE WHAT ELSE IT DOES
   */
  override isShadowRoot(): boolean {
    return true
  }

  override exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'tina-quotenode',
      version: 1,
    }
  }

  override append(...nodes: LexicalNode[]): this {
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
