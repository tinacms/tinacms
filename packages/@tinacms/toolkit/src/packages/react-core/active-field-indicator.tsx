import * as React from 'react'

const FOCUS_EVENT = 'tina:activefield'

export const setActiveField = (field: string | null) => {
  const fieldEvent = new CustomEvent(FOCUS_EVENT, { detail: field })
  window.dispatchEvent(fieldEvent)
}

export const ActiveFieldIndicator = () => {
  const [activeEle, setActiveEle] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => {
    const activeFieldHandler = (event: CustomEvent) => {
      const ele = document.querySelector<HTMLElement>(
        `[data-tinafield="${event.detail}"]`
      )
      setActiveEle(ele)
    }
    // @ts-ignore it doesn't like custom event names
    window.addEventListener(FOCUS_EVENT, activeFieldHandler)
    // @ts-ignore see above
    return () => window.removeEventListener(FOCUS_EVENT, activeFieldHandler)
  }, [])

  if (!activeEle) return null
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 999,
        top: activeEle.offsetTop,
        left: activeEle.offsetLeft,
        width: activeEle.offsetWidth,
        height: activeEle.offsetHeight,
        boxShadow:
          'inset 0 -5px 12px var(--tina-color-indicator),inset 0 5px 12px var(--tina-color-indicator)',
      }}
    ></div>
  )
}
