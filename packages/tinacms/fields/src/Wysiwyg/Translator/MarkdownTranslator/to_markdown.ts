// ::- A specification for serializing a ProseMirror document as
// Markdown/CommonMark text.
import { Mark, Node } from 'prosemirror-model'

interface Hash<T> {
  [key: string]: T
}

interface MarkSerializer {
  open:
    | string
    | ((state: MarkdownSerializerState, mark: any, node: Node | null) => string)
  close:
    | string
    | ((state: MarkdownSerializerState, mark: any, node: Node | null) => string)
  mixable?: boolean
  expelEnclosingWhitespace?: boolean
}

export interface Nodes {
  [key: string]: (
    state: MarkdownSerializerState,
    node: Node,
    parent?: Node,
    index?: number
  ) => void
}

export class MarkdownSerializer {
  // :: (Object<(state: MarkdownSerializerState, node: Node, parent: Node, index: number)>, Object)

  // Construct a serializer with the given configuration. The `nodes`
  // object should map node names in a given schema to function that
  // take a serializer state and such a node, and serialize the node.
  //
  // The `marks` object should hold objects with `open` and `close`
  // properties, which hold the strings that should appear before and
  // after a piece of text marked that way, either directly or as a
  // function that takes a serializer state and a mark, and returns a
  // string.
  //
  // Mark information objects can also have a `mixable` property
  // which, when `true`, indicates that the order in which the mark's
  // opening and closing syntax appears relative to other mixable
  // marks can be varied. (For example, you can say `**a *b***` and
  // `*a **b***`, but not `` `a *b*` ``.)
  //
  // The `expelEnclosingWhitespace` mark property causes the
  // serializer to move enclosing whitespace from inside the marks to
  // outside the marks. This is necessary for emphasis marks as
  // CommonMark does not permit enclosing whitespace inside emphasis
  // marks, see: http://spec.commonmark.org/0.26/#example-330
  nodes: Nodes
  marks: Hash<MarkSerializer>
  constructor(nodes: Nodes, marks: Hash<MarkSerializer>) {
    // :: Object<(MarkdownSerializerState, Node)> The node serializer
    // functions for this serializer.
    this.nodes = nodes
    // :: Object The mark serializer info.
    this.marks = marks
  }

  // :: (Node, ?Object) → string
  // Serialize the content of the given node to
  // [CommonMark](http://commonmark.org/).
  serialize(content: Node, options: object = {}) {
    let state = new MarkdownSerializerState(this.nodes, this.marks, options)
    state.renderContent(content)
    return state.out
  }
}

interface MarkdownSerializerStateOptions {
  tightLists?: boolean
}

// ::- This is an object used to track state and expose
// methods related to markdown serialization. Instances are passed to
// node and mark serialization methods (see `toMarkdown`).
export class MarkdownSerializerState {
  nodes: Nodes
  marks: Hash<MarkSerializer>
  out: string
  delim: string
  closed: false | Node
  inTightList: boolean
  options: MarkdownSerializerStateOptions

  constructor(
    nodes: Nodes,
    marks: Hash<MarkSerializer>,
    options: MarkdownSerializerStateOptions
  ) {
    this.nodes = nodes
    this.marks = marks
    this.delim = this.out = ''
    this.closed = false
    this.inTightList = false
    // :: Object
    // The options passed to the serializer.
    //   tightLists:: ?bool
    //   Whether to render lists in a tight style. This can be overridden
    //   on a node level by specifying a tight attribute on the node.
    //   Defaults to false.
    this.options = options || {}
    if (typeof this.options.tightLists == 'undefined')
      this.options.tightLists = false
  }

  flushClose(size?: number) {
    if (this.closed) {
      if (!this.atBlank()) this.out += '\n'
      if (size == null) size = 2
      if (size > 1) {
        let delimMin = this.delim
        let trim = /\s+$/.exec(delimMin)
        if (trim) delimMin = delimMin.slice(0, delimMin.length - trim[0].length)
        for (let i = 1; i < size; i++) this.out += delimMin + '\n'
      }
      this.closed = false
    }
  }

  // :: (string, ?string, Node, ())
  // Render a block, prefixing each line with `delim`, and the first
  // line in `firstDelim`. `node` should be the node that is closed at
  // the end of the block, and `f` is a function that renders the
  // content of the block.
  wrapBlock(delim: string, firstDelim: string, node: Node, f: Function) {
    let old = this.delim
    this.write(firstDelim || delim)
    this.delim += delim
    f()
    this.delim = old
    this.closeBlock(node)
  }

  atBlank() {
    return /(^|\n)$/.test(this.out)
  }

  // :: ()
  // Ensure the current content ends with a newline.
  ensureNewLine() {
    if (!this.atBlank()) this.out += '\n'
  }

  // :: (?string)
  // Prepare the state for writing output (closing closed paragraphs,
  // adding delimiters, and so on), and then optionally add content
  // (unescaped) to the output.
  write(content?: string) {
    this.flushClose()
    if (this.delim && this.atBlank()) this.out += this.delim
    if (content) this.out += content
  }

  // :: (Node)
  // Close the block for the given node.
  closeBlock(node: Node) {
    this.closed = node
  }

  // :: (string, ?bool)
  // Add the given text to the document. When escape is not `false`,
  // it will be escaped.
  text(text: string, escape?: boolean) {
    let lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      var startOfLine = this.atBlank() || this.closed
      this.write()
      this.out += escape !== false ? this.esc(lines[i], startOfLine) : lines[i]
      if (i != lines.length - 1) this.out += '\n'
    }
  }

  // :: (Node)
  // Render the given node as a block.
  render(node: Node, parent: Node | number, index: number) {
    if (typeof parent == 'number') throw new Error('!')
    this.nodes[node.type.name](this, node, parent, index)
  }

  // :: (Node)
  // Render the contents of `parent` as block nodes.
  renderContent(parent: Node) {
    parent.forEach((node, _, i) => this.render(node, parent, i))
  }

  // :: (Node)
  // Render the contents of `parent` as inline content.
  renderInline(parent: Node) {
    let active: any[] = [],
      trailing = ''
    let progress = (node: Node | null, _?: any, index: number = 0) => {
      let marks = node ? node.marks : []

      let leading = trailing
      trailing = ''
      // If whitespace has to be expelled from the node, adjust
      // leading and trailing accordingly.
      if (
        node &&
        node.isText &&
        marks.some((mark, _i, _a) => {
          let info = this.marks[mark.type.name]
          return !!(info && info.expelEnclosingWhitespace)
        }) &&
        /^(\s*)(.*?)(\s*)$/.test(node.text || '') // Todo: Don't duplicate this check.
      ) {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let [_, lead, inner, trail] = /^(\s*)(.*?)(\s*)$/.exec(node.text)
        leading += lead
        trailing = trail
        if (lead || trail) {
          node = inner ? (node as any).withText(inner) : null
          if (!node) marks = active
        }
      }

      let inner = marks.length && marks[marks.length - 1]
      let noEsc = inner && (this.marks[inner.type.name] as any).escape === false
      let len = marks.length - (noEsc ? 1 : 0)

      // Try to reorder 'mixable' marks, such as em and strong, which
      // in Markdown may be opened and closed in different order, so
      // that order of the marks for the token matches the order in
      // active.
      outer: for (let i = 0; i < len; i++) {
        let mark = marks[i]
        if (!this.marks[mark.type.name].mixable) break
        for (let j = 0; j < active.length; j++) {
          let other = active[j]
          if (!this.marks[other.type.name].mixable) break
          if (mark.eq(other)) {
            if (i > j)
              marks = marks
                .slice(0, j)
                .concat(mark)
                .concat(marks.slice(j, i))
                .concat(marks.slice(i + 1, len))
            else if (j > i)
              marks = marks
                .slice(0, i)
                .concat(marks.slice(i + 1, j))
                .concat(mark)
                .concat(marks.slice(j, len))
            continue outer
          }
        }
      }

      // Find the prefix of the mark set that didn't change
      let keep = 0
      while (
        keep < Math.min(active.length, len) &&
        marks[keep].eq(active[keep])
      )
        ++keep

      // Close the marks that need to be closed
      while (keep < active.length)
        this.text(this.markString(active.pop(), false, node), false)

      // Output any previously expelled trailing whitespace outside the marks
      if (leading) this.text(leading)

      // Open the marks that need to be opened
      if (node) {
        while (active.length < len) {
          let add = marks[active.length]
          active.push(add)
          this.text(this.markString(add, true, node), false)
        }

        // Render the node. Special case code marks, since their content
        // may not be escaped.
        if (noEsc && node.isText && inner)
          this.text(
            this.markString(inner, false, node) +
              node.text +
              this.markString(inner, true, node),
            false
          )
        else this.render(node, parent, index)
      }
    }
    parent.forEach(progress)
    progress(null)
  }

  // :: (Node, string, (number) → string)
  // Render a node's content as a list. `delim` should be the extra
  // indentation added to all lines except the first in an item,
  // `firstDelim` is a function going from an item index to a
  // delimiter for the first line of the item.
  renderList(node: Node, delim: string, firstDelim: (n: number) => string) {
    if (this.closed && this.closed.type == node.type) this.flushClose(3)
    else if (this.inTightList) this.flushClose(1)

    let isTight = this.options.tightLists
    let prevTight = this.inTightList
    this.inTightList = !!isTight
    node.forEach((child, _, i) => {
      if (i && isTight) this.flushClose(1)
      this.wrapBlock(delim, firstDelim(i), node, () =>
        this.render(child, node, i)
      )
    })
    this.inTightList = prevTight
  }

  // :: (string, ?bool) → string
  // Escape the given string so that it can safely appear in Markdown
  // content. If `startOfLine` is true, also escape characters that
  // has special meaning only at the start of the line.
  esc(str: string, startOfLine?: boolean | Node) {
    str = str.replace(/[`\\~\[\]]/g, '\\$&')
    if (startOfLine)
      str = str.replace(/^[#\-*+]/, '\\$&').replace(/^(\d+)\./, '$1\\.')
    return str
  }

  quote(str: string) {
    var wrap =
      str.indexOf('"') == -1 ? '""' : str.indexOf("'") == -1 ? "''" : '()'
    return wrap[0] + str + wrap[1]
  }

  // :: (string, number) → string
  // Repeat the given string `n` times.
  repeat(str: string, n: number) {
    let out = ''
    for (let i = 0; i < n; i++) out += str
    return out
  }

  // : (Mark, bool) → string
  // Get the markdown string for a given opening or closing mark.
  markString(mark: Mark, open: boolean, node: Node | null) {
    let info = this.marks[mark.type.name]
    let value = open ? info.open : info.close
    return typeof value == 'string' ? value : value(this, mark, node)
  }

  // :: (string) → { leading: ?string, trailing: ?string }
  // Get leading and trailing whitespace from a string. Values of
  // leading or trailing property of the return object will be undefined
  // if there is no match.
  getEnclosingWhitespace(
    text: string
  ): { leading?: string; trailing?: string } {
    return {
      leading: (text.match(/^(\s+)/) || [])[0],
      trailing: (text.match(/(\s+)$/) || [])[0],
    }
  }
}
