import { $createParagraphNode, $isRootNode, LexicalNode } from 'lexical'
import { $isTinaListItemNode } from '../list-item'
import { $isTinaQuoteNode } from '../quote'
import {
  HeadingNode,
  HeadingTagType,
  SerializedHeadingNode,
} from '@lexical/rich-text'

export class TinaHeadingNode extends HeadingNode {
  static override getType(): string {
    return 'tina-heading'
  }
  static override clone(node: TinaHeadingNode) {
    return new TinaHeadingNode(node.__tag, node.__key)
  }

  override collapseAtStart() {
    const parent = this.getParent()
    if ($isTinaListItemNode(parent)) {
      parent.replace(this)
      return true
    }
    if ($isTinaQuoteNode(parent)) {
      parent.replace(this)
      return true
    }
    if ($isRootNode(parent) && this.getPreviousSibling() === null) {
      const paragraph = $createParagraphNode()
      const children = this.getChildren()
      children.forEach((child) => paragraph.append(child))
      this.replace(paragraph)
      return true
    }
    return super.collapseAtStart()
  }

  static override importJSON(serializedNode: SerializedHeadingNode) {
    return HeadingNode.importJSON(serializedNode)
  }

  // @ts-ignore FIXME override return type
  override exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'tina-heading',
      version: 1,
    }
  }
}

export const $createTinaHeadingNode = (tag: HeadingTagType) => {
  return new TinaHeadingNode(tag)
}

export function $isTinaHeadingNode(
  node: LexicalNode | null | undefined
): node is TinaHeadingNode {
  return node instanceof TinaHeadingNode
}
