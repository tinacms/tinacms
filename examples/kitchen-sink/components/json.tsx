import React, { Suspense, useEffect, useState } from 'react'

export function Json(props: { src: object }) {
  const [isClient, setIsClient] = useState(false)
  const ReactJson = React.lazy(() => import('react-json-view'))

  useEffect(() => {
    setIsClient(true)
  }, [])
  if (!isClient) {
    return null
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="mx-4 border rounded-lg p-8 shadow-lg">
        <ReactJson
          src={props.src}
          enableClipboard={false}
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
            return false
          }}
        />
      </div>
    </Suspense>
  )
}
