import * as React from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@toolkit/icons'
import { useEvent } from '@toolkit/react-core/use-cms-event'
import { FieldHoverEvent, FieldFocusEvent } from '@toolkit/fields/field-events'
import { useFieldReference } from '@toolkit/hooks/use-field-reference'

const IndicatorWrap = ({ style = {}, position, ...props }) => (
  <div
    className="fixed left-0 py-2 px-0 text-center"
    style={{
      ...style,
      marginLeft: 'var(--tina-sidebar-width)',
      width: 'calc(100% - var(--tina-sidebar-width))',
      top: position === 'top' ? 0 : 'auto',
      bottom: position === 'top' ? 'auto' : 0,
      zIndex: 'var(--tina-z-index-3)',
    }}
    {...props}
  />
)

const ArrowWrap = (props) => (
  <div
    className="inline-block fill-white rounded-[50%] bg-blue-500 shadow-md"
    {...props}
  />
)

const AboveViewportIndicator = () => {
  return (
    <IndicatorWrap position="top">
      <ArrowWrap>
        <ChevronUpIcon className="w-8 h-auto" />
      </ArrowWrap>
    </IndicatorWrap>
  )
}

const BelowViewportIndicator = () => {
  return (
    <IndicatorWrap position="bottom">
      <ArrowWrap>
        <ChevronDownIcon className="w-8 h-auto" />
      </ArrowWrap>
    </IndicatorWrap>
  )
}

const useScrollToFocusedField = () => {
  const { subscribe } = useEvent<FieldFocusEvent>('field:focus')
  React.useEffect(() =>
    subscribe(({ fieldName }) => {
      const ele = document.querySelector<HTMLElement>(
        `[data-tinafield="${fieldName}"]`
      )
      if (!ele) return
      const { top, height } = ele.getBoundingClientRect()
      /**
       * if element height < window height
       *  if element bottom < window bottom
       *    scroll so bottom of ele is at window bottom
       * else
       *  if element top < window bottom
       */
      const eleTopY = top + window.scrollY
      const eleBottomY = top + height + window.scrollY
      const viewportTopY = window.scrollY
      const viewportBottomY = window.innerHeight + window.scrollY
      if (height < window.innerHeight) {
        // if the element is smaller than the viewport, scroll entire element into view
        if (eleBottomY > viewportBottomY) {
          // scroll up so entire element is in view
          window.scrollTo({
            top: eleBottomY - window.innerHeight,
            behavior: 'smooth',
          })
        } else if (eleTopY < viewportTopY) {
          // scroll down so entire element is in view
          window.scrollTo({
            top: eleTopY,
            behavior: 'smooth',
          })
        }
      } else {
        // if the element is >= viewport size, meet nearest edges
        if (eleBottomY < viewportBottomY) {
          // anchor element bottom to viewport bottom
          window.scrollTo({
            top: eleBottomY - window.innerHeight,
            behavior: 'smooth',
          })
        } else if (eleTopY > viewportTopY) {
          // anchor element top to viewport top
          window.scrollTo({
            top: eleTopY,
            behavior: 'smooth',
          })
        }
      }
    })
  )
}

export const ActiveFieldIndicator = () => {
  const [activeFieldName, setActiveFieldName] = React.useState<string | null>(
    null
  )
  const [display, setDisplay] = React.useState<boolean>(false)
  const [position, setPosition] = React.useState<any>(false)
  const [iframePosition, setIframePosition] = React.useState<any>({ left: 0 })
  const activeEle = useFieldReference(activeFieldName)

  React.useEffect(() => {
    let displayTimeout
    if (activeEle) {
      setDisplay(true)
      setPosition(activeEle.getBoundingClientRect())
      const iframe = document.getElementById('tina-iframe') as HTMLIFrameElement
      if (iframe) {
        setIframePosition(iframe.getBoundingClientRect())
      }
    } else {
      displayTimeout = setTimeout(() => {
        setDisplay(false)
      }, 150)
    }

    return () => {
      clearTimeout(displayTimeout)
    }
  }, [activeEle])

  const [, setArbitraryValue] = React.useState(0)
  const rerender = () => setArbitraryValue((s) => s + 1)

  React.useEffect(() => {
    window.addEventListener('scroll', rerender)
    return () => {
      window.removeEventListener('scroll', rerender)
    }
  }, [])

  const { subscribe } = useEvent<FieldHoverEvent>('field:hover')

  React.useEffect(() =>
    subscribe(({ fieldName, id }) => {
      setActiveFieldName(`${id}#${fieldName}`)
    })
  )

  useScrollToFocusedField()

  if (!display) return null

  const eleTopY = position.top + window.scrollY
  const eleBottomY = position.top + position.height + window.scrollY
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
        zIndex: 'var(--tina-z-index-3)',
        top: position.top + window.scrollY,
        left: position.left + window.scrollX + iframePosition.left,
        width: position.width,
        height: position.height,
        outline: '2px dashed var(--tina-color-indicator)',
        borderRadius: 'var(--tina-radius-small)',
        transition: display
          ? activeEle
            ? `opacity 300ms ease-out`
            : `opacity 150ms ease-in`
          : `none`,
        opacity: activeEle && display ? 0.8 : 0,
      }}
    ></div>
  )
}
