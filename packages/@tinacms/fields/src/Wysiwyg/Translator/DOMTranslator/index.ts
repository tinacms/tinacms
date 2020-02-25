import { Schema, DOMParser as PDOMParser, Node } from "prosemirror-model"
import { DOMSerializer } from "./to_dom"
import { Translator } from "../Translator"

export class DOMTranslator extends Translator {
  schema: Schema
  parser: PDOMParser
  serializer: DOMSerializer

  constructor(schema: Schema) {
    super()
    this.schema = schema
    this.parser = PDOMParser.fromSchema(schema)
    this.serializer = DOMSerializer.fromSchema(schema)
  }

  static fromSchema(schema: Schema) {
    return new DOMTranslator(schema)
  }

  nodeFromString(value: string): Node {
    let al

    try {
      al = window.document.createRange().createContextualFragment(value)
    } catch (e) {
      al = new DOMParser().parseFromString(value, "text/html")
    }

    return this.parser.parse(al)
  }

  stringFromNode(node: Node): string {
    const el = document.createElement("div")

    el.appendChild(this.serializer.serializeFragment(node.content))

    return el.innerHTML
  }
}
