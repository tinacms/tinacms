export type RootElement = {
  type: 'root'
  children: BlockElement[]
}

export type HeadingElement = {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: InlineElement[]
}
export type ParagraphElement = {
  type: 'p'
  children: InlineElement[]
}
export type MdxBlockElement = {
  type: 'mdxJsxFlowElement'
  name: string | null
  props: Record<string, unknown>
  children: [EmptyTextElement]
}
export type HrElement = {
  type: 'hr'
  children: [EmptyTextElement]
}
export type CodeLineElement = {
  type: 'code_line'
  children: TextElement[]
}
export type CodeBlockElement = {
  type: 'code_block'
  lang?: string
  children: CodeLineElement[]
}
export type BlockquoteElement = {
  type: 'blockquote'
  children: InlineElement[]
}
export type ListItemContentElement = {
  type: 'lic'
  children: LicElement[]
}
export type ListItemChildrenElement =
  | ListItemContentElement
  | UnorderedListElement
  | OrderedListElement

export type ListItemElement = {
  type: 'li'
  children: ListItemChildrenElement[]
}
export type UnorderedListElement = {
  type: 'ul'
  children: ListItemElement[]
}
export type OrderedListElement = {
  type: 'ol'
  children: ListItemElement[]
}
export type List = OrderedListElement | UnorderedListElement
export type BlockElement =
  | HeadingElement
  | ParagraphElement
  | CodeBlockElement
  | BlockquoteElement
  | MdxBlockElement
  | UnorderedListElement
  | OrderedListElement
  | ListItemElement
  | HrElement

export type MdxInlineElement = {
  type: 'mdxJsxTextElement'
  name: string | null
  props: Record<string, unknown>
  children: [EmptyTextElement]
}

export type EmptyTextElement = { type: 'text'; text: '' }
export type TextElement = {
  type: 'text'
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
}
export type ImageElement = {
  type: 'img'
  url: string
  alt?: string
  caption?: string | null
  children: [EmptyTextElement]
}
export type LinkElement = {
  type: 'a'
  url: string
  title?: string | null
  children: InlineElement[]
}
export type BreakElement = {
  type: 'break'
  children: [EmptyTextElement]
}

export type LicElement = InlineElement

export type InlineElement =
  | TextElement
  | MdxInlineElement
  | BreakElement
  | LinkElement
  | ImageElement
