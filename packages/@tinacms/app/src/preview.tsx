/**

*/
import React from 'react'
import { defineConfig, useCMS, useCMSEvent } from 'tinacms'
import { useGraphQLReducer } from './lib/graphql-reducer'
import { useSearchParams } from 'react-router-dom'

type Config = Parameters<typeof defineConfig>[0]

export const Preview = React.forwardRef<
  HTMLIFrameElement,
  Config & { url: string }
>((props, iframeRef) => {
  // let iframeRef: React.MutableRefObject<HTMLIFrameElement | null> | null
  if (iframeRef instanceof HTMLIFrameElement) {
    throw new Error('Unexpected ref HTMLIFrameElement')
  } else if (typeof iframeRef === 'function') {
    throw new Error('Unexpected function for Preview ref')
  }
  if (!iframeRef) {
    throw new Error('Expected ref to be provide for Preview')
  }
  const { status } = useGraphQLReducer(iframeRef, props.url)
  const cms = useCMS()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeField = searchParams.get('activeField')

  React.useEffect(() => {
    if (status === 'ready') {
      if (activeField) {
        setSearchParams({})
        const [formID, fieldName] = activeField.split('__')
        if (formID && fieldName) {
          cms.events.dispatch({
            type: 'field:selected',
            value: `${formID}#${fieldName}`,
          })
        }
      }
    }
  }, [status])

  const [iframeBodyHeight, setIframeBodyHeight] = React.useState<
    number | null
  >()

  const style: React.CSSProperties = {}
  if (iframeBodyHeight) {
    style.height = iframeBodyHeight
  }
  const [fieldList, setFieldList] = React.useState<Item[]>([])
  const [isEdit, setIsEdit] = React.useState(false)
  const pressed = useKeyPress()

  React.useEffect(() => {
    if (pressed) {
      setIsEdit((edit) => !edit)
    }
  }, [pressed, setIsEdit])

  const handleMessage = (e: MessageEvent) => {
    if (e.data.type === 'window-size') {
      setIframeBodyHeight(e.data.height)
    }
    if (e.data.type === 'tinafields') {
      setFieldList(e.data.elementList)
    }
    if (e.data.type === 'hotkey') {
      if (e.data.value === true) {
        setIsEdit((edit) => !edit)
      }
    }
  }
  React.useEffect(() => {
    // Reset
    setIframeBodyHeight(null)
  }, [props.url])

  React.useEffect(() => {
    if (iframeRef.current) {
      window.addEventListener('message', handleMessage)
    }

    return () => {
      window.removeEventListener('message', handleMessage)
      cms.removeAllForms()
    }
  }, [iframeRef.current])

  return (
    <div className="tina-tailwind relative overflow-scroll h-screen">
      <FieldSelector style={style} hotkey={isEdit} fieldList={fieldList} />
      <iframe
        ref={iframeRef}
        style={style}
        className="w-full min-h-screen block"
        src={props.url}
      />
    </div>
  )
})

const FieldSelector = ({
  hotkey,
  style,
  fieldList,
}: {
  hotkey: boolean
  fieldList: Item[]
  style: React.CSSProperties
}) => {
  const [focusedField, setFocusedField] = React.useState<string | null>(null)
  const [hoveredField, setHoveredField] = React.useState<string | null>(null)
  useCMSEvent(
    'field:focus',
    (event) => {
      setFocusedField(`${event.id}#${event.fieldName}`)
    },
    []
  )
  useCMSEvent(
    'field:hover',
    (event) => {
      setHoveredField(`${event.id}#${event.fieldName}`)
    },
    []
  )

  if (fieldList.length) {
    return (
      <div
        style={style}
        className={`absolute top-0 left-0 right-0 min-h-screen pointer-events-none`}
      >
        {fieldList.map((fieldItem, i) => {
          return (
            <FieldListItem
              focused={focusedField === fieldItem.fieldName}
              hovered={hoveredField === fieldItem.fieldName}
              hotkey={hotkey}
              key={i}
              fieldItem={fieldItem}
            />
          )
        })}
      </div>
    )
  }
  return null
}

type Item = { fieldName: string; rect: DOMRect }

const FieldListItem = ({
  focused,
  hovered,
  hotkey,
  fieldItem,
}: {
  focused: boolean
  hovered: boolean
  hotkey: boolean
  fieldItem: Item
}) => {
  const cms = useCMS()
  const rect = fieldItem.rect
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    cms.events.dispatch({
      type: 'field:selected',
      value: fieldItem.fieldName,
    })
  }
  return (
    <button
      onClick={handleClick}
      type="button"
      // key={fieldItem.getAttribute('data-tinafield')}
      style={{
        top: rect.top,
        width: rect.width,
        left: rect.left,
        height: rect.height,
      }}
      className={`${hotkey ? 'pointer-events-auto' : 'pointer-events-none'} ${
        focused || hovered ? 'opacity-100' : hotkey ? 'opacity-20' : 'opacity-0'
      } hover:opacity-100 absolute border-2 border-dashed border-blue-300 rounded-sm hover:border-blue-500 transition`}
    >
      <span className="absolute inset-0 bg-blue-200 opacity-0 hover:opacity-10 transition" />
    </button>
  )
}

function useKeyPress() {
  const targetKey = 'e'
  const metaKey = 'Meta'
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = React.useState<boolean>(false)
  const [metaPressed, setMetaPressed] = React.useState<boolean>(false)

  // If pressed key is our target key then set to true
  const downHandler = React.useCallback(
    function downHandler({ key }: { key: string }) {
      if (key === targetKey) {
        setKeyPressed(true)
      }
      if (key === metaKey) {
        setMetaPressed(true)
      }
    },
    [metaPressed]
  )
  // If released key is our target key then set to false
  const upHandler = ({ key }: { key: string }) => {
    if (key === targetKey) {
      setKeyPressed(false)
    }
    if (key === metaKey) {
      setMetaPressed(false)
    }
  }
  // Add event listeners
  React.useEffect(() => {
    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, []) // Empty array ensures that effect is only run on mount and unmount
  return keyPressed && metaPressed
}
