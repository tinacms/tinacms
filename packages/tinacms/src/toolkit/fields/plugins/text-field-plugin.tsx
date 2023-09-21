import * as React from 'react'
import { BaseTextField, InputProps } from '../components'
import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { parse } from './text-format'
import get from 'lodash.get'
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
  validate(value: any, allValues: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
    if (field.isIdentifier) {
      const path = field.name.split('.')
      const fieldName = path[path.length - 1]
      const parent = path.slice(0, path.length - 2)
      const items = get(allValues, parent)
      if (items?.filter((item: any) => item[fieldName] === value)?.length > 1) {
        return `Item with this identifier already exists`
      }
    }
  },
  parse,
}
