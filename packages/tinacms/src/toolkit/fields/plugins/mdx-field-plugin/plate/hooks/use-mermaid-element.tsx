import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

export const useMermaidElement = () => {
  const mermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.initialize({ startOnLoad: true })
      mermaid.run()
    }
  }, [])

  return {
    mermaidRef,
  }
}
