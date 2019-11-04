/**

Copyright 2019 Forestry.io Inc

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

import { Token } from '../types'
import { Schema, Mark, Node } from 'prosemirror-model'
import { MarkdownSerializerState, Nodes } from '../to_markdown'

const get = require('lodash.get')
interface Hash<T> {
  [key: string]: T
}

const ALIGN_STYLES: any = {
  ['text-align:left']: 'left',
  ['text-align:center']: 'center',
  ['text-align:right']: 'right',
}

const ALIGN_DASHES: any = {
  left: ':---',
  center: ':---:',
  right: '---:',
}

const TOKENS = {
  blockquote: { block: 'blockquote' },
  paragraph: { block: 'paragraph' },
  list_item: { block: 'list_item' },
  bullet_list: { block: 'bullet_list' },
  ordered_list: {
    block: 'ordered_list',
    getAttrs: (tok: Token) => ({ order: +tok.attrGet('order') || 1 }),
  },
  heading: {
    block: 'heading',
    getAttrs: (tok: Token) => ({ level: +tok.tag.slice(1) }),
  },
  code_block: { block: 'code_block' },
  fence: {
    block: 'code_block',
    getAttrs: (tok: Token) => ({ params: tok.info || '' }),
  },
  hr: { node: 'horizontal_rule' },
  image: {
    node: 'image',
    getAttrs: (tok: Token) => ({
      src: tok.attrGet('src'),
      title: tok.attrGet('title') || null,
      alt: (tok.children[0] && tok.children[0].content) || null,
      width: tok.attrGet('width') || null,
      height: tok.attrGet('height') || null,
    }),
  },
  table: {
    block: 'table',
  },
  table_row: { block: 'table_row' },
  table_cell: {
    block: 'table_cell',
    getAttrs(tok: Token) {
      let style: string = ''

      if (tok.attrs) {
        for (let i = 0; i < tok.attrs.length; i++) {
          if (tok.attrs[i][0] === 'style') {
            style = tok.attrs[i][1]
          }
        }
      }

      return { align: ALIGN_STYLES[style] }
    },
  },
  table_header: {
    block: 'table_header',
    getAttrs(tok: Token) {
      let style: string = ''
      if (tok.attrs) {
        for (let i = 0; i < tok.attrs.length; i++) {
          if (tok.attrs[i][0] === 'style') {
            style = tok.attrs[i][1]
          }
        }
      }

      return { align: ALIGN_STYLES[style] }
    },
  },
  hardbreak: { node: 'hard_break' },
  em: { mark: 'em' },
  s: { mark: 's' },
  strong: { mark: 'strong' },
  link: {
    mark: 'link',
    getAttrs: (tok: Token) => ({
      href: tok.attrGet('href'),
      title: tok.attrGet('title') || null,
    }),
  },
  code_inline: { mark: 'code' },
}

const NODES: Nodes = {
  blockquote(state: MarkdownSerializerState, node: Node) {
    state.wrapBlock('> ', null, node, () => state.renderContent(node))
  },
  code_block(state: MarkdownSerializerState, node: Node) {
    if (!node.attrs.params) {
      state.wrapBlock('    ', null, node, () =>
        state.text(node.textContent, false)
      )
    } else {
      state.write('```' + node.attrs.params + '\n')
      state.text(node.textContent, false)
      state.ensureNewLine()
      state.write('```')
      state.closeBlock(node)
    }
  },
  heading(state: MarkdownSerializerState, node: Node) {
    if (/\n/.test(node.textContent) && node.attrs.level < 3) {
      state.renderInline(node)
      state.write('\n')
      state.write(node.attrs.level === 1 ? '=' : '-')
    } else {
      state.write(state.repeat('#', node.attrs.level) + ' ')
      state.renderInline(node)
    }
    state.closeBlock(node)
  },
  horizontal_rule(state: MarkdownSerializerState, node: Node) {
    state.write(node.attrs.markup || '***')
    state.closeBlock(node)
  },
  bullet_list(state: MarkdownSerializerState, node: Node) {
    state.renderList(node, '  ', () => (node.attrs.bullet || '*') + ' ')
  },
  ordered_list(state: MarkdownSerializerState, node: Node) {
    const start = node.attrs.order || 1
    const maxW = String(start + node.childCount - 1).length
    const space = state.repeat(' ', maxW + 2)
    state.renderList(node, space, i => {
      const nStr = String(start + i)
      return state.repeat(' ', maxW - nStr.length) + nStr + '. '
    })
  },
  list_item(state: MarkdownSerializerState, node: Node) {
    state.renderContent(node)
  },

  paragraph(
    state: MarkdownSerializerState,
    node: Node,
    _parent?: Node,
    _index?: number
  ) {
    state.renderInline(node)
    state.closeBlock(node)
  },

  image(state: MarkdownSerializerState, node: Node) {
    let size: string = ''
    if (node.attrs.height || node.attrs.width) {
      size = ` =${node.attrs.width || ''}x${node.attrs.height || ''}`
    }
    const alt = state.esc(node.attrs.alt || '')
    const src = state.esc(node.attrs.src)
    const title = node.attrs.title ? ' ' + state.quote(node.attrs.title) : ''
    state.write(`![${alt}](${src}${title}${size})`)
  },

  hard_break(
    state: MarkdownSerializerState,
    node: Node,
    parent?: Node,
    index?: number
  ) {
    if (!parent || typeof index !== 'number') return;
    for (let i = index + 1; i < parent.childCount; i++)
      if (parent.child(i).type != node.type) {
        state.write('  \n')
        return
      }
  },
  text(state: MarkdownSerializerState, node: Node) {
    if (typeof node.text !== 'string') return
    state.text(node.text)
  },
  table(state: MarkdownSerializerState, node: Node) {
    let inHead = true

    node.forEach(row => {
      const nextRowIsInBody = row.content.child(0).type.name === 'table_cell'

      if (inHead && nextRowIsInBody) {
        state.write('|')
        for (let i = 0; i < row.childCount; i++) {
          const align = row.content.child(i).attrs.align
          const dash = ALIGN_DASHES[align] || '---'
          state.write(` ${dash} |`)
        }
        state.write('\n')
        inHead = false
      }

      NODES.table_row(state, row)
    })

    state.closeBlock(node)
  },
  table_row(state: MarkdownSerializerState, node: Node) {
    state.write('|')
    state.renderContent(node)
    state.write('\n')
  },
  table_cell(state: MarkdownSerializerState, node: Node) {
    state.write(' ')
    /**
     * So only in the case of table's are pipes escaped.
     * Rather then try to refactor the to_markdown.ts file so
     * that more things can be escaped, I inlined state.renderContent
     * and assumed it will always render as text, then inlined the
     * state.text method and added the replacement.
     */
    node.forEach((n, _, _i) => {
      const lines = n.text ? n.text.split('\n') : []
      for (let i = 0; i < lines.length; i++) {
        const startOfLine = state.atBlank() || state.closed
        state.write()
        state.out += state.esc(lines[i], startOfLine).replace(/[\|]/g, '\\$&')
        if (i != lines.length - 1) state.out += '\n'
      }
    })
    state.write(' |')
  },
  table_header(state: MarkdownSerializerState, node: Node) {
    NODES.table_cell(state, node)
  },
}

const MARKS = {
  em: {
    open: '_',
    close: '_',
    mixable: true,
    expelEnclosingWhitespace: true,
  },
  strong: {
    open(
      _state: MarkdownSerializerState,
      mark: Mark & { openedWith: string },
      node: Node | null
    ) {
      if (get(node, 'text', '').endsWith('*')) return (mark.openedWith = '__')
      return '**'
    },
    close(
      _state: MarkdownSerializerState,
      mark: Mark & { openedWith: string | null },
      node: Node | null
    ) {
      if (mark.openedWith) {
        const closeWith = mark.openedWith
        mark.openedWith = null
        return closeWith
      }
      if (get(node, 'text', '').endsWith('*')) return '__'
      return '**'
    },
    mixable: true,
    expelEnclosingWhitespace: true,
  },
  link: {
    open: '[',
    close(state: MarkdownSerializerState, mark: Mark) {
      return (
        '](' +
        state.esc(mark.attrs.href) +
        (mark.attrs.title ? ' ' + state.quote(mark.attrs.title) : '') +
        ')'
      )
    },
  },
  s: {
    open: '~~',
    close: '~~',
    mixable: true,
    expelEnclosingWhitespace: true,
  },
  code: { open: '`', close: '`', escape: false },
}

export function buildTokensForSchema(schema: Schema): Hash<Token> {
  const tokens: Hash<Token> = {}

  if (schema.nodes.blockquote) tokens.blockquote = TOKENS.blockquote
  if (schema.nodes.paragraph) tokens.paragraph = TOKENS.paragraph
  if (schema.nodes.list_item) tokens.list_item = TOKENS.list_item
  if (schema.nodes.bullet_list) tokens.bullet_list = TOKENS.bullet_list
  if (schema.nodes.ordered_list) tokens.ordered_list = TOKENS.ordered_list
  if (schema.nodes.heading) tokens.heading = TOKENS.heading
  if (schema.nodes.code_block) {
    tokens.code_block = TOKENS.code_block
    tokens.fence = TOKENS.fence
  }
  if (schema.nodes.horizontal_rule) tokens.hr = TOKENS.hr
  if (schema.nodes.image) tokens.image = TOKENS.image
  if (schema.nodes.hard_break) tokens.hardbreak = TOKENS.hardbreak
  if (schema.nodes.ordered_list) tokens.ordered_list = TOKENS.ordered_list
  if (schema.nodes.bullet_list) tokens.bullet_list = TOKENS.bullet_list
  if (schema.nodes.list_item) tokens.list_item = TOKENS.list_item
  if (schema.nodes.table) {
    tokens.table = TOKENS.table
    tokens.thead = { ignore: true }
    tokens.th = TOKENS.table_header

    tokens.tbody = { ignore: true }
    tokens.tr = TOKENS.table_row

    tokens.td = TOKENS.table_cell
  }
  if (schema.marks.em) tokens.em = TOKENS.em
  if (schema.marks.strong) tokens.strong = TOKENS.strong
  if (schema.marks.link) tokens.link = TOKENS.link
  if (schema.marks.code) tokens.code_inline = TOKENS.code_inline
  if (schema.marks.s) tokens.s = TOKENS.s

  return tokens
}

export function buildNodesFromSchema(schema: Schema): Nodes {
  const nodes: Nodes = {}

  if (schema.nodes.blockquote) nodes.blockquote = NODES.blockquote
  if (schema.nodes.paragraph) nodes.paragraph = NODES.paragraph
  if (schema.nodes.list_item) nodes.list_item = NODES.list_item
  if (schema.nodes.bullet_list) nodes.bullet_list = NODES.bullet_list
  if (schema.nodes.ordered_list) nodes.ordered_list = NODES.ordered_list
  if (schema.nodes.heading) nodes.heading = NODES.heading
  if (schema.nodes.code_block) nodes.code_block = NODES.code_block
  if (schema.nodes.horizontal_rule)
    nodes.horizontal_rule = NODES.horizontal_rule
  if (schema.nodes.image) nodes.image = NODES.image
  if (schema.nodes.hard_break) nodes.hard_break = NODES.hard_break
  if (schema.nodes.ordered_list) nodes.ordered_list = NODES.ordered_list
  if (schema.nodes.bullet_list) nodes.bullet_list = NODES.bullet_list
  if (schema.nodes.list_item) nodes.list_item = NODES.list_item
  if (schema.nodes.table) {
    nodes.table = NODES.table
    nodes.table_header = NODES.table_header
    nodes.table_row = NODES.table_row
    nodes.table_cell = NODES.table_cell
  }

  nodes.text = NODES.text

  return nodes
}

export function buildMarksFromSchema(schema: Schema) {
  const marks: any = {}
  if (schema.marks.em) marks.em = MARKS.em
  if (schema.marks.strong) marks.strong = MARKS.strong
  if (schema.marks.link) marks.link = MARKS.link
  if (schema.marks.code) marks.code = MARKS.code
  return MARKS
}
