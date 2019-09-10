import { Schema, Node } from 'prosemirror-model'
import { MarkdownParser } from './from_markdown'
import { MarkdownSerializer } from './to_markdown'
import { CommonMarkParser, CommonMarkSerializer } from './commonmark'
// import { KramdownParser, KramdownSerializer} from "./kramdown"
// import { DiscountParser, DiscountSerializer} from "./discount"
import { Translator } from '../Translator'
enum MarkdownFlavour {
  Kramdown = 'kramdown',
  Discount = 'kramdown',
  CommonMark = 'commonmark',
}
interface Options {
  flavour?: MarkdownFlavour
}

export class MarkdownTranslator extends Translator {
  schema: Schema
  parser: MarkdownParser | null = null
  serializer: MarkdownSerializer | null = null

  constructor(schema: Schema) {
    super()
    this.schema = schema
  }

  static fromSchema(schema: Schema, options: Options) {
    return MarkdownTranslator.commonMarkFromSchema(schema)
  }

  static commonMarkFromSchema(schema: Schema) {
    let translator = new MarkdownTranslator(schema)
    translator.parser = CommonMarkParser(schema)
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
