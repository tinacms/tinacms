import * as React from 'react'

export const MutationSignalContext = React.createContext(-1)

/**
 *
 */
export const MutationSignalProvider = ({ children }: { children: any }) => {
  const observerAreaRef = React.useRef<HTMLElement | null>(null)
  const [signal, setSignal] = React.useState(0)
  React.useEffect(() => {
    if (!observerAreaRef) return

    const observer = new MutationObserver(() => setSignal((s) => s + 1))
    observer.observe(observerAreaRef.current as Node, {
      childList: true,
      subtree: true,
      characterData: true,
    })
    return () => observer.disconnect()
  }, [])
  return (
    <MutationSignalContext.Provider value={signal}>
      <div ref={observerAreaRef as any}>{children}</div>
    </MutationSignalContext.Provider>
  )
}

/**
 * Returns a value that changes when elements within the parent MutationSignalProvider change
 */
export const useMutationSignal = () => React.useContext(MutationSignalContext)
