import { QuoteNode } from '@lexical/rich-text'
import {
  $applyNodeReplacement,
  $createParagraphNode,
  LexicalNode,
  ParagraphNode,
  RangeSelection,
} from 'lexical'

export class TinaQuoteNode extends QuoteNode {
  // constructor(key: string) {
  //   super(key);
  // } // View
  static getType(): string {
    return 'tina-quote'
  }
  static clone(node: LexicalNode) {
    return new TinaQuoteNode(node.__key)
  }

  // Logic allows new lines, but 2 in a row takes
  // you out of the quote, like code block,
  // but with 1 less line you need to type
  insertNewAfter(
    selection: RangeSelection,
    restoreSelection: boolean | undefined = true
  ) {
    const children = this.getChildren()
    const childrenLength = children.length

    if (
      childrenLength >= 1 &&
      children[childrenLength - 1].getTextContent() === '\n' &&
      selection.isCollapsed() &&
      selection.anchor.key === this.__key &&
      selection.anchor.offset === childrenLength
    ) {
      children[childrenLength - 1].remove()
      const newElement = $createParagraphNode()
      this.insertAfter(newElement, restoreSelection)
      return newElement
    }

    return this
  }
}

export function $createTinaQuoteNode() {
  const quoteNode = new TinaQuoteNode()
  quoteNode.append($createParagraphNode())
  return $applyNodeReplacement(quoteNode)
}
export function $isTinaQuoteNode(node: LexicalNode | null | undefined) {
  return node instanceof QuoteNode
}
