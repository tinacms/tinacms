import { Node } from 'prosemirror-model'

/**
 * buildMarks
 */
export interface MarksOptions {
  code?: boolean
  link?: boolean
  strong?: boolean
  em?: boolean
  underline?: boolean
  custom?: boolean
  s?: true
}

export function buildMarks(options: MarksOptions = {}) {
  let _marks: any = {}

  if (options.code) _marks.code = marks.code
  if (options.link) _marks.link = marks.link
  if (options.strong) _marks.strong = marks.strong
  if (options.em) _marks.em = marks.em
  if (options.underline) _marks.underline = marks.underline
  if (options.custom) _marks.custom = marks.custom
  if (options.s) _marks.s = marks.s

  return _marks
}

/**
 * Custom
 */
const custom = {
  attrs: {
    class: {},
  },
  parseDOM: [
    {
      tag: 'span[class]',
      getAttrs: (dom: HTMLElement) => ({ class: dom.getAttribute('class') }),
    },
  ],
  toDOM(node: Node) {
    return ['span', node.attrs]
  },
}

/**
 * Emphasis
 */
const em = {
  parseDOM: [
    { tag: 'i' },
    { tag: 'em' },
    {
      style: 'font-style',
      // @ts-ignore
      getAttrs: (value: string): string => value == 'italic' && null,
    },
  ],
  toDOM() {
    return ['em']
  },
}

const strong = {
  parseDOM: [
    { tag: 'strong' },
    // This works around a Google Docs misbehavior where
    // pasted content will be inexplicably wrapped in `<b>`
    // tags with a font-weight normal.
    {
      tag: 'b',
      getAttrs: (node: HTMLElement) => {
        return node.style.fontWeight != 'normal' && null
      },
    },
    {
      style: 'font-weight',
      getAttrs: (value: string) => {
        return /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null
      },
    },
  ],
  toDOM() {
    return ['strong']
  },
}

/**
 * strikethrough
 */
const s = {
  parseDOM: [{ tag: 'del' }],
  toDOM() {
    return ['del']
  },
}

/**
 * code
 */
const code = {
  parseDOM: [{ tag: 'code' }],
  toDOM() {
    return ['code']
  },
}

/**
 * Underline
 */
const underline = {
  parseDOM: [
    {
      style: 'text-decoration',
      getAttrs: (value: string): any => /^underline;?$/i.test(value) && null,
    },
  ],
  toDOM(node: Node) {
    return [
      'span',
      {
        ...node.attrs,
        style: 'text-decoration: underline;',
      },
    ]
  },
}

/**
 * Link
 */
const link = {
  attrs: {
    href: {},
    title: { default: null as any },
    editing: { default: null as any },
    creating: { default: null as any },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'a[href]',
      getAttrs(dom: HTMLElement) {
        return {
          href: dom.getAttribute('href'),
          title: dom.getAttribute('title'),
          // Internal Use Only
          editing: dom.getAttribute('editing'),
          creating: dom.getAttribute('creating'),
        }
      },
    },
  ],
  toDOM(node: Node) {
    return ['a', node.attrs]
  },
  toDocument(node: Node) {
    const { editing, creating, ...attrs } = node.attrs
    return ['a', attrs]
  },
}

/**
 * marks
 */
export const marks = {
  link,
  custom,
  em,
  s,
  strong,
  underline,
  code,
}
