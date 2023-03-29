import {
  ElementNode,
  LexicalNode,
  ParagraphNode,
  RangeSelection,
  SerializedParagraphNode,
} from 'lexical'
import { $isListItemNode, $isListNode } from '@lexical/list'
import { $createTinaListItemNode, $isTinaListItemNode } from './list-item'
import { $isTinaQuoteNode } from './quote'

export class TinaParagraphNode extends ParagraphNode {
  static override getType(): string {
    return 'tina-paragraph'
  }
  static override clone(node: LexicalNode) {
    return new TinaParagraphNode(node.__key)
  }

  override collapseAtStart(): boolean {
    const parent = this.getParent()
    if ($isTinaListItemNode(parent)) {
      parent.replace(this)
    }
    if ($isTinaQuoteNode(parent)) {
      parent.replace(this)
    }
    return super.collapseAtStart()
  }

  /**
   * Since paragraphs are inside list items, commands line tabbing
   * to indent into a sub list don't get delegated properly because
   * the focused node is a paragraph instead of a list item. So
   * in some cases we delegate the logic to the parent node, and
   * if it's not a list item, we fall back to paragraph's default
   * functionality (eg. no tabbing support)
   */
  override canIndent(): boolean {
    return true
  }
  override getIndent(): number {
    const parent = this.getParent()
    if ($isListItemNode(parent)) {
      return parent.getIndent()
    }
    return this.__indent
  }
  override setIndent(indentLevel: number): this {
    const parent = this.getParent()
    if ($isListItemNode(parent)) {
      parent.setIndent(indentLevel)
    }
    return this
  }

  override insertNewAfter(
    selection: RangeSelection,
    restoreSelection: boolean | undefined = true
  ): ElementNode {
    const isLastChild = !this.getNextSibling()
    const hasNoChildren = this.getChildren().length === 0
    if (isLastChild && hasNoChildren) {
      const parent = this.getParentOrThrow()
      if ($isTinaListItemNode(parent)) {
        // list item is emtpy (aside from this paragraph), get out of the list entirely
        if (parent.getChildren().length === 1) {
          const list = parent.getParentOrThrow()
          if ($isListNode(list)) {
            parent.remove()
            list.insertAfter(this, true)
            return this
          }
        } else {
          // empty paragraph, making a new list item
          const nextListItem = $createTinaListItemNode()
          nextListItem.append(this)
          parent.insertAfter(nextListItem)
          // IMPORTANT: return the item which is being
          // positioned on the parent.
          // Returning the paragraph node (this), causes:
          // Expected node <id> to have a parent
          return nextListItem
        }
      }
      if ($isTinaQuoteNode(parent)) {
        parent.insertAfter(this)
        return this
      }
    }
    return super.insertNewAfter(selection, restoreSelection)
  }

  override splice(
    start: number,
    deleteCount: number,
    nodesToInsert: LexicalNode[]
  ): this {
    const unwrappedNodesToInsert: LexicalNode[] = []
    nodesToInsert.forEach((node) => {
      if ($isTinaParagraphNode(node)) {
        console.warn(
          'found paragraph node as an child of a paragraph, unwrapping',
          node
        )
        node.getChildren().map((child) => {
          unwrappedNodesToInsert.push(child)
        })
      } else {
        unwrappedNodesToInsert.push(node)
      }
    })
    super.splice(start, deleteCount, unwrappedNodesToInsert)
    return this
  }

  static override importJSON(serializedNode: SerializedParagraphNode) {
    return ParagraphNode.importJSON(serializedNode)
  }

  override exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'tina-paragraph',
      version: 1,
    }
  }
}

export const $createTinaParagraphNode = () => {
  return new TinaParagraphNode()
}

export function $isTinaParagraphNode(
  node: LexicalNode | null | undefined
): node is TinaParagraphNode {
  return node instanceof TinaParagraphNode
}
