import React from 'react'

type RichNode = any

function renderNode(node: RichNode, idx?: number): React.ReactNode {
  if (node == null) return null
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map((n, i) => <React.Fragment key={i}>{renderNode(n)}</React.Fragment>)
  if (typeof node === 'object') {
    if ('text' in node) return node.text
    const children = renderNode(node.children ?? node.content ?? node)
    const type = (node.type || '').toLowerCase()
    switch (type) {
      case 'paragraph':
        return <p key={idx}>{children}</p>
      case 'heading':
      case 'heading1':
      case 'heading2':
      case 'heading3':
        return <h3 key={idx}>{children}</h3>
      case 'blockquote':
        return <blockquote key={idx}>{children}</blockquote>
      case 'link':
      case 'a':
        return (
          <a key={idx} href={node.url ?? node.href ?? '#'} className="text-blue-600 hover:underline">
            {children}
          </a>
        )
      default:
        return <React.Fragment key={idx}>{children}</React.Fragment>
    }
  }
  return null
}

export default function RichText({ content }: { content: any }) {
  if (content == null) return null
  return <>{renderNode(content)}</>
}
