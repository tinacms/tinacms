/** @module @lexical/highlight */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  EditorConfig,
  GridSelection,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  NodeSelection,
  RangeSelection,
  SerializedElementNode,
} from 'lexical'

import {
  addClassNamesToElement,
  removeClassNamesFromElement,
} from '@lexical/utils'
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  createCommand,
  ElementNode,
  Spread,
} from 'lexical'

export type HighlightAttributes = {
  rel?: null | string
  target?: null | string
}

export type SerializedHighlightNode = Spread<
  {
    type: 'highlight'
    url?: string
    version: 1
    color: string
  },
  Spread<HighlightAttributes, SerializedElementNode>
>

/** @noInheritDoc */
export class HighlightNode extends ElementNode {
  /** @internal */
  __url: string
  /** @internal */
  __target: null | string
  /** @internal */
  __rel: null | string
  // Custom tina fields
  /** @internal */
  __color: string

  static getType(): string {
    return 'highlight'
  }

  static clone(node: HighlightNode): HighlightNode {
    return new HighlightNode(
      node.__url,
      { rel: node.__rel, target: node.__target },
      node.__key
    )
  }

  constructor(
    url: string,
    attributes: HighlightAttributes = {},
    key?: NodeKey,
    color?: string
  ) {
    super(key)
    const { target = null, rel = null } = attributes
    this.__url = url
    this.__target = target
    this.__rel = rel
    this.__color = color || 'bg-yellow-300'
  }

  createDOM(config: EditorConfig): HTMLSpanElement {
    const element = document.createElement('span')
    // element.href = this.__url;
    // if (this.__target !== null) {
    //   element.target = this.__target;
    // }
    // if (this.__rel !== null) {
    //   element.rel = this.__rel;
    // }
    // addClassNamesToElement(element, config.theme.highlight);
    addClassNamesToElement(element, this.__color)
    return element
  }

  updateDOM(
    prevNode: HighlightNode,
    anchor: HTMLAnchorElement,
    config: EditorConfig
  ): boolean {
    const url = this.__url
    const target = this.__target
    const rel = this.__rel
    if (url !== prevNode.__url) {
      anchor.href = url
    }

    if (target !== prevNode.__target) {
      if (target) {
        anchor.target = target
      } else {
        anchor.removeAttribute('target')
      }
    }
    removeClassNamesFromElement(anchor, prevNode.__color)
    addClassNamesToElement(anchor, this.__color)

    if (rel !== prevNode.__rel) {
      if (rel) {
        anchor.rel = rel
      } else {
        anchor.removeAttribute('rel')
      }
    }
    return false
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (node: Node) => ({
        conversion: convertAnchorElement,
        priority: 1,
      }),
    }
  }

  static importJSON(
    serializedNode: SerializedHighlightNode | SerializedAutoHighlightNode
  ): HighlightNode {
    const node = $createHighlightNode(serializedNode.color, {
      rel: serializedNode.rel,
      target: serializedNode.target,
    })
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
  }

  exportJSON(): SerializedHighlightNode | SerializedAutoHighlightNode {
    return {
      ...super.exportJSON(),
      rel: this.getRel(),
      target: this.getTarget(),
      type: 'highlight',
      color: this.getColor(),
      version: 1,
    }
  }

  getColor(): string {
    return this.getLatest().__color
  }

  setColor(color: string): void {
    const writable = this.getWritable()
    writable.__color = color
  }

  getTarget(): null | string {
    return this.getLatest().__target
  }

  setTarget(target: null | string): void {
    const writable = this.getWritable()
    writable.__target = target
  }

  getRel(): null | string {
    return this.getLatest().__rel
  }

  setRel(rel: null | string): void {
    const writable = this.getWritable()
    writable.__rel = rel
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true
  ): null | ElementNode {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection
    )
    if ($isElementNode(element)) {
      const highlightNode = $createHighlightNode(this.__url, {
        rel: this.__rel,
        target: this.__target,
      })
      element.append(highlightNode)
      return highlightNode
    }
    return null
  }

  canInsertTextBefore(): false {
    return false
  }

  canInsertTextAfter(): false {
    return false
  }

  canBeEmpty(): false {
    return false
  }

  isInline(): true {
    return true
  }

  extractWithChild(
    child: LexicalNode,
    selection: RangeSelection | NodeSelection | GridSelection,
    destination: 'clone' | 'html'
  ): boolean {
    if (!$isRangeSelection(selection)) {
      return false
    }

    const anchorNode = selection.anchor.getNode()
    const focusNode = selection.focus.getNode()

    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      selection.getTextContent().length > 0
    )
  }
}

function convertAnchorElement(domNode: Node): DOMConversionOutput {
  let node = null
  if (domNode instanceof HTMLAnchorElement) {
    const content = domNode.textContent
    if (content !== null && content !== '') {
      node = $createHighlightNode(domNode.getAttribute('href') || '', {
        rel: domNode.getAttribute('rel'),
        target: domNode.getAttribute('target'),
      })
    }
  }
  return { node }
}

export function $createHighlightNode(
  url: string,
  attributes?: HighlightAttributes
): HighlightNode {
  return new HighlightNode(url, attributes)
}

export function $isHighlightNode(
  node: LexicalNode | null | undefined
): node is HighlightNode {
  return node instanceof HighlightNode
}

export type SerializedAutoHighlightNode = Spread<
  {
    type: 'autohighlight'
    version: 1
  },
  SerializedHighlightNode
>

// Custom node type to override `canInsertTextAfter` that will
// allow typing within the highlight
export class AutoHighlightNode extends HighlightNode {
  static getType(): string {
    return 'autohighlight'
  }

  static clone(node: AutoHighlightNode): AutoHighlightNode {
    return new AutoHighlightNode(
      node.__url,
      { rel: node.__rel, target: node.__target },
      node.__key
    )
  }

  static importJSON(
    serializedNode: SerializedAutoHighlightNode
  ): AutoHighlightNode {
    const node = $createAutoHighlightNode(serializedNode.color, {
      rel: serializedNode.rel,
      target: serializedNode.target,
    })
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
  }

  static importDOM(): null {
    // TODO: Should highlight node should handle the import over autohighlight?
    return null
  }

  exportJSON(): SerializedAutoHighlightNode {
    return {
      ...super.exportJSON(),
      type: 'autohighlight',
      version: 1,
    }
  }

  insertNewAfter(
    selection: RangeSelection,
    restoreSelection = true
  ): null | ElementNode {
    const element = this.getParentOrThrow().insertNewAfter(
      selection,
      restoreSelection
    )
    if ($isElementNode(element)) {
      const highlightNode = $createAutoHighlightNode(this.__url, {
        rel: this._rel,
        target: this.__target,
      })
      element.append(highlightNode)
      return highlightNode
    }
    return null
  }
}

export function $createAutoHighlightNode(
  url: string,
  attributes?: HighlightAttributes
): AutoHighlightNode {
  return new AutoHighlightNode(url, attributes)
}

export function $isAutoHighlightNode(
  node: LexicalNode | null | undefined
): node is AutoHighlightNode {
  return node instanceof AutoHighlightNode
}

export const TOGGLE_HIGHLIGHT_COMMAND: LexicalCommand<
  string | ({ url: string } & HighlightAttributes) | null
> = createCommand('TOGGLE_HIGHLIGHT_COMMAND')

export function toggleHighlight(color: null | string): void {
  const selection = $getSelection()

  if (!$isRangeSelection(selection)) {
    return
  }
  const nodes = selection.extract()

  if (color === null) {
    // Remove HighlightNodes
    nodes.forEach((node) => {
      const parent = node.getParent()

      if ($isHighlightNode(parent)) {
        const children = parent.getChildren()

        for (let i = 0; i < children.length; i++) {
          parent.insertBefore(children[i])
        }

        parent.remove()
      }
    })
  } else {
    // Add or merge HighlightNodes
    if (nodes.length === 1) {
      const firstNode = nodes[0]
      // if the first node is a HighlightNode or if its
      // parent is a HighlightNode, we update the URL, target and rel.
      const highlightNode = $isHighlightNode(firstNode)
        ? firstNode
        : $getHighlightAncestor(firstNode)
      if (highlightNode !== null) {
        highlightNode.setColor(color)
        return
      }
    }

    let prevParent: ElementNode | HighlightNode | null = null
    let highlightNode: HighlightNode | null = null

    nodes.forEach((node) => {
      const parent = node.getParent()

      if (
        parent === highlightNode ||
        parent === null ||
        ($isElementNode(node) && !node.isInline())
      ) {
        return
      }

      if ($isHighlightNode(parent)) {
        highlightNode = parent
        parent.setColor(color)
        return
      }

      if (!parent.is(prevParent)) {
        prevParent = parent
        highlightNode = $createHighlightNode(color)

        if ($isHighlightNode(parent)) {
          if (node.getPreviousSibling() === null) {
            parent.insertBefore(highlightNode)
          } else {
            parent.insertAfter(highlightNode)
          }
        } else {
          node.insertBefore(highlightNode)
        }
      }

      if ($isHighlightNode(node)) {
        if (node.is(highlightNode)) {
          return
        }
        if (highlightNode !== null) {
          const children = node.getChildren()

          for (let i = 0; i < children.length; i++) {
            highlightNode.append(children[i])
          }
        }

        node.remove()
        return
      }

      if (highlightNode !== null) {
        highlightNode.append(node)
      }
    })
  }
}

function $getHighlightAncestor(node: LexicalNode): null | LexicalNode {
  return $getAncestor(node, (ancestor) => $isHighlightNode(ancestor))
}

function $getAncestor(
  node: LexicalNode,
  predicate: (ancestor: LexicalNode) => boolean
): null | LexicalNode {
  let parent: null | LexicalNode = node
  while (
    parent !== null &&
    (parent = parent.getParent()) !== null &&
    !predicate(parent)
  );
  return parent
}
