import * as React from 'react'
import { BaseTextField, InputProps } from '../components'
import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { parse } from './text-format'
interface ExtraProps {
  placeholder: string
  disabled?: boolean
}
export const TextField = wrapFieldsWithMeta<{}, InputProps & ExtraProps>(
  (props) => {
    const ref = React.useRef(null)
    React.useEffect(() => {
      if (ref.current && props.field.experimental_focusIntent) {
        ref.current.focus()
      }
    }, [props.field.experimental_focusIntent, ref])

    return (
      <BaseTextField
        {...props.input}
        ref={ref}
        disabled={props.field?.disabled ?? false}
        placeholder={props.field.placeholder}
      />
    )
  }
)

export const TextFieldPlugin = {
  name: 'text',
  Component: TextField,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
  parse,
}
