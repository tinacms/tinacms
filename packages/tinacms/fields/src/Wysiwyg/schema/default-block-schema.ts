import { Schema } from 'prosemirror-model'
import { NODES } from './nodes'
import { buildMarks } from './marks'

export const defaultBlockSchema = new Schema({
  nodes: NODES,
  marks: buildMarks({
    code: true,
    link: true,
    strong: true,
    em: true,
    s: true,
  }),
} as any)
