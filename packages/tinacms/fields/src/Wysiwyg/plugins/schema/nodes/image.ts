import { Node } from 'prosemirror-model'
import { SchemaNodePlugin } from '../..'

export const image = {
  inline: true,
  attrs: {
    src: {},
    align: { default: null },
    alt: { default: null },
    title: { default: null },
    width: { default: null },
    height: { default: null },
  },
  group: 'inline',
  draggable: true,
  allowGapCursor: true,
  parseDOM: [
    {
      tag: 'img[src]',
      getAttrs(dom: HTMLElement) {
        return {
          src: dom.getAttribute('src'),
          title: dom.getAttribute('title'),
          alt: dom.getAttribute('alt'),
          align: getAlignFromDOM(dom),
          width: dom.getAttribute('width'),
          height: dom.getAttribute('height'),
        }
      },
    },
  ],
  toDOM(node: Node) {
    const attrs: any = {
      src: node.attrs.src,
    }

    if (node.attrs.title) attrs.title = node.attrs.title
    if (node.attrs.alt) attrs.alt = node.attrs.alt
    if (node.attrs.width) attrs.width = node.attrs.width
    if (node.attrs.height) attrs.height = node.attrs.height
    if (node.attrs.align) attrs['class'] = `align-${node.attrs.align}`

    return ['img', attrs]
  },
}

const alignRegex = /align-([a-z]*)/

export function getAlignFromDOM(image: HTMLElement) {
  const className = image.getAttribute('class') || ''

  const match = alignRegex.exec(className)

  if (match && match.length > 1) {
    return match[1]
  }

  return null
}

export default {
  __type: 'wysiwyg:schema:node',
  name: 'image',
  node: image,
} as SchemaNodePlugin
