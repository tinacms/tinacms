export interface LexicalTextNode {
  type: 'text'
  text: string
  format: number
}

export interface LexicalLinebreakNode {
  type: 'linebreak'
}

export type LexicalStaticPhrasingContentNode =
  | LexicalTextNode
  | LexicalLinebreakNode

export interface LexicalLinkNode {
  type: 'link'
  children: LexicalStaticPhrasingContentNode[]
}

export type LexicalPhrasingContentNode =
  | LexicalTextNode
  | LexicalLinkNode
  | LexicalLinebreakNode

export interface LexicalQuoteNode {
  type: 'tina-quotenode'
  children: LexicalBlockContent[]
}

export interface LexicalParagraphNode {
  type: 'tina-paragraph'
  children: LexicalPhrasingContentNode[]
}

export interface LexicalHeadingNode {
  type: 'tina-heading'
  children: LexicalPhrasingContentNode[]
}

export interface LexicalCodeHighlightNode {
  type: 'code-highlight'
  text: string
  highlightType?: string | null | undefined
  format: number
  mode: 'normal' | 'token' | 'segmented'
  style: string
}

export interface LexicalCodeNode {
  type: 'code'
  children: (LexicalCodeHighlightNode | LexicalLinebreakNode)[]
}

export interface LexicalListItemNode {
  type: 'tina-listitem'
  children: LexicalBlockContent[]
}

export interface LexicalListNode {
  type: 'list'
  listType: 'bullet' | 'number'
  children: LexicalListItemNode[]
}

export interface LexicalHorizontalruleNode {
  type: 'horizontalrule'
}

export interface LexicalTableCell {
  type: 'tablecell'
  children: LexicalPhrasingContentNode[]
}
export interface LexicalTableRow {
  type: 'tablerow'
  children: LexicalTableCell[]
}

export interface LexicalTableNode {
  type: 'table'
  children: LexicalTableRow[]
}

export interface LexicalQuoteNode {
  type: 'tina-quotenode'
  children: LexicalBlockContent[]
}

export type LexicalBlockContent =
  | LexicalParagraphNode
  | LexicalListNode
  | LexicalCodeNode
  | LexicalHeadingNode
  | LexicalHorizontalruleNode
  | LexicalQuoteNode
  | LexicalTableNode

export type LexicalTopLevelContent = LexicalBlockContent
