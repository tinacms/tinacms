import { QuoteNode } from '@lexical/rich-text'
import {
  $applyNodeReplacement,
  $createParagraphNode,
  $getRoot,
  LexicalNode,
  ParagraphNode,
  RangeSelection,
} from 'lexical'
import { $isTinaQuoteNode } from './quoteNode'
import { $createListItemNode, $createListNode } from '@lexical/list'

export class TinaParagraphNode extends ParagraphNode {
  static getType(): string {
    return 'tina-paragraph'
  }
  static clone(node: LexicalNode) {
    return new TinaParagraphNode(node.__key)
  }

  collapseAtStart() {
    const parent = this.getParent()
    if ($isTinaQuoteNode(parent)) {
      if (parent?.getChildren().length === 1) {
        parent.replace(this)
        return true
      } else {
        parent?.insertBefore(this)
        return true
      }
    }
    return false
  }

  // Logic allows new lines, but 2 in a row takes
  // you out of the quote, like code block,
  // but with 1 less line you need to type
  insertNewAfter(
    selection: RangeSelection,
    restoreSelection: boolean | undefined = true
  ) {
    console.log('insertnewafter')
    if (this.getChildren().length === 0) {
      const parent = this.getParent()
      if (parent?.getType() === 'tina-quote') {
        this.remove()
        const newElement = $createParagraphNode()
        parent.insertAfter(newElement)
        return newElement
      }
    }
    const parent = this.getParent()
    if (parent?.getType() === 'listitem') {
      if (this.getChildren().length === 0) {
        // If we're not the only paragraph in the list item
        // we can be removed
        if (parent.getChildren().length !== 1) {
          this.remove()
        }
        //currently tabbing on paragraph uses padding-inline-start
        const newElement = $createListItemNode().append($createParagraphNode())
        parent.insertAfter(newElement)
        return newElement
      } else {
      }
    }

    const newElement = $createParagraphNode()
    this.insertAfter(newElement, restoreSelection)
    return newElement
  }
}

// export function $createTinaQuoteNode() {
//   const quoteNode = new TinaQuoteNode();
//   quoteNode.append($createParagraphNode());
//   return $applyNodeReplacement(quoteNode);
// }
