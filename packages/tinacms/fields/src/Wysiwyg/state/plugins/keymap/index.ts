import { keymap as _keymap } from "prosemirror-keymap"
import { buildKeymap } from "./keymap"
import { Schema } from "prosemirror-model"

export * from "./keymap"

export function keymap(schema: Schema, blockContent: boolean) {
  return _keymap(buildKeymap(schema, blockContent))
}
