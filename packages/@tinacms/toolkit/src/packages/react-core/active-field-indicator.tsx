import * as React from 'react'
import styled from 'styled-components'
import { ChevronUpIcon, ChevronDownIcon } from '../icons'

const FOCUS_EVENT = 'tina:activefield'

export const setActiveField = (field: string | null) => {
  const fieldEvent = new CustomEvent(FOCUS_EVENT, { detail: field })
  window.dispatchEvent(fieldEvent)
}

const IndicatorWrap = styled.div`
  position: fixed;
  z-index: var(--tina-z-index-3);
  left: 0;
  padding: 0.5rem 0;
  margin-left: var(--tina-sidebar-width);
  width: calc(100% - var(--tina-sidebar-width));
  text-align: center;
  top: ${(props: { position?: 'top' | 'bottom' }) =>
    props.position === 'top' ? 0 : 'auto'};
  bottom: ${(props: { position?: 'top' | 'bottom' }) =>
    props.position === 'top' ? 'auto' : 0};
`

const ArrowWrap = styled.div`
  display: inline-block;
  fill: white;
  background-color: var(--tina-color-primary);
  border-radius: 50%;
  box-shadow: 0 0 10px -5px;
`

const AboveViewportIndicator = () => {
  return (
    <IndicatorWrap position="top">
      <ArrowWrap>
        <ChevronUpIcon />
      </ArrowWrap>
    </IndicatorWrap>
  )
}

const BelowViewportIndicator = () => {
  return (
    <IndicatorWrap position="bottom">
      <ArrowWrap>
        <ChevronDownIcon />
      </ArrowWrap>
    </IndicatorWrap>
  )
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

  const { top, left, width, height } = activeEle.getBoundingClientRect()

  const eleTopY = top + window.scrollY
  const eleBottomY = top + height + window.scrollY
  const viewportTopY = window.scrollY
  const viewportBottomY = window.innerHeight + window.scrollY

  if (eleTopY > viewportBottomY) {
    // element is below the viewport
    return <BelowViewportIndicator />
  }

  if (eleBottomY < viewportTopY) {
    // element is above the viewport
    return <AboveViewportIndicator />
  }

  return (
    <div
      style={{
        position: 'absolute',
        // @ts-ignore it's a number, trust me
        zIndex: `var(--tina-z-index-3)`,
        top: top + window.scrollY,
        left: left + window.scrollX,
        width,
        height,
        outline: '2px dashed var(--tina-color-indicator)',
      }}
    ></div>
  )
}
