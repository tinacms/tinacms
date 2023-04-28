/**

*/
import React from 'react'
import { defineConfig, useCMS } from 'tinacms'
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

  const pressed = useKeyPress()

  // React.useEffect(() => {
  //   if (pressed) {
  //     iframeRef.current?.contentWindow?.postMessage({
  //       type: 'isEdit',
  //     })
  //   }
  // }, [pressed])

  const handleMessage = (e: MessageEvent) => {
    if (e.data.type === 'field:selected') {
      cms.events.dispatch({
        type: 'field:selected',
        value: e.data.fieldName,
      })
    }
  }

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
      <iframe
        id="tina-iframe"
        ref={iframeRef}
        className="w-full h-screen block"
        src={props.url}
      />
    </div>
  )
})

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
