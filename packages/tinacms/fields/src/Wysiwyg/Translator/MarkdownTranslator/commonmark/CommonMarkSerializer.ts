// :: MarkdownSerializer
// A serializer for the [basic schema](#schema).
import { MarkdownSerializer } from "../to_markdown"
import { Schema } from "prosemirror-model"
import { buildMarksFromSchema, buildNodesFromSchema } from "./tokens"

export function CommonMarkSerializer(schema: Schema) {
  return new MarkdownSerializer(
    buildNodesFromSchema(schema),
    // @ts-ignore
    buildMarksFromSchema(schema)
  )
}
