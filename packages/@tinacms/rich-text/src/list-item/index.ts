import {
  $createParagraphNode,
  $isTextNode,
  type DOMConversionMap,
  type LexicalNode,
  type NodeKey,
} from 'lexical'

import { $applyNodeReplacement } from 'lexical'

import { ListItemNode } from '@lexical/list'

export class TinaListItemNode extends ListItemNode {
  static override getType(): string {
    return 'tina-listitem'
  }

  static override clone(node: TinaListItemNode): TinaListItemNode {
    return new TinaListItemNode(node.__value, node.__checked, node.__key)
  }

  constructor(value?: number, checked?: boolean, key?: NodeKey) {
    super(value, checked, key)
    this.__value = value === undefined ? 1 : value
    if (checked === true || checked === false) {
      this.__checked = checked
    }
  }

  static override importDOM(): DOMConversionMap | null {
    return ListItemNode.importDOM()
  }

  // SerializedListItemNode is not exported
  static override importJSON(serializedNode: any) {
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
   *
   * The built-in ListItemNode allows content to be merged with
   * paragraph nodes and content can be merged during an .append to the node. If we
   * call this.append([...some nodes]) and there's a paragraph node
   * it will try to merge the paragraph's children with these children
   */
  override canMergeWith(node: LexicalNode) {
    return $isListItemNode(node)
  }

  /**
   * This allows markdown transforms to work within this node
   *
   * NOT SURE WHAT ELSE IT DOES
   */
  override isShadowRoot(): boolean {
    return true
  }

  // @ts-ignore FIXME override return type.
  override exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'tina-listitem' as const,
      version: 1,
    }
  }

  override splice(
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
