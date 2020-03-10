import * as React from 'react'
import { InlineTextFieldProps } from '../inline-field-text'
import { BlockField } from './inline-block-field'
import { InlineTextarea } from '../inline-field-textarea'

/**
 * InlineTextAreaField
 */
interface BlockTextArea {
  name: string
}
export function BlockTextArea({ name }: InlineTextFieldProps) {
  return (
    <BlockField name={name}>
      {({ input, status }) => {
        if (status === 'active') {
          return <InlineTextarea {...input} />
        }
        return <>{input.value}</>
      }}
    </BlockField>
  )
}
