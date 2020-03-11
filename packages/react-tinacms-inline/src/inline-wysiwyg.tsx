import * as React from 'react'
import { InlineField } from './inline-field'
import { Wysiwyg } from 'react-tinacms-editor'

interface InlineWysiwygFieldProps {
  name: string
  sticky?: string
  children: any
}

export function InlineWysiwyg({
  name,
  sticky,
  children,
}: InlineWysiwygFieldProps) {
  return (
    <InlineField name={name}>
      {({ input, status }: any) => {
        if (status === 'active') {
          return <Wysiwyg sticky={sticky} input={input} />
        }
        return <>{children}</>
      }}
    </InlineField>
  )
}
