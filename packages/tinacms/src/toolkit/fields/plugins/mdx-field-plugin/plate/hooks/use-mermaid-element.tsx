import { useEffect, useRef } from 'react'

export const useMermaidElement = () => {
  const mermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true

    import('mermaid').then((mermaidModule) => {
      if (isMounted && mermaidRef.current) {
        const mermaid = mermaidModule.default
        mermaid.initialize({ startOnLoad: false })
        mermaid.init(undefined, mermaidRef.current)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return {
    mermaidRef,
  }
}
