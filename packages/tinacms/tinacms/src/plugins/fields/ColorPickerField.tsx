import * as React from 'react'
import { ColorPicker } from '@tinacms/fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'
import { InputProps } from 'react-select/lib/components/Input'

interface ColorProps {
  colorFormat: string
}
export const ColorPickerField = wrapFieldsWithMeta<InputProps, ColorProps>(
  ({ input, field }) => {
    return (
      <ColorPicker colorFormat={(field as any).colorFormat} input={input} />
    )
  }
)

export default {
  name: 'color',
  Component: ColorPickerField,
}
