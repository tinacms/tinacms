import { Node } from 'prosemirror-model'

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

export default { name: 'link', mark: link }
