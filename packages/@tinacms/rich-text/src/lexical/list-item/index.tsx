import {
  $createParagraphNode,
  $isTextNode,
  DOMConversionMap,
  LexicalNode,
  NodeKey,
} from 'lexical'

import { $applyNodeReplacement } from 'lexical'

import { ListItemNode } from '@lexical/list'

export class TinaListItemNode extends ListItemNode {
  static getType(): string {
    return 'tina-listitem'
  }

  static clone(node: TinaListItemNode): TinaListItemNode {
    return new TinaListItemNode(node.__value, node.__checked, node.__key)
  }

  constructor(value?: number, checked?: boolean, key?: NodeKey) {
    super(value, checked, key)
    this.__value = value === undefined ? 1 : value
    this.__checked = checked
  }

  static importDOM(): DOMConversionMap | null {
    return ListItemNode.importDOM()
  }

  // SerializedListItemNode is not exported
  static importJSON(serializedNode: any) {
    const node = new TinaListItemNode(
      serializedNode.value,
      serializedNode.checked
    )
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
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
      type: 'tina-listitem',
      version: 1,
    }
  }

  splice(
    start: number,
    deleteCount: number,
    nodesToInsert: LexicalNode[]
  ): this {
    const nodesToInsertWrapped = nodesToInsert.map((node) => {
      // Sometimes text nodes can sneak in from strange copy/paste, reparent them
      // Probably need to do the same for anything that expects flow content as
      // children
      if ($isTextNode(node)) {
        console.warn(
          'found text node as an child of list item, reparenting with a paragraph node',
          node
        )
        const paragraph = $createParagraphNode()
        paragraph.append(node)
        return paragraph
      }
      return node
    })
    return super.splice(start, deleteCount, nodesToInsertWrapped)
  }
}

export function $createListItemNode(checked?: boolean): TinaListItemNode {
  return $applyNodeReplacement(new TinaListItemNode(undefined, checked))
}
export function $createTinaListItemNode(checked?: boolean): TinaListItemNode {
  return $applyNodeReplacement(new TinaListItemNode(undefined, checked))
}

export function $isListItemNode(
  node: LexicalNode | null | undefined
): node is TinaListItemNode {
  return node instanceof TinaListItemNode
}

export function $isTinaListItemNode(
  node: LexicalNode | null | undefined
): node is TinaListItemNode {
  return node instanceof TinaListItemNode
}
