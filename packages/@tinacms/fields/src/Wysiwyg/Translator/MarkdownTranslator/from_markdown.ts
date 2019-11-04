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

import { Mark, MarkType, Node, NodeType, Schema } from 'prosemirror-model'
import { Token } from './types'

function maybeMerge(a: any, b: any) {
  if (a.isText && b.isText && Mark.sameSet(a.marks, b.marks))
    return a.copy(a.text + b.text)
}

interface TokenHandlers {
  [key: string]: (state: MarkdownParseState, token: Token) => void
}

// Object used to track the context of a running parse.
class MarkdownParseState {
  schema: Schema
  stack: { type: NodeType; content: any[]; attrs?: object }[]
  marks: Mark[]
  tokenHandlers: TokenHandlers
  constructor(schema: Schema, tokenHandlers: TokenHandlers) {
    this.schema = schema
    this.stack = [{ type: schema.topNodeType, content: [] }]
    this.marks = Mark.none
    this.tokenHandlers = tokenHandlers
  }

  top() {
    return this.stack[this.stack.length - 1]
  }

  push(elt: any) {
    if (this.stack.length) this.top().content.push(elt)
  }

  // : (string)
  // Adds the given text to the current position in the document,
  // using the current marks as styling.
  addText(text: string) {
    if (!text) return
    const nodes = this.top().content,
      last = nodes[nodes.length - 1],
      node = this.schema.text(text, this.marks)

    let merged

    if (last && (merged = maybeMerge(last, node)))
      nodes[nodes.length - 1] = merged
    else nodes.push(node)
  }

  // : (Mark)
  // Adds the given mark to the set of active marks.
  openMark(mark: Mark) {
    this.marks = mark.addToSet(this.marks)
  }

  // : (Mark)
  // Removes the given mark from the set of active marks.
  closeMark(mark: MarkType) {
    this.marks = mark.removeFromSet(this.marks)
  }

  parseTokens(toks: Token[]) {
    for (let i = 0; i < toks.length; i++) {
      const tok = toks[i]
      const handler = this.tokenHandlers[tok.type]
      if (!handler)
        throw new Error(
          'Token type `' + tok.type + '` not supported by Markdown parser'
        )
      handler(this, tok)
    }
  }

  // : (NodeType, ?Object, ?[Node]) → ?Node
  // Add a node at the current position.
  addNode(type: NodeType, attrs?: object, content?: Node[]) {
    const node = type.createAndFill(attrs, content, this.marks)
    if (!node) return null
    this.push(node)
    return node
  }

  // : (NodeType, ?Object)
  // Wrap subsequent content in a node of the given type.
  openNode(type: NodeType, attrs?: object) {
    this.stack.push({ type: type, attrs, content: [] })
  }

  // : () → ?Node
  // Close and return the node that is currently on top of the stack.
  closeNode() {
    if (this.marks.length) this.marks = Mark.none
    const info = this.stack.pop()
    if (!info) return //devWarn("Attempted to close a non-existent node.")
    return this.addNode(info.type, info.attrs, info.content)
  }
}

function attrs(spec: any, token: Token) {
  if (spec.getAttrs) return spec.getAttrs(token)
  // For backwards compatibility when `attrs` is a Function
  else if (spec.attrs instanceof Function) return spec.attrs(token)
  else return spec.attrs
}

// Code content is represented as a single token with a `content`
// property in Markdown-it.
function noOpenClose(type: String) {
  return type == 'code_inline' || type == 'code_block' || type == 'fence'
}

function withoutTrailingNewline(str: string) {
  return str[str.length - 1] == '\n' ? str.slice(0, str.length - 1) : str
}

function noOp() {}

type THSchema = any

interface Hash<T> {
  [key: string]: T
}

function tokenHandlers(schema: THSchema, tokens: Hash<Token>) {
  const handlers = Object.create(null)
  for (const type in tokens) {
    const spec = tokens[type]
    if (spec.block) {
      const nodeType = schema.nodeType(spec.block)
      if (noOpenClose(type)) {
        handlers[type] = (state: MarkdownParseState, tok: Token) => {
          state.openNode(nodeType, attrs(spec, tok))
          state.addText(withoutTrailingNewline(tok.content))
          state.closeNode()
        }
      } else {
        handlers[type + '_open'] = (state: MarkdownParseState, tok: Token) =>
          state.openNode(nodeType, attrs(spec, tok))
        handlers[type + '_close'] = (state: MarkdownParseState) =>
          state.closeNode()
      }
    } else if (spec.node) {
      const nodeType = schema.nodeType(spec.node)
      handlers[type] = (state: MarkdownParseState, tok: Token) =>
        state.addNode(nodeType, attrs(spec, tok))
    } else if (spec.mark) {
      const markType = schema.marks[spec.mark]
      if (noOpenClose(type)) {
        handlers[type] = (state: MarkdownParseState, tok: Token) => {
          state.openMark(markType.create(attrs(spec, tok)))
          state.addText(withoutTrailingNewline(tok.content))
          state.closeMark(markType)
        }
      } else {
        handlers[type + '_open'] = (state: MarkdownParseState, tok: Token) =>
          state.openMark(markType.create(attrs(spec, tok)))
        handlers[type + '_close'] = (state: MarkdownParseState) =>
          state.closeMark(markType)
      }
    } else if (spec.ignore) {
      if (noOpenClose(type)) {
        handlers[type] = noOp
      } else {
        handlers[type + '_open'] = noOp
        handlers[type + '_close'] = noOp
      }
    } else {
      throw new RangeError('Unrecognized parsing spec ' + JSON.stringify(spec))
    }
  }

  handlers.text = (state: MarkdownParseState, tok: Token) =>
    state.addText(tok.content)
  handlers.inline = (state: MarkdownParseState, tok: Token) =>
    state.parseTokens(tok.children)
  handlers.softbreak = (state: MarkdownParseState) => state.addText('\n')

  return handlers
}

// ::- A configuration of a Markdown parser. Such a parser uses
// [markdown-it](https://github.com/markdown-it/markdown-it) to
// tokenize a file, and then runs the custom rules it is given over
// the tokens to create a ProseMirror document tree.
export class MarkdownParser {
  tokens: Hash<Token>
  schema: Schema
  tokenizer: any
  tokenHandlers: TokenHandlers
  // :: (Schema, MarkdownIt, Object)
  // Create a parser with the given configuration. You can configure
  // the markdown-it parser to parse the dialect you want, and provide
  // a description of the ProseMirror entities those tokens map to in
  // the `tokens` object, which maps token names to descriptions of
  // what to do with them. Such a description is an object, and may
  // have the following properties:
  //
  // **`node`**`: ?string`
  //   : This token maps to a single node, whose type can be looked up
  //     in the schema under the given name. Exactly one of `node`,
  //     `block`, or `mark` must be set.
  node?: string
  //
  // **`block`**`: ?string`
  //   : This token comes in `_open` and `_close` variants (which are
  //     appended to the base token name provides a the object
  //     property), and wraps a block of content. The block should be
  //     wrapped in a node of the type named to by the property's
  //     value.
  block?: string
  //
  // **`mark`**`: ?string`
  //   : This token also comes in `_open` and `_close` variants, but
  //     should add a mark (named by the value) to its content, rather
  //     than wrapping it in a node.
  mark?: string
  //
  // **`attrs`**`: ?Object`
  //   : Attributes for the node or mark. When `getAttrs` is provided,
  //     it takes precedence.
  attrs?: object
  //
  // **`getAttrs`**`: ?(MarkdownToken) → Object`
  //   : A function used to compute the attributes for the node or mark
  //     that takes a [markdown-it
  //     token](https://markdown-it.github.io/markdown-it/#Token) and
  //     returns an attribute object.
  //
  // **`ignore`**`: ?bool`
  //   : When true, ignore content for the matched token.
  constructor(schema: Schema, tokenizer: any, tokens: Hash<Token>) {
    // :: Object The value of the `tokens` object used to construct
    // this parser. Can be useful to copy and modify to base other
    // parsers on.
    this.tokens = tokens
    this.schema = schema
    this.tokenizer = tokenizer
    this.tokenHandlers = tokenHandlers(schema, tokens)
  }

  // :: (string) → Node
  // Parse a string as [CommonMark](http://commonmark.org/) markup,
  // and create a ProseMirror document as prescribed by this parser's
  // rules.
  parse(text: string) {
    const state = new MarkdownParseState(this.schema, this.tokenHandlers)
    let doc
    state.parseTokens(this.tokenizer.parse(text, {}))
    do {
      doc = state.closeNode()
    } while (state.stack.length)
    return doc
  }
}
