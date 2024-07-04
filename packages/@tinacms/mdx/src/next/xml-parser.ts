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
}

function propsToAttributes(node?: { [key: string]: any }) {
  if (!node) return ''

  let attributes = ''

  for (const key in node) {
    if (node.hasOwnProperty(key)) {
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
    case undefined:
      let text = node.text || ''
      if (node.bold) text = `<bold>${text}</bold>`
      if (node.italic) text = `<italic>${text}</italic>`
      return text
    default:
      // xml = `<${node.type} id="${node.id}"`;
      xml = `<${node.type}`
      if (node.children) {
        xml += '>'
        xml += convertChildrenToXml(node.children)
        return `${xml}</${node.type}>`
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

function formatXml(xml: string, tab: string = '  '): string {
  let formatted = ''
  const regex = /(>)(<)(\/*)/g
  xml = xml.replace(regex, '$1\r\n$2$3')
  let pad = 0
  xml.split('\r\n').forEach((node) => {
    let indent = 0
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) {
        pad -= 1
      }
    } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
      indent = 1
    } else {
      indent = 0
    }

    const padding = new Array(pad + 1).join(tab)
    formatted += padding + node + '\r\n'
    pad += indent
  })
  return formatted.trim()
}

export function stringifyToXML(slateDoc: SlateNode): string {
  if (slateDoc.type !== 'root') {
    throw new Error(
      'Invalid Slate document: Root node should be of type "root".'
    )
  }

  return formatXml(convertChildrenToXml(slateDoc.children))
}
