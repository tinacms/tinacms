import {
  $createParagraphNode,
  $isTextNode,
  DOMConversionMap,
  LexicalNode,
  NodeKey,
} from 'lexical'

import { $applyNodeReplacement } from 'lexical'

import { ListNode, ListType } from '@lexical/list'

export class TinaListNode extends ListNode {
  static getType(): string {
    return 'tina-list'
  }

  static clone(node: TinaListNode): TinaListNode {
    return new TinaListNode(node.__value, node.__checked)
  }

  constructor(listType: ListType, start: number, key?: NodeKey) {
    super(listType, start, key)
    // super(value, checked, key);
    // this.__value = value === undefined ? 1 : value;
    // this.__checked = checked;
  }

  static importDOM(): DOMConversionMap | null {
    return ListNode.importDOM()
  }

  // SerializedListItemNode is not exported
  static importJSON(serializedNode: any) {
    // console.log('importing list', serializedNode)
    return ListNode.importJSON(serializedNode)
  }

  // append(...nodesToAppend: LexicalNode[]): this {
  //   // nodesToAppend.forEach(n => console.log('appen',n.getChildren()))
  //   const result = super.append(...nodesToAppend)
  //   console.log('append to list')
  //   // console.log('nta', nodesToAppend)
  //   // result.getChildren().forEach(child => {
  //   //   console.log('list child', child)
  //   //   child.getChildren().forEach(c => {
  //   //     console.log('list item child', c)
  //   //   })
  //   // })
  //   // result.getChildren().forEach(c => console.log(c.getChildren()))
  //   return result
  // }

  // /**
  //  * This allows markdown transforms to work within this node
  //  *
  //  * NOT SURE WHAT ELSE IT DOES
  //  */
  // isShadowRoot(): boolean {
  //   return true;
  // }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: 'tina-list',
      version: 1,
    }
  }
}

// export function $createListItemNode(checked?: boolean): TinaListItemNode {
//   return $applyNodeReplacement(new TinaListItemNode(undefined, checked));
// }
// export function $createTinaListItemNode(checked?: boolean): TinaListItemNode {
//   return $applyNodeReplacement(new TinaListItemNode(undefined, checked));
// }

// export function $isListItemNode(
//   node: LexicalNode | null | undefined
// ): node is TinaListItemNode {
//   return node instanceof TinaListItemNode;
// }

// export function $isTinaListItemNode(
//   node: LexicalNode | null | undefined
// ): node is TinaListItemNode {
//   return node instanceof TinaListItemNode;
// }
