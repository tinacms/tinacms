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
  | LexicalImageNode

export interface LexicalLinkNode {
  type: 'link'
  url: string
  target?: string | null | undefined
  rel?: string | null | undefined
  children: LexicalStaticPhrasingContentNode[]
}

export interface LexicalImageNode {
  type: 'image'
  src: string
  altText?: string | null | undefined
  // target?: string | null | undefined
  // rel?: string | null | undefined
}

export type LexicalPhrasingContentNode =
  | LexicalTextNode
  | LexicalLinkNode
  | LexicalLinebreakNode
  | LexicalImageNode

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
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
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
