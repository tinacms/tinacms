/**

*/
import React from 'react'
import { useMachine } from '@xstate/react'
import { queryMachine, initialContext } from './lib/machines/query-machine'
import { useCMS, defineConfig } from 'tinacms'
import type { formifyCallback as FormifyCallback } from 'tinacms/dist/hooks/use-graphql-forms'

type Config = Parameters<typeof defineConfig>[0]

type PostMessage = {
  type: 'open' | 'close' | 'isEditMode'
  id: string
  data: object
}

export const Preview = (
  props: Config & {
    url: string
    iframeRef: React.MutableRefObject<HTMLIFrameElement>
  }
) => {
  const [activeQuery, setActiveQuery] = React.useState<PostMessage | null>(null)

  React.useEffect(() => {
    if (props.iframeRef.current) {
      window.addEventListener('message', (event: MessageEvent<PostMessage>) => {
        if (event.data.type === 'open') {
          setActiveQuery(event.data)
        }
      })
      window.addEventListener('message', (event: MessageEvent<PostMessage>) => {
        if (event?.data?.type === 'isEditMode') {
          props.iframeRef?.current?.contentWindow?.postMessage({
            type: 'tina:editMode',
          })
        }
      })
    }
  }, [props.iframeRef.current])

  return (
    <div className="tina-tailwind">
      {activeQuery && (
        <QueryMachine
          key={activeQuery.id}
          payload={activeQuery}
          iframeRef={props.iframeRef}
          formifyCallback={props.formifyCallback}
        />
      )}
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

const QueryMachine = (props: {
  payload: PostMessage
  iframeRef: React.MutableRefObject<HTMLIFrameElement>
  formifyCallback: FormifyCallback
}) => {
  const cms = useCMS()

  const machine = React.useMemo(
    () =>
      queryMachine.withContext({
        ...initialContext,
        cms,
        // Enable registration of sub forms
        // registerSubForms: true,
        // @ts-ignore FIXME: add formifyCallback args to Config type
        formifyCallback: props.formifyCallback,
      }),
    []
  )

  const [state, send] = useMachine(machine)
  React.useEffect(() => {
    const unsubscribeFieldChange = cms.events.subscribe(
      `forms:fields:onChange`,
      (event) => {
        // Nested forms from rich-text also trigger this event
        if (Object.keys(state.context.documentMap).includes(event.formId)) {
          send({ type: 'FIELD_CHANGE' })
        }
      }
    )
    const unsubscribeReset = cms.events.subscribe(`forms:reset`, (event) => {
      if (Object.keys(state.context.documentMap).includes(event.formId)) {
        send({ type: 'FIELD_CHANGE' })
      }
    })

    return () => {
      unsubscribeFieldChange()
      unsubscribeReset()
    }
  }, [cms, state.context.documentMap])

  React.useEffect(() => {
    if (state.matches('pipeline.ready')) {
      cms.events.dispatch({ type: 'forms:register', value: 'complete' })
    } else if (state.matches('pipeline.initializing')) {
      cms.events.dispatch({ type: 'forms:register', value: 'start' })
    }
  }, [JSON.stringify(state.value)])

  React.useEffect(() => {
    if (props.iframeRef.current) {
      send({ type: 'IFRAME_MOUNTED', value: props.iframeRef.current })
      if (props.payload.type === 'open') {
        send({ type: 'ADD_QUERY', value: props.payload })
      }
      window.addEventListener('message', (event: MessageEvent<PostMessage>) => {
        // useTinaHook cleans itself up when the component unmounts by sending a close message
        if (event.data.type === 'close') {
          send({ type: 'REMOVE_QUERY' })
        }
      })
    }
  }, [props.iframeRef.current])

  return null
}
