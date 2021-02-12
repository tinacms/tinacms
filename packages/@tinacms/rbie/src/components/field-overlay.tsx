import * as React from 'react'

function useWindowResize(handler: () => void) {
  React.useEffect(() => {
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
}

export function FieldOverlay({
  targetNode,
  attention,
  children,
}: {
  targetNode: any
  attention: boolean
  children?: JSX.Element
}) {
  const [, setState] = React.useState(0)
  useWindowResize(() => setState(s => s + 1))
  if (!targetNode) return null
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 400,
        top: targetNode?.offsetTop,
        left: targetNode?.offsetLeft,
        width: targetNode?.offsetWidth,
        height: targetNode?.offsetHeight,
        border: attention ? '1px solid var(--tina-color-primary)' : 'none',
        pointerEvents: attention ? 'none' : 'initial',
      }}
    >
      {children}
    </div>
  )
}
