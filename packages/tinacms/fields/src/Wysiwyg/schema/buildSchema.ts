import { Schema } from "prosemirror-model"
import { buildNodes, NodesOptions } from "./nodes"
import { buildMarks, MarksOptions } from "./marks"

interface SchemaOptions {
  blockContent: boolean
  nodes: NodesOptions
  marks: MarksOptions
}

const DEFAULT_OPTIONS: SchemaOptions = {
  blockContent: true,
  marks: {
    code: true,
    link: true,
    strong: true,
    em: true,
    underline: true,
    custom: true,
    s: true,
  },
  nodes: {
    code_block: true,
    blockquote: true,
    horizontal_rule: true,
    heading: true,
    image: false,
    table: true,
  },
}

export function buildSchema(options: SchemaOptions = DEFAULT_OPTIONS) {
  return new Schema({
    nodes: buildNodes(options.blockContent, options.nodes),
    marks: buildMarks(options.marks),
  } as any)
}
