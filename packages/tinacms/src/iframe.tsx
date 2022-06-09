import React from 'react'
import { useGraphqlForms } from './hooks/use-graphql-forms'
import { FormsView } from '@tinacms/toolkit'

export const Iframe = ({ url: u = '/' }) => {
  const [url, setUrl] = React.useState(u)
  const [state, setState] = React.useState({
    query: null,
    variables: {},
    data: {},
  })
  React.useEffect(() => {
    window.addEventListener(
      'message',
      (event) => {
        if (event.data.type === 'tina') {
          setState(event.data)
        }
      },
      false
    )
  }, [url])
  const ref = React.useRef()

  React.useEffect(() => {
    if (ref.current) {
      ref.current.contentWindow.postMessage({ ...state, type: 'tina-update' })
    }
  }, [JSON.stringify(state.data)])

  const [width, setWidth] = React.useState(1200)
  const [hideSidebar, setHideSibar] = React.useState(false)

  React.useEffect(() => {
    if (hideSidebar) {
      document.getElementById('admin-nav').style.display = 'none'
    } else {
      document.getElementById('admin-nav').style.display = 'block'
    }
  }, [hideSidebar])

  return (
    <div className="tina-tailwind">
      {state.query && <Data onUpdate={setState} {...state} />}
      <div className="grid grid-cols-2">
        <div className="">
          <FormsView />
        </div>
        <div className="w-full">
          <div
            style={{ height: '81.5px' }}
            className="w-full bg-white border-b border-gray-200 p-4 flex items-center gap-3"
          >
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="text"
              className="py-2.5 px-4 w-2/3 rounded-full border border-gray-200"
            />
            <div>
              <button onClick={() => setHideSibar((status) => !status)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </button>
              <button onClick={() => setWidth(400)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button onClick={() => setWidth(600)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button onClick={() => setWidth(1200)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div
            style={{ maxWidth: `${width}px` }}
            className="mx-auto rounded-lg shadow-lg overflow-hidden"
          >
            <iframe
              ref={ref}
              className="h-screen w-full border-gray-200 border-l"
              src={url}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const formifyCallback = ({ formConfig, createForm, createGlobalForm }) => {
  if (formConfig.id === 'content/global/index.json') {
    return createGlobalForm(formConfig)
  }

  return createForm(formConfig)
}

const Data = ({ onUpdate, ...state }) => {
  const [data] = useGraphqlForms({ ...state, formify: formifyCallback })
  React.useEffect(() => {
    onUpdate({ ...state, data })
  }, [JSON.stringify(data)])
  return null
}
