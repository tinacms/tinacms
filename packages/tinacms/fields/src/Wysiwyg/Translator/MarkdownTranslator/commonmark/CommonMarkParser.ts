import { imsize } from '../markdown-it-plugins/markdown-it-imsize'
import { link } from '../markdown-it-plugins/markdown-it-links'
// @ts-ignore
import * as markdownit from 'markdown-it'
import { MarkdownParser } from '../from_markdown'
import { Schema } from 'prosemirror-model'
import { buildTokensForSchema } from './tokens'

export function CommonMarkParser(schema: Schema) {
  const parser = markdownit({ html: false })
  parser.use(imsize)
  parser.use(link)
  return new MarkdownParser(schema, parser, buildTokensForSchema(schema))
}
