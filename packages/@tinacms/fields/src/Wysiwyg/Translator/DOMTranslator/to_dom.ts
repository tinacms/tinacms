import {DOMSerializer as _DOMSerializer, Schema, Node} from "prosemirror-model"

export class DOMSerializer extends _DOMSerializer {
  static nodesFromSchema(schema: Schema) {
    let result = gatherToDOM(schema.nodes)
    if (!result.text) result.text = (node: Node) => node.text
    return result
  }
  static marksFromSchema(schema: Schema) {
    return gatherToDOM(schema.marks)
  }
}

function gatherToDOM(obj: any): any {
  let result: any = {}
  for (let name in obj) {
    let toDocument = obj[name].spec.toDocument
    let toDOM = obj[name].spec.toDOM
    if (toDocument) result[name] = toDocument
    else if (toDOM) result[name] = toDOM
  }
  return result
}