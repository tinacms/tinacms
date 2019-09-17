import { inputRules as pmInputRules } from "prosemirror-inputrules"
import { buildInputRules } from "./inputRules"
import { Schema } from "prosemirror-model"

export * from "./inputRules"

export function inputRules(schema: Schema) {
  return pmInputRules({ rules: buildInputRules(schema) })
}
