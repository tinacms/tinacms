import { Token } from './types'
import { Schema } from 'prosemirror-model'

const RELREF_LINK_REGEX = /\[(.+)\]\((\{\{\<\srelref ".*"\s>\}\}\))/g

export const createHugoLinks = (state: any, tok: Token, schema: Schema) => {
  let match
  let start = 0
  const { link } = schema.marks
  const text = tok.content
  while ((match = RELREF_LINK_REGEX.exec(text)) !== null) {
    state.addText(text.substr(start, match.index))
    state.openMark(link.create({ href: match[2] }))
    state.addText(match[1])
    state.closeMark(link)
    start = match.index + match[0].length
  }
  if (start < text.length) state.addText(text.substr(start, text.length))
}
