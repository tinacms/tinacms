import { Node } from 'prosemirror-model'

/**
 * Ordered List
 */
export const ordered_list = {
  content: 'list_item+',
  group: 'block',
  attrs: { order: { default: 1 }, tight: { default: false } },
  parseDOM: [
    {
      tag: 'ol',
      getAttrs(dom: Element) {
        return {
          // @ts-ignore
          order: dom.hasAttribute('start') ? +dom.getAttribute('start') : 1,
          tight: dom.hasAttribute('data-tight'),
        }
      },
    },
  ],
  toDOM(node: Node) {
    return [
      'ol',
      {
        start: node.attrs.order == 1 ? null : node.attrs.order,
        'data-tight': node.attrs.tight ? 'true' : null,
      },
      0,
    ]
  },
}
