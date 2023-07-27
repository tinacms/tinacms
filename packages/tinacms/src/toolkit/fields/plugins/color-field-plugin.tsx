import * as React from 'react'
import { ColorPicker, InputProps } from '../components'
import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { parse } from './text-format'

export interface ColorFieldProps {
  colorFormat: string
  colors: string[]
  widget?: 'sketch' | 'block'
}
export const ColorField = wrapFieldsWithMeta<InputProps, ColorFieldProps>(
  ({ input, field }) => {
    return (
      <ColorPicker
        colorFormat={(field as any).colorFormat}
        userColors={(field as any).colors}
        widget={(field as any).widget}
        input={input}
      />
    )
  }
)

export const ColorFieldPlugin = {
  name: 'color',
  Component: ColorField,
  parse,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && !value) return 'Required'
  },
}
