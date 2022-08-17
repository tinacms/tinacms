import React from 'react'
import { useMachine } from '@xstate/react'
import { cms, queryMachine } from '../../lib/machines/query-machine'
import { TinaCMSProvider, TinaUI, textFieldClasses } from 'tinacms'

export const Preview = () => {
  const [state, send] = useMachine(queryMachine, {})
  const ref = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    // console.log(state.value)
  }, [JSON.stringify(state.value)])

  React.useEffect(() => {
    if (ref.current) {
      send({ type: 'IFRAME_MOUNTED', value: ref.current })
      window.addEventListener('message', (event) => {
        console.log('parent: event received', event.data.type)
        if (event.data.type === 'open') {
          send({ type: 'ADD_QUERY', value: event.data })
        }
        if (event.data.type === 'close') {
          send({ type: 'REMOVE_QUERY', value: event.data.id })
        }
      })
    }
  }, [ref.current])
  React.useEffect(() => {
    setInterval(() => {
      if (ref.current) {
        const href = ref.current.contentWindow?.location.href
        if (href) {
          send({
            type: 'SET_URL',
            value: href,
          })
        }
      }
    }, 1000)
  }, [ref.current])

  const selectedDocument =
    state.context.documentMap[state.context.selectedDocument || '']

  const form = selectedDocument?.ref?.getSnapshot()?.context?.form

  return (
    <div className="h-full overflow-scroll">
      <TinaCMSProvider cms={cms}>
        <TinaUI>
          <div className="">
            <div className="col-span-5 ">
              <div className="h-screen flex flex-col">
                <div className="col-span-2 bg-gray-50 border-b border-gray-200">
                  <div className="px-14 py-3">
                    <input
                      type="text"
                      style={{ borderRadius: '50px' }}
                      className={`${textFieldClasses}`}
                      value={state.context.url}
                    />
                  </div>
                </div>
                <div className="relative flex-1 bg-indigo-50 col-span-2 overflow-scroll">
                  {/* <div className="w-full h-full bg-green-300" /> */}
                  <iframe
                    ref={ref}
                    className="h-full w-full bg-white"
                    // src={'http://localhost:3000/posts/dynamic-routing'}
                    // src={'http://localhost:3000/p/dynamic-routing'}
                    // src={'http://localhost:3000/p/groundhog-day'}
                    src={'http://localhost:3000'}
                  />
                </div>
              </div>
            </div>
          </div>
        </TinaUI>
      </TinaCMSProvider>
    </div>
  )
}
