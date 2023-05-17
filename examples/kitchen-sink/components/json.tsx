import React, { Suspense, useEffect, useState } from 'react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { Prism } from 'tinacms/dist/rich-text/prism'
import { tinaField } from 'tinacms/dist/react'
import { Explorer2 } from './explorer'

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
              renderValue={({ value, keyName, parentValue, parentKeyName }) => {
                let fieldName = ''
                if (!isNaN(Number(keyName))) {
                  fieldName = `${tinaField(
                    parentValue,
                    parentKeyName
                  )}.${keyName}`
                } else {
                  fieldName = tinaField(parentValue, keyName)
                }
                return (
                  <span className="text-orange-600" data-tinafield={fieldName}>
                    {value}
                  </span>
                )
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
