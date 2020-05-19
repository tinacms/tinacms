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

import {
  InputRule,
  textblockTypeInputRule,
  wrappingInputRule,
} from 'prosemirror-inputrules'
import { MarkType, NodeType, Schema } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'

import { singleMarkCommand } from '../../Inline/commands'

const star = '\\*'
const double = (boundary: string) =>
  new RegExp(
    `${boundary}${boundary}([^\r\n\t\f${boundary}} ](.*[^\r\n\t\f${boundary} ])?)${boundary}${boundary}`
  )
const single = (boundary: string) =>
  new RegExp(
    `(^|[^${boundary}])${boundary}([^\r\n\t\f${boundary} ](.*[^\r\n\t\f${boundary} ])?)${boundary}`
  )

export const STRONG = double(star)
export const EM = single(star)
export const S = double('~')

export const EM_UNDERSCORE = single('_')
export const CODE = single('`')

export function buildInputRules(schema: Schema) {
  const rules = []
  let type: NodeType
  if ((type = schema.nodes.blockquote)) rules.push(blockQuoteRule(type))
  if ((type = schema.nodes.ordered_list)) rules.push(orderedListRule(type))
  if ((type = schema.nodes.bullet_list)) rules.push(bulletListRule(type))
  if ((type = schema.nodes.code_block)) rules.push(codeBlockRule(type))
  if ((type = schema.nodes.heading)) rules.push(headingRule(type, 6))
  if ((type = schema.nodes.horizontal_rule))
    rules.push(horizontalRuleRule(type))
  let mark: MarkType
  if ((mark = schema.marks.strong)) {
    rules.push(strongStarRule(mark))
    rules.push(strongUnderRule(mark))
  }
  if ((mark = schema.marks.strike)) {
    rules.push(strikethroughRule(mark))
  }
  if ((mark = schema.marks.em)) {
    rules.push(emStarRule(mark))
    rules.push(emUnderRule(mark))
  }
  if ((mark = schema.marks.code)) rules.push(codeRule(mark))
  return rules
}

function markInputRule(regexp: RegExp, markType: MarkType, getAttrs: any) {
  return new InputRule(regexp, ((
    state: EditorState,
    match: string[],
    start: number,
    end: number
  ) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs
    const tr = state.tr

    if (match[1]) {
      const textStart = start + match[0].indexOf(match[1])
      const textEnd = textStart + match[1].length
      if (textEnd < end) tr.delete(textEnd, end)
      if (textStart > start) tr.delete(start, textStart)
      end = start + match[1].length
    }

    tr.addMark(start, end, markType.create(attrs))
    tr.removeStoredMark(markType)
    return tr
  }) as any) // todo: the typing broke this
}

function singleMarkInputRule(
  regexp: RegExp,
  markType: MarkType,
  getAttrs: any
) {
  const command = singleMarkCommand(markType, getAttrs)
  return new InputRule(regexp, ((
    state: EditorState,
    match: any,
    start: number,
    end: number
  ) => {
    return command(state, null, match, start, end)
  }) as any) // todo: broke by new typings
}

export function strongStarRule(markType: MarkType) {
  return markInputRule(STRONG, markType, {})
}

export function strikethroughRule(markType: MarkType) {
  return markInputRule(S, markType, {})
}

export function strongUnderRule(markType: MarkType) {
  return markInputRule(double('_'), markType, {})
}

export function emStarRule(markType: MarkType) {
  return singleMarkInputRule(EM, markType, {})
}

export function emUnderRule(markType: MarkType) {
  return singleMarkInputRule(EM_UNDERSCORE, markType, {})
}

export function codeRule(markType: MarkType) {
  return singleMarkInputRule(CODE, markType, {})
}

// : (NodeType) → InputRule
// Given a blockquote node type, returns an input rule that turns `"> "`
// at the start of a textblock into a blockquote.
export function blockQuoteRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*>\s$/, nodeType)
}

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a number
// followed by a dot at the start of a textblock into an ordered list.
export function orderedListRule(nodeType: NodeType) {
  return wrappingInputRule(
    /^(\d+)\.\s$/,
    nodeType,
    match => ({ order: +match[1] }),
    (match, node) => node.childCount + node.attrs.order == +match[1]
  )
}

export function horizontalRuleRule(nodeType: NodeType) {
  return new InputRule(/^(---|___|\*\*\*)$/, (state, _match, start, end) => {
    return state.tr.replaceRangeWith(start, end, nodeType.create()) as any
  })
}

// : (NodeType) → InputRule
// Given a list node type, returns an input rule that turns a bullet
// (dash, plush, or asterisk) at the start of a textblock into a
// bullet list.
export function bulletListRule(nodeType: NodeType) {
  return wrappingInputRule(/^\s*([-+*])\s$/, nodeType)
}

// : (NodeType) → InputRule
// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
export function codeBlockRule(nodeType: NodeType) {
  return textblockTypeInputRule(/^```([a-zA-Z]*)? $/, nodeType, match => {
    const language = match[1]
    if (language) {
      return { params: language }
    }
    return {}
  })
}

// : (NodeType, number) → InputRule
// Given a node type and a maximum level, creates an input rule that
// turns up to that number of `#` characters followed by a space at
// the start of a textblock into a heading whose level corresponds to
// the number of `#` signs.
export function headingRule(nodeType: NodeType, maxLevel: number) {
  return textblockTypeInputRule(
    new RegExp('^(#{1,' + maxLevel + '})\\s$'),
    nodeType,
    match => ({
      level: match[1].length,
    })
  )
}
