/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/
import * as React from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '../packages/icons'
import { useEvent } from '../packages/react-core/use-cms-event'
import {
  FieldHoverEvent,
  FieldFocusEvent,
} from '../packages/fields/field-events'
import { useFieldReference } from '../hooks/use-field-reference'
import { useCMS } from '../react-tinacms'

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

type Position = {
  tinafield: string
  top: number
  left: number
  height: number
  width: number
}

export const ReverseActiveFieldIndicator = () => {
  const [selecting, setSelecting] = React.useState(false)
  const [iframePosition, setIframePosition] = React.useState<any>({ left: 0 })
  const [nodes, setNodes] = React.useState<Element[]>([])

  React.useMemo(() => {
    const observer = new MutationObserver(function (mutations_list) {
      mutations_list.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // @ts-ignore PR FOR DEMO ONLY
            const tinaFieldNodes = node.querySelectorAll('[data-tinafield]')
            tinaFieldNodes.forEach((node) => {
              setNodes((nodes) => [...nodes.filter((n) => n !== node), node])
            })
          }
        })
        mutation.removedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // @ts-ignore PR FOR DEMO ONLY
            const tinaFieldNodes = node.querySelectorAll('[data-tinafield]')
            tinaFieldNodes.forEach((node) => {
              setNodes((nodes) => nodes.filter((n) => n !== node))
            })
          }
        })
      })
    })

    const iframe = document.getElementById('tina-iframe') as HTMLIFrameElement
    if (iframe) {
      observer.observe(iframe?.contentDocument, {
        subtree: true,
        childList: true,
      })
    }

    return () => observer.disconnect()
  }, [selecting, setNodes])

  React.useEffect(() => {
    if (selecting) {
      const iframe = document.getElementById('tina-iframe') as HTMLIFrameElement
      if (iframe) {
        setIframePosition(iframe.getBoundingClientRect())
      }
      const tinaFieldNodes =
        iframe?.contentDocument.querySelectorAll('[data-tinafield]')

      for (const node of tinaFieldNodes) {
        const tinafield = node.getAttribute('data-tinafield')
        const [formId, fieldName] = tinafield.split('#')
        if (fieldName) {
          // const position = node.getBoundingClientRect()
          // const top = position.top
          // const left = position.left
          // const height = position.height
          // const width = position.width
          // const pos = { tinafield, top, left, height, width }
          setNodes((nodes) => [...nodes.filter((n) => n !== node), node])
          // setPositions((positions) => [...positions, pos])
        }
      }
    }
  }, [selecting])

  return (
    <div>
      <button
        onClick={() => setSelecting((selecting) => !selecting)}
        className="absolute right-5 bottom-5 p-5 rounded-full bg-gray-100 shadow-lg border"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          {selecting ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
            />
          )}
        </svg>
      </button>
      {selecting &&
        nodes.map((node) => {
          return (
            <Indicator
              key={node.getAttribute('data-tinafield')}
              node={node}
              iframePosition={iframePosition}
            />
          )
        })}
    </div>
  )
}

const Indicator = ({
  node,
  iframePosition,
}: {
  node: Element
  iframePosition: Omit<Position, 'tinafield'>
}) => {
  const cms = useCMS()
  const position = node.getBoundingClientRect()
  const tinafield = node.getAttribute('data-tinafield')
  const [display, setDisplay] = React.useState(false)
  return (
    <div
      onMouseOver={() => setDisplay(true)}
      onClick={() => {
        cms.events.dispatch({ type: 'field:selected', value: tinafield })
      }}
      onMouseOut={() => setDisplay(false)}
      style={{
        position: 'absolute',
        cursor: 'pointer',
        zIndex: 'var(--tina-z-index-3)',
        top: position.top + window.scrollY,
        left: position.left + window.scrollX + iframePosition.left,
        width: position.width,
        height: position.height,
        outline: '2px dashed var(--tina-color-indicator)',
        borderRadius: 'var(--tina-radius-small)',
        transition: `opacity 150ms ease-in`,
        opacity: display ? 0.8 : 0,
      }}
    ></div>
  )
}
