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

import { Schema, DOMParser as PDOMParser, Node } from 'prosemirror-model'
import { DOMSerializer } from './to_dom'
import { Translator } from '../Translator'

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
      al = new DOMParser().parseFromString(value, 'text/html')
    }

    return this.parser.parse(al)
  }

  stringFromNode(node: Node): string {
    const el = document.createElement('div')

    el.appendChild(this.serializer.serializeFragment(node.content))

    return el.innerHTML
  }
}
