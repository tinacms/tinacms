/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import {
  DOMSerializer as _DOMSerializer,
  Schema,
  Node,
} from 'prosemirror-model'

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
