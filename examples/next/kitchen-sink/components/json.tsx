import React from 'react'

export function Json({ src }: { src: any }) {
  return (
    <pre className="whitespace-pre-wrap break-words bg-white p-4 rounded border">{JSON.stringify(src, null, 2)}</pre>
  )
}

export function Markdown({ content }: { content: string }) {
  // Minimal markdown renderer: render raw content inside a <div>
  return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
}

export default Json
