import { DOMParser } from '@xmldom/xmldom'

export interface SlateNode {
  type: string
  children?: SlateNode[]
  text?: string
  bold?: boolean
  italic?: boolean
  id?: string | number
  name?: string
  props?: {
    [key: string]: any
  }
  url?: string
  alt?: string
  caption?: string
}

// These attributes are either to be ignored or are manually added elsewehere
const ignoreThisAttributes = ['type', 'name', 'id']
function propsToAttributes(node?: { [key: string]: any }) {
  if (!node) return ''

  let attributes = ''

  for (const key in node) {
    if (node.hasOwnProperty(key) && !ignoreThisAttributes.includes(key)) {
      const value = node[key]
      if (typeof value !== 'object') {
        attributes += ` ${key}="${value}"`
      }
    }
  }

  return attributes
}

function convertSlateToXml(node: SlateNode): string {
  let xml = ''

  switch (node.type) {
    case 'mdxJsxTextElement':
    case 'mdxJsxFlowElement':
      const attributes = propsToAttributes(node.props)
      xml = `<${node.name} type="${node.type}"${attributes}`
      // xml = `<${node.name} id="${node.id}" type="${node.type}"${attributes}`
      // if we find 'content' we process it's children and skip the top level "root" node
      return node.props?.content
        ? `${xml}>${convertChildrenToXml(node.props.content.children)}</${
            node.name
          }>`
        : `${xml} />`
    case 'text':
    // Slate seems to be inconsistent with adding "type": "text" to text elements
    // so if there is no "type" it is a "text"
    case undefined:
      let text = node.text || ''
      if (node.bold) text = `<bold>${text}</bold>`
      if (node.italic) text = `<italic>${text}</italic>`
      return text
    default:
      xml = `<${node.type}${propsToAttributes(node)}`
      if (node.children) {
        // xml += '>'
        const children = convertChildrenToXml(node.children)
        return children ? `${xml}>${children}</${node.type}>` : `${xml} />`
      }
      return `${xml} />`
  }
}

function convertChildrenToXml(children?: SlateNode[]) {
  if (!children || children.length === 0) return ''

  let xml = ''

  for (const child of children) {
    xml += convertSlateToXml(child)
  }

  return xml
}

function formatXML(xml: string, tab = '  ', nl = '\n') {
  let formatted = '',
    indent = ''
  const nodes = xml.slice(1, -1).split(/>\s*</)
  if (nodes.length === 0 || !nodes[0]) return ''

  if (nodes[0][0] == '?') formatted += '<' + nodes.shift() + '>' + nl
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (!node) continue
    if (node[0]! == '/') indent = indent.slice(tab.length) // decrease indent
    formatted += indent + '<' + node + '>' + nl
    if (
      node[0] != '/' &&
      node[node.length - 1] != '/' &&
      node.indexOf('</') == -1
    )
      indent += tab // increase indent
  }
  return formatted
}

export function stringifyToXML(slateDoc: SlateNode): string {
  if (slateDoc.type !== 'root') {
    throw new Error(
      'Invalid Slate document: Root node should be of type "root".'
    )
  }

  const xml = convertChildrenToXml(slateDoc.children)
  // Make sure there's no leading or trailing empty paragraph. Slate throws errors in this case
  const sanitisedXml = xml.replace(/^<p\s*\/>/, '').replace(/<p\s*\/>$/, '')
  return formatXML(`<data>${sanitisedXml}</data>`)
}

function parseXmlToSlateNode(node: Element): SlateNode {
  const type = node.getAttribute('type') || node.nodeName
  const isMdxNode = type.startsWith('mdxJsx')
  const name = isMdxNode ? node.nodeName : undefined
  const slateNode: SlateNode = { type, name }

  if (node.hasAttribute('id')) {
    slateNode.id = node.getAttribute('id')!
  }

  if (node.nodeName === 'bold' || node.nodeName === 'italic') {
    return {
      type: 'text',
      text: node.textContent || '',
      bold: node.nodeName === 'bold' ? true : undefined,
      italic: node.nodeName === 'italic' ? true : undefined,
    }
  }

  if (node.childNodes && node.childNodes.length > 0) {
    const childNodes = []
    for (let i = 0; i < node.childNodes.length; i++) {
      const childNode = node.childNodes[i]
      if (!childNode) continue
      if (childNode.nodeType === 1) {
        childNodes.push(parseXmlToSlateNode(childNode as Element))
      } else if (
        childNode.nodeType === 3 &&
        !childNode?.nodeValue?.startsWith('\n')
      ) {
        childNodes.push({
          type: 'text',
          text: childNode.nodeValue || '',
        })
      }
    }
    if (isMdxNode) {
      slateNode.children = [
        {
          type: 'text',
          text: '',
        },
      ]
      slateNode.props = {
        content: {
          type: 'root',
          children: childNodes,
        },
      }
    } else {
      slateNode.children = childNodes
    }
  }

  if (type === 'img' || type === 'a') {
    // This might need better handling, e.g. parsing the "title" of a link etc
    slateNode.url = node.getAttribute('url') || ''
    slateNode.alt = node.getAttribute('alt') || undefined
    slateNode.caption = node.getAttribute('caption') || undefined
  } else {
    if (node.hasAttributes()) {
      slateNode.props = slateNode.props || {}
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i]
        if (!attr) continue

        if (attr.name !== 'id' && attr?.name !== 'type') {
          slateNode.props[attr.name] = attr.value
        }
      }
    }
  }

  return slateNode
}

export function parseFromXml(xml: string): SlateNode {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')
  const root = doc.documentElement

  const childNodes = Array.from(root.childNodes)
  const children = childNodes
    .filter((node) => node.nodeType === 1)
    .map((node) => parseXmlToSlateNode(node as Element))
  return {
    type: 'root',
    children,
  }
}
