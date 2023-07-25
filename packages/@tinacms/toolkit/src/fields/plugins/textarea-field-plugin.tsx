import * as React from 'react'
import { TextArea, InputProps } from '../components'
import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { parse } from './text-format'

export const TextareaField = wrapFieldsWithMeta<{ input: InputProps }>(
  (props) => {
    const ref = React.useRef(null)
    React.useEffect(() => {
      if (ref.current && props.field.experimental_focusIntent) {
        const el = ref.current
        el.focus()
        // Move the cursor to the end of the text
        el.setSelectionRange(el.value.length, el.value.length)
      }
    }, [props.field.experimental_focusIntent, ref])

    return <TextArea ref={ref} {...props.input} />
  }
)
export const TextareaFieldPlugin = {
  name: 'textarea',
  Component: TextareaField,
  parse,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
}
