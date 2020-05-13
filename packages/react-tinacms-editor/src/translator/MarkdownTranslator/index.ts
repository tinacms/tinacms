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

import { Schema, Node } from 'prosemirror-model'
import { MarkdownParser } from './from_markdown'
import { MarkdownSerializer } from './to_markdown'
import { CommonMarkParser, CommonMarkSerializer } from './commonmark'
import { TranslatorClass } from '../TranslatorClass'

export class MarkdownTranslator extends TranslatorClass {
  schema: Schema
  supportHugo: boolean
  parser: MarkdownParser | null = null
  serializer: MarkdownSerializer | null = null

  constructor(schema: Schema, supportHugo: boolean) {
    super()
    this.schema = schema
    this.supportHugo = supportHugo
  }

  static fromSchema(schema: Schema, supportHugo: boolean) {
    return MarkdownTranslator.commonMarkFromSchema(schema, supportHugo)
  }

  static commonMarkFromSchema(schema: Schema, supportHugo: boolean) {
    const translator = new MarkdownTranslator(schema, supportHugo)
    translator.parser = CommonMarkParser(schema, supportHugo)
    translator.serializer = CommonMarkSerializer(schema)
    return translator
  }

  nodeFromString(value: string): Node | null {
    return this.parser!.parse(value) as Node | null
  }

  stringFromNode(node: Node): string {
    return this.serializer!.serialize(node, {
      tightLists: true,
    })
  }
}
