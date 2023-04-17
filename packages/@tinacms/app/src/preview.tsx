/**

*/
import React from 'react'
import { defineConfig, useCMS } from 'tinacms'
import { useGraphQLReducer } from './lib/graphql-reducer'
import { useParams, useSearchParams } from 'react-router-dom'

type Config = Parameters<typeof defineConfig>[0]

export const Preview = (
  props: Config & {
    url: string
    iframeRef: React.MutableRefObject<HTMLIFrameElement>
  }
) => {
  const { status } = useGraphQLReducer(props.iframeRef, props.url)
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

  return (
    <div className="tina-tailwind">
      <iframe
        data-test="tina-iframe"
        id="tina-iframe"
        ref={props.iframeRef}
        className="h-screen w-full bg-white"
        src={props.url}
      />
    </div>
  )
}
