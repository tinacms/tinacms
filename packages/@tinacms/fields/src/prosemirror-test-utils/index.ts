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

import { Node, Schema, Mark } from "prosemirror-model"
import { NodeSelection, TextSelection, Selection, EditorState, Transaction } from "prosemirror-state"

interface Dispatch {
  (tr: Transaction): void
}

interface Command {
  (state: EditorState, dispatch: Dispatch | null, ...args: any[]): boolean | Transaction | null
}

interface LinkAttrs {
  href: string
  title?: string
  editing?: "editing" | ""
  creating?: "creating" | ""
}

interface ImageAttrs {
  src: string
  title?: string
  alt?: string
  align?: "left" | "right" | "center" | ""
}

export class PMTestHarness {
  private state: EditorState

  constructor(private schema: Schema) {
    this.state = EditorState.create({
      schema: this.schema,
    })
  }

  private setDoc = (doc?: Node, selection?: Selection) => {
    this.state = EditorState.create({
      schema: this.schema,
      doc,
      selection,
    })
  }

  private get nodes() {
    return this.state.schema.nodes
  }

  private get marks() {
    return this.state.schema.marks
  }

  forDoc = (doc: Node) => {
    this.setDoc(doc)
    return this
  }

  withTextSelection = (from: number, to?: number) => {
    to = typeof to == "undefined" ? from : to
    this.setDoc(this.state.doc, TextSelection.create(this.state.doc, from, to))
    return this
  }

  withNodeSelection = (at: number) => {
    this.setDoc(this.state.doc, NodeSelection.near(this.state.doc.resolve(at)))
    return this
  }

  apply = (command: Command, ...args: any[]) => {
    command(this.state, tr => (this.state = this.state.apply(tr)), ...args)
    return this
  }

  expect = (result: Node) => {
    expect(this.state.doc).toEqual(result)
    return this
  }

  shouldNotRun = (command: Command, ...args: any[]) => {
    const shouldRun = command(this.state, null, ...args)

    expect(shouldRun).toBeFalsy()
  }

  /**
   * Creates a new `doc` node with the given content.
   */
  doc = (...content: Node[]): Node => {
    return this.nodes.doc.create({}, content, [])
  }

  /**
   * Creates a new `paragraph` node with the given content.
   */
  p = (...content: Node[]) => {
    return this.nodes.paragraph.create({}, content)
  }

  /**
   * Creates a new `ordered list` node with the given content.
   */
  orderedList = (...content: Node[]) => {
    return this.nodes.ordered_list.create({}, content)
  }

  /**
   * Creates a new `bullet List` node with the given content.
   */
  bulletList = (...content: Node[]) => {
    return this.nodes.bullet_list.create({}, content)
  }

  /**
   * Creates a new `block quote` node with the given content.
   */
  blockquote = (...content: Node[]) => {
    return this.nodes.blockquote.create({}, content)
  }

  /**
   * Creates a new `text` node with a `link` mark.
   */
  link = (content: string, attrs: LinkAttrs) => {
    const _attrs = { creating: "", editing: "", ...attrs }
    const mark = this.marks.link.create(_attrs)
    return this.text(content, [mark])
  }

  strong = (content: string) => {
    const mark = this.marks.strong.create()
    return this.text(content, [mark])
  }

  em = (content: string) => {
    const mark = this.marks.em.create()
    return this.text(content, [mark])
  }

  /**
   * Creates a new `text` node with the given marks.
   */
  text = (content: string, marks: Mark[] = []) => {
    return this.state.schema.text(content, marks)
  }

  image = (attrs: ImageAttrs) => {
    const _attrs = { alt: "", title: "", ...attrs }
    return this.nodes.image.create(_attrs)
  }

  hr = () => this.nodes.horizontal_rule.create()

  heading = (level: number, ...nodes: Node[]) => this.nodes.heading.create({ level }, nodes)
}
