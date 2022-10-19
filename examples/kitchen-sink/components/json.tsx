import React, { Suspense, useEffect, useState } from 'react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'

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
    <Suspense fallback={<div>Loading...</div>}>
      <div className="mx-auto my-8 border rounded-lg p-8 shadow-lg max-w-5xl mx-auto shadow-lg">
        <ReactJson
          src={props.src}
          name={false}
          enableClipboard={false}
          iconStyle="square"
          displayDataTypes={false}
          quotesOnKeys={false}
          displayObjectSize={false}
          displayArrayKey={false}
          shouldCollapse={(item) => {
            if (
              ['_sys', '_internalValues', '_internalSys'].includes(item?.name)
            ) {
              return true
            }
            // Hide rich-text objects by default
            if (item?.src?.type === 'root') {
              return true
            }
            return false
          }}
        />
      </div>
    </Suspense>
  )
}

export const Markdown = (props) => {
  return (
    <div
      data-test="rich-text-body"
      className="mx-auto border max-w-5xl rounded-lg p-8 shadow-lg prose"
    >
      <TinaMarkdown content={props.content} />
    </div>
  )
}
