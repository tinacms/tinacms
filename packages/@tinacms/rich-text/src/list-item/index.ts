import {
  $createParagraphNode,
  $isTextNode,
  type DOMConversionMap,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
} from 'lexical'

import { $applyNodeReplacement } from 'lexical'

import { $createListNode, $isListNode, ListItemNode } from '@lexical/list'

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

  // override createDOM(config: EditorConfig): HTMLElement {
  //   const el = super.createDOM(config)
  //   console.log('created', el.outerHTML)
  //   return el
  // }

  // override  createDOM2(config) {
  // }

  static override transform() {
    return (node: TinaListItemNode) => {
      const parent = node.getParent()

      if ($isListNode(parent)) {
        // The parent listitem logic runs this, which improperly
        // sets the `value` to 1 for sibilings when items are nested in the previous
        // list item
        // updateChildrenListItemValue(parent);

        if (parent.getListType() !== 'check' && node.getChecked() != null) {
          node.setChecked(undefined)
        }
      }
    }
  }

  override setIndent(indent: number): this {
    // return super.setIndent(indent)
    if (!(typeof indent === 'number' && indent > -1)) {
      throw Error(`Invalid indent value.`)
    }

    let currentIndent = this.getIndent()

    while (currentIndent !== indent) {
      if (currentIndent < indent) {
        const parent = this.getParent()
        if ($isListNode(parent)) {
          const nestedList = $createListNode(parent.getListType())
          const nestedListItem = $createTinaListItemNode()
          const children = this.getChildren()
          // reparenting the children in the list item which
          // will be appended. NOTE: this effectively "removes"
          // these children from the _current_ list item
          nestedListItem.append(...children)
          nestedList.append(nestedListItem)
          this.append(nestedList)
        } else {
          throw new Error(
            `Unexpected node for list item of type ${parent?.__type} (key: ${parent?.__key})`
          )
        }
        currentIndent++
      } else {
        currentIndent--
      }
    }

    return this
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
