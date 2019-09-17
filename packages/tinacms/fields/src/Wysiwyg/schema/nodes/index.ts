import { Node } from "prosemirror-model"
import { image } from "./image"
import { blockDoc } from "./blockDoc"
import { tables } from "./tables"

/**
 * buildNodes
 */
export interface NodesOptions {
  code_block?: boolean
  blockquote?: boolean
  horizontal_rule?: boolean
  heading?: boolean
  image?: boolean
  table?: boolean
}

export function buildNodes(blockContent?: boolean, options: NodesOptions = {}) {
  let _nodes: any = {
    text: nodes.text,
    hard_break: nodes.hard_break,
  }

  if (options.image) _nodes.image = nodes.image

  if (blockContent) {
    _nodes.doc = blockDoc
    _nodes.paragraph = nodes.paragraph

    if (options.code_block) _nodes.code_block = nodes.code_block
    if (options.blockquote) _nodes.blockquote = nodes.blockquote
    if (options.horizontal_rule) _nodes.horizontal_rule = nodes.horizontal_rule
    if (options.heading) _nodes.heading = nodes.heading
    if (options.table) {
      _nodes.table = nodes.table
      _nodes.table_row = nodes.table_row
      _nodes.table_header = nodes.table_header
      _nodes.table_cell = nodes.table_cell
    }
  } else {
    _nodes.doc = inlineDoc
  }

  return _nodes
}

/**
 * utils?
 */

function domAttrs(attrs: any) {
  let domAttrs: any = {}
  for (let key in attrs) {
    if (attrs[key]) {
      domAttrs[`forestry-${key}`] = attrs[key]
    }
  }
  return domAttrs
}

function docAttrs(attrs: any) {
  let domAttrs: any = {}
  for (let key in attrs) {
    if (attrs[key]) {
      domAttrs[key] = attrs[key]
    }
  }
  return domAttrs
}

function getAttrsWith(attrs: object) {
  return function(dom: HTMLElement) {
    return {
      ...attrs,
      ...getAttrs(dom),
    }
  }
}

function getAttrs(dom: HTMLElement) {
  let attrs: any = {}
  let attributes = dom.attributes
  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i]
    if (attribute.value) {
      let name = attribute.name.startsWith("forestry-") ? attribute.name.slice(9) : attribute.name

      attrs[name] = attribute.value
    }
  }
  return attrs
}

/**
 * inlineDoc
 */
const inlineDoc = { content: "inline*", marks: "_" }

/**
 * paragraph
 */
const paragraph = {
  content: "inline*",
  marks: "_",
  attrs: {
    class: { default: "" },
    id: { default: "" },
  },
  group: "block",
  parseDOM: [{ tag: "p", getAttrs }],
  toDocument(node: Node) {
    return ["p", docAttrs(node.attrs), 0]
  },
  toDOM(node: Node) {
    return ["p", domAttrs(node.attrs), 0]
  },
}

/**
 * blockquote
 */
const blockquote = {
  content: "block+",
  group: "block",
  defining: true,
  parseDOM: [{ tag: "blockquote" }],
  toDOM() {
    return ["blockquote", 0]
  },
}

/**
 * horizontal_rule
 */
const horizontal_rule = {
  group: "block",
  allowGapCursor: true,
  parseDOM: [{ tag: "hr" }],
  toDOM() {
    return ["hr"]
  },
}

/**
 * heading
 */
const heading = {
  attrs: {
    level: { default: 1 },
    class: { default: "" },
    id: { default: "" },
  },
  content: "inline*",
  marks: "_",
  group: "block",
  defining: true,
  parseDOM: [
    { tag: "h1", getAttrs: getAttrsWith({ level: 1 }) },
    { tag: "h2", getAttrs: getAttrsWith({ level: 2 }) },
    { tag: "h3", getAttrs: getAttrsWith({ level: 3 }) },
    { tag: "h4", getAttrs: getAttrsWith({ level: 4 }) },
    { tag: "h5", getAttrs: getAttrsWith({ level: 5 }) },
    { tag: "h6", getAttrs: getAttrsWith({ level: 6 }) },
  ],
  toDocument(node: Node) {
    const { level, ...other } = node.attrs
    return ["h" + level, docAttrs(other), 0]
  },
  toDOM(node: Node) {
    const { level, ...other } = node.attrs
    return ["h" + level, domAttrs(other), 0]
  },
}

/**
 * code_block
 */
const code_block = {
  content: "text*",
  attrs: { params: { default: "" } },
  group: "block",
  code: true,
  defining: true,
  parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
  toDOM() {
    return ["pre", ["code", 0]]
  },
}

/**
 * text
 */
const text = {
  group: "inline",
}

/**
 * hard_break
 */
const hard_break = {
  inline: true,
  group: "inline",
  selectable: false,
  parseDOM: [{ tag: "br" }],
  toDOM() {
    return ["br"]
  },
}

/**
 * Ordered List
 */
const ordered_list = {
  content: "list_item+",
  group: "block",
  attrs: { order: { default: 1 }, tight: { default: false } },
  parseDOM: [
    {
      tag: "ol",
      getAttrs(dom: Element) {
        return {
          // @ts-ignore
          order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1,
          tight: dom.hasAttribute("data-tight"),
        }
      },
    },
  ],
  toDOM(node: Node) {
    return [
      "ol",
      {
        start: node.attrs.order == 1 ? null : node.attrs.order,
        "data-tight": node.attrs.tight ? "true" : null,
      },
      0,
    ]
  },
}

/**
 * bullet_list
 */
const bullet_list = {
  content: "list_item+",
  group: "block",
  attrs: { tight: { default: false } },
  parseDOM: [{ tag: "ul", getAttrs: (dom: Element) => ({ tight: dom.hasAttribute("data-tight") }) }],
  toDOM(node: Node) {
    return ["ul", { "data-tight": node.attrs.tight ? "true" : null }, 0]
  },
}

/**
 * list_item
 */
const list_item = {
  content: "paragraph block*",
  defining: true,
  parseDOM: [{ tag: "li" }],
  toDOM() {
    return ["li", 0]
  },
}

/**
 * nodes
 */
export const nodes = {
  doc: blockDoc,
  paragraph,
  blockquote,
  horizontal_rule,
  heading,
  image,
  code_block,
  text,
  hard_break,
  ordered_list,
  bullet_list,
  list_item,
  ...tables,
}
