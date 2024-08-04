/**



*/

/**
 * @group _MiscellaneousElement
 */
export type RootElement = {
  type: 'root'
  children: BlockElement[]
  embedCode?: string
}

/**
 * @group BlockElement
 */
export type BlockquoteElement = {
  type: 'blockquote'
  children: InlineElement[]
}
/**
 * @group BlockElement
 */
export type CodeBlockElement = {
  type: 'code_block'
  lang?: string
  value: string
  children: [EmptyTextElement]
}
/**
 * @group BlockElement
 */
export type HeadingElement = {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: InlineElement[]
}

/**
 * @group BlockElement
 */
export type HrElement = {
  type: 'hr'
  children: [EmptyTextElement]
}
/**
 * @group BlockElement
 */
export type HTMLElement = {
  type: 'html'
  value: string
  children: [EmptyTextElement]
}
/**
 * @group InlineElement
 */
export type HTMLInlineElement = {
  type: 'html_inline'
  value: string
  children: [EmptyTextElement]
}
/**
 * @group BlockElement
 */
export type InvalidMarkdownElement = {
  type: 'invalid_markdown'
  value: string
  message: string
  position?: Position
  children: [EmptyTextElement]
}
/**
 * @group ListElements
 */
export type List = OrderedListElement | UnorderedListElement
/**
 * @group ListElements
 */
export type ListItemContentElement = {
  type: 'lic'
  children: LicElement[]
}
/**
 * @group ListElements
 */
export type ListItemChildrenElement =
  | ListItemContentElement
  | UnorderedListElement
  | OrderedListElement

/**
 * @group BlockElement
 */
export type ListItemElement = {
  type: 'li'
  children: ListItemChildrenElement[]
}
/**
 * @group BlockElement
 */
export type UnorderedListElement = {
  type: 'ul'
  children: ListItemElement[]
}
/**
 * @group BlockElement
 */
export type MdxBlockElement = {
  type: 'mdxJsxFlowElement'
  name: string | null
  props: Record<string, unknown>
  children: [EmptyTextElement]
}
/**
 * @group BlockElement
 */
export type OrderedListElement = {
  type: 'ol'
  children: ListItemElement[]
}
/**
 * @group BlockElement
 */
export type ParagraphElement = {
  type: 'p'
  children: InlineElement[]
}

/**
 * @group BlockElement
 */
export type BlockElement =
  | BlockquoteElement
  | CodeBlockElement
  | HeadingElement
  | HrElement
  | HTMLElement
  | ImageElement
  | InvalidMarkdownElement
  | ListItemElement
  | MdxBlockElement
  | ParagraphElement
  | OrderedListElement
  | UnorderedListElement

/**
 * @group InlineElement
 */
export type MdxInlineElement = {
  type: 'mdxJsxTextElement'
  name: string | null
  props: Record<string, unknown>
  children: [EmptyTextElement]
}

/**
 * @remarks
 * Used specifically to denote no children, used by
 * the frontend rich-text editor for void nodes
 *
 * @group MiscellaneousElement
 */
export type EmptyTextElement = { type: 'text'; text: '' }
/**
 * @group InlineElement
 */
export type TextElement = {
  type: 'text'
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
}
/**
 * @remarks
 * It may be beneficial to treat this as a block element
 *
 * @group InlineElement
 */
export type ImageElement = {
  type: 'img'
  url: string
  alt?: string
  caption?: string | null
  children: [EmptyTextElement]
}
/**
 * @group InlineElement
 */
export type LinkElement = {
  type: 'a'
  url: string
  title?: string | null
  children: InlineElement[]
}
/**
 * @group InlineElement
 */
export type BreakElement = {
  type: 'break'
  children: [EmptyTextElement]
}

/**
 * @group ListElements
 */
export type LicElement = InlineElement

/**
 * @group InlineElement
 */
export type InlineElement =
  | TextElement
  | MdxInlineElement
  | BreakElement
  | LinkElement
  | ImageElement
  | HTMLInlineElement

/**
 * @remarks
 * Positional information for error reporting
 *
 * @group _MiscellaneousElement
 */
export type Position = {
  start: PositionItem
  end: PositionItem
}

/**
 * @remarks
 * Positional information for error reporting
 *
 * @group _MiscellaneousElement
 */
export type PositionItem = {
  line?: number | null
  column?: number | null
  offset?: number | null
  _index?: number | null
  _bufferIndex?: number | null
}
