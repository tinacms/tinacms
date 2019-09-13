import { imsize } from '../markdown-it-plugins/markdown-it-imsize'
import { link } from '../markdown-it-plugins/markdown-it-links'
// @ts-ignore
import { MarkdownParser } from '../from_markdown'
import { Schema } from 'prosemirror-model'
import { buildTokensForSchema } from './tokens'

const markdownit = require('markdown-it')

export function CommonMarkParser(schema: Schema) {
  const parser = markdownit({ html: false })
  parser.use(imsize)
  parser.use(link)
  return new MarkdownParser(schema, parser, buildTokensForSchema(schema))
}
