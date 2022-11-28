import React, { Suspense, useEffect, useState } from 'react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Prism } from 'tinacms/dist/rich-text/prism'
import { Explorer2 } from './explorer'

// react-json-view assumes global.document exists
const ReactJson = React.lazy(() => import('react-json-view'))

export function Json(props: { src: object }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  if (!isClient) {
    return null
  }

  return (
    <Suspense fallback={<div className="">Loading...</div>}>
      <div className="px-4">
        <div className="mx-auto my-8 border rounded-lg p-8 shadow-lg max-w-5xl mx-auto shadow-lg">
          <div className="h-full overflow-scroll">
            <Explorer2
              value={props.src}
              renderRichText={({ value }) => {
                return (
                  <div className="font-sans px-2 border-l-2 bg-gray-50 w-full prose">
                    <TinaMarkdown content={value} />
                  </div>
                )
              }}
              renderValue={({ value }) => {
                return <span className="text-orange-600">{value}</span>
              }}
            />
          </div>
        </div>
      </div>
    </Suspense>
  )
}

export const Markdown = (props) => {
  return (
    <div className="px-4">
      <div
        data-test="rich-text-body"
        className="mx-auto border max-w-5xl rounded-lg p-8 shadow-lg prose"
      >
        <TinaMarkdown
          content={props.content}
          components={{
            code_block: (props) => <Prism {...props} />,
            Hero: (props) => {
              return <Json src={props} />
            },
          }}
        />
      </div>
    </div>
  )
}
