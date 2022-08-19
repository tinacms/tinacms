/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
import { Position } from './remarkToPlate'

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
export type HTMLElement = {
  type: 'html'
  value: string
  children: [EmptyTextElement]
}
export type HTMLInlineElement = {
  type: 'html_inline'
  value: string
  children: [EmptyTextElement]
}
export type InvalidMarkdownElement = {
  type: 'invalid_markdown'
  value: string
  message: string
  position?: Position
  children: [EmptyTextElement]
}
export type CodeBlockElement = {
  type: 'code_block'
  lang?: string
  value: string
  children: [EmptyTextElement]
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
  | HTMLElement
  | ImageElement
  | UnorderedListElement
  | OrderedListElement
  | ListItemElement
  | HrElement
  | InvalidMarkdownElement

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
  | HTMLInlineElement
