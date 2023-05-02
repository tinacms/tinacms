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
        const [formId, fieldName] = activeField.split('__')
        if (formId && fieldName) {
          cms.dispatch({ type: 'forms:set-active-form-id', value: formId })
          cms.dispatch({
            type: 'forms:set-active-field-name',
            value: fieldName,
          })
        }
      }
    }
  }, [status])

  const handleMessage = (e: MessageEvent) => {
    if (e.data.type === 'field:selected') {
      const [formId, fieldName] = e.data.fieldName.split('#')
      if (formId && fieldName) {
        cms.dispatch({ type: 'forms:set-active-form-id', value: formId })
        cms.dispatch({
          type: 'forms:set-active-field-name',
          value: fieldName,
        })
      }
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
