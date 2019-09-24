import * as React from 'react'
import { ColorPicker } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps } from 'react-select/lib/components/Input'

export interface ColorFieldProps {
  colorFormat: string
}
export const ColorField = wrapFieldsWithMeta<InputProps, ColorFieldProps>(
  ({ input, field }) => {
    return (
      <ColorPicker colorFormat={(field as any).colorFormat} input={input} />
    )
  }
)

export default {
  name: 'color',
  Component: ColorField,
}
