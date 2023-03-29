import type { LexicalNode } from 'lexical'
import { ListNode, $isListNode } from '@lexical/list'

export function invariant(
  cond?: boolean,
  message?: string,
  ..._args: string[]
): asserts cond {
  if (cond) {
    return
  }

  throw new Error(
    'Internal Lexical error: invariant() is meant to be replaced at compile ' +
      'time. There is no runtime version. Error: ' +
      message
  )
}

import { $createListItemNode, $isListItemNode, TinaListItemNode } from '.'

export function $getListDepth(listNode: ListNode): number {
  let depth = 1
  let parent = listNode.getParent()

  while (parent != null) {
    if ($isListItemNode(parent)) {
      const parentList = parent.getParent()

      if ($isListNode(parentList)) {
        depth++
        parent = parentList.getParent()
        continue
      }
      invariant(false, 'A TinaListItemNode must have a ListNode for a parent.')
    }

    return depth
  }

  return depth
}

export function $getTopListNode(listItem: LexicalNode): ListNode {
  let list = listItem.getParent<ListNode>()

  if (!$isListNode(list)) {
    invariant(false, 'A TinaListItemNode must have a ListNode for a parent.')
  }

  let parent: ListNode | null = list

  while (parent !== null) {
    parent = parent.getParent()

    if ($isListNode(parent)) {
      list = parent
    }
  }

  return list
}

export function $isLastItemInList(listItem: TinaListItemNode): boolean {
  let isLast = true
  const firstChild = listItem.getFirstChild()

  if ($isListNode(firstChild)) {
    return false
  }
  let parent: TinaListItemNode | null = listItem

  while (parent !== null) {
    if ($isListItemNode(parent)) {
      if (parent.getNextSiblings().length > 0) {
        isLast = false
      }
    }

    parent = parent.getParent()
  }

  return isLast
}

// This should probably be $getAllChildrenOfType
export function $getAllListItems(node: ListNode): Array<TinaListItemNode> {
  let listItemNodes: Array<TinaListItemNode> = []
  const listChildren: Array<TinaListItemNode> = node
    .getChildren()
    .filter($isListItemNode)

  for (let i = 0; i < listChildren.length; i++) {
    const listItemNode = listChildren[i]
    const firstChild = listItemNode?.getFirstChild()

    if ($isListNode(firstChild)) {
      listItemNodes = listItemNodes.concat($getAllListItems(firstChild))
    } else {
      if (listItemNode) {
        listItemNodes.push(listItemNode)
      }
    }
  }

  return listItemNodes
}

export function isNestedListNode(
  node: LexicalNode | null | undefined
): boolean {
  return $isListItemNode(node) && $isListNode(node.getFirstChild())
}

// TODO: rewrite with $findMatchingParent or *nodeOfType
export function findNearestListItemNode(
  node: LexicalNode
): TinaListItemNode | null {
  let currentNode: LexicalNode | null = node

  while (currentNode !== null) {
    if ($isListItemNode(currentNode)) {
      return currentNode
    }
    currentNode = currentNode.getParent()
  }

  return null
}

export function getUniqueListItemNodes(
  nodeList: Array<LexicalNode>
): Array<TinaListItemNode> {
  const keys = new Set<TinaListItemNode>()

  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i]

    if ($isListItemNode(node)) {
      keys.add(node)
    }
  }

  return Array.from(keys)
}

export function $removeHighestEmptyListParent(
  sublist: TinaListItemNode | ListNode
) {
  // Nodes may be repeatedly indented, to create deeply nested lists that each
  // contain just one bullet.
  // Our goal is to remove these (empty) deeply nested lists. The easiest
  // way to do that is crawl back up the tree until we find a node that has siblings
  // (e.g. is actually part of the list contents) and delete that, or delete
  // the root of the list (if no list nodes have siblings.)
  let emptyListPtr = sublist

  while (
    emptyListPtr.getNextSibling() == null &&
    emptyListPtr.getPreviousSibling() == null
  ) {
    const parent = emptyListPtr.getParent<TinaListItemNode | ListNode>()

    if (
      parent == null ||
      !($isListItemNode(emptyListPtr) || $isListNode(emptyListPtr))
    ) {
      break
    }

    emptyListPtr = parent
  }

  emptyListPtr.remove()
}

export function wrapInListItem(node: LexicalNode): TinaListItemNode {
  const listItemWrapper = $createListItemNode()
  return listItemWrapper.append(node)
}
