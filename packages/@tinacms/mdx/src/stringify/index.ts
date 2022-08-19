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

import { toMarkdown } from 'mdast-util-to-markdown'
import {
  mdxJsxToMarkdown,
  MdxJsxTextElement,
  MdxJsxFlowElement,
} from 'mdast-util-mdx-jsx'
import { replaceAll } from '../parse'
import type { RichTypeInner } from '@tinacms/schema-tools'
import type * as Md from 'mdast'
import type * as Plate from '../parse/plate'
import { eat } from './marks'
import { stringifyProps } from './acorn'

declare module 'mdast' {
  interface StaticPhrasingContentMap {
    mdxJsxTextElement: MdxJsxTextElement
  }
  interface PhrasingContentMap {
    mdxJsxTextElement: MdxJsxTextElement
  }

  interface BlockContentMap {
    mdxJsxFlowElement: MdxJsxFlowElement
  }
  interface ContentMap {
    mdxJsxFlowElement: MdxJsxFlowElement
  }
}

export const stringifyMDX = (
  value: Plate.RootElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
) => {
  if (!value) {
    return
  }
  if (typeof value === 'string') {
    throw new Error('Expected an object to stringify, but received a string')
  }
  if (value?.children[0]) {
    if (value?.children[0].type === 'invalid_markdown') {
      return value.children[0].value
    }
  }
  const res = toMarkdown(rootElement(value, field, imageCallback), {
    extensions: [mdxJsxToMarkdown()],
    listItemIndent: 'one',
  })
  const templatesWithMatchers = field.templates?.filter(
    (template) => template.match
  )
  let preprocessedString = res
  templatesWithMatchers?.forEach((template) => {
    if (typeof template === 'string') {
      throw new Error('Global templates are not supported')
    }
    if (template.match) {
      preprocessedString = replaceAll(
        preprocessedString,
        `<${template.name}>\``,
        `${template.match.start} `
      )
      preprocessedString = replaceAll(
        preprocessedString,
        `\`</${template.name}>`,
        ` ${template.match.end}`
      )
    }
  })
  return preprocessedString
}

export const rootElement = (
  content: Plate.RootElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Md.Root => {
  const children: Md.Content[] = []
  content.children.forEach((child) => {
    const value = blockElement(child, field, imageCallback)
    if (value) {
      children.push(value)
    }
  })
  return {
    type: 'root',
    children,
  }
}

export const blockElement = (
  content: Plate.BlockElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Md.Content | null => {
  switch (content.type) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: 'heading',
        // @ts-ignore Type 'number' is not assignable to type '1 | 2 | 3 | 4 | 5 | 6'
        depth: { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }[content.type],
        children: eat(content.children, field, imageCallback),
      }
    case 'p':
      // Ignore empty blocks
      if (content.children.length === 1) {
        const onlyChild = content.children[0]
        if (onlyChild && onlyChild.type === 'text' && onlyChild.text === '') {
          return null
        }
      }
      return {
        type: 'paragraph',
        children: eat(content.children, field, imageCallback),
      }
    case 'code_block':
      return {
        type: 'code',
        lang: content.lang,
        value: content.value,
      }
    case 'mdxJsxFlowElement':
      const { children, attributes } = stringifyProps(
        content,
        field,
        false,
        imageCallback
      )
      return {
        type: 'mdxJsxFlowElement',
        name: content.name,
        attributes,
        children,
      }
    case 'blockquote':
      return {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: eat(content.children, field, imageCallback),
          },
        ],
      }
    case 'hr':
      return {
        type: 'thematicBreak',
      }
    case 'ol':
    case 'ul':
      return {
        type: 'list',
        ordered: content.type === 'ol',
        spread: false,
        children: content.children.map((child) =>
          listItemElement(child, field, imageCallback)
        ),
      }
    case 'html': {
      return {
        type: 'html',
        value: content.value,
      }
    }
    case 'img':
      return {
        type: 'image',
        url: imageCallback(content.url),
        alt: content.alt,
        title: content.caption,
      }
    default:
      throw new Error(`BlockElement: ${content.type} is not yet supported`)
  }
}
const listItemElement = (
  content: Plate.ListItemElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Md.ListItem => {
  return {
    type: 'listItem',
    // spread is always false since we don't support block elements in list items
    // good explanation of the difference: https://stackoverflow.com/questions/43503528/extra-lines-appearing-between-list-items-in-github-markdown
    spread: false,
    children: content.children.map((child) => {
      if (child.type === 'lic') {
        return {
          type: 'paragraph',
          children: eat(child.children, field, imageCallback),
        }
      }
      return blockContentElement(child, field, imageCallback)
    }),
  }
}
const blockContentElement = (
  content: Plate.BlockElement,
  field: RichTypeInner,
  imageCallback: (url: string) => string
): Md.BlockContent => {
  switch (content.type) {
    case 'blockquote':
      return {
        type: 'blockquote',
        children: content.children.map((child) =>
          // FIXME: text nodes are probably passed in here by the rich text editor
          // @ts-ignore
          blockContentElement(child, field, imageCallback)
        ),
      }
    case 'p':
      return {
        type: 'paragraph',
        children: eat(content.children, field, imageCallback),
      }
    case 'ol':
    case 'ul':
      return {
        type: 'list',
        ordered: content.type === 'ol',
        spread: false,
        children: content.children.map((child) =>
          listItemElement(child, field, imageCallback)
        ),
      }
    default:
      throw new Error(
        `BlockContentElement: ${content.type} is not yet supported`
      )
  }
}

export type Marks = 'strong' | 'emphasis' | 'inlineCode'

export const getMarks = (content: Plate.InlineElement) => {
  const marks: Marks[] = []
  if (content.type !== 'text') {
    return []
  }
  if (content.bold) {
    marks.push('strong')
  }
  if (content.italic) {
    marks.push('emphasis')
  }
  if (content.code) {
    marks.push('inlineCode')
  }
  return marks
}
