import * as React from 'react'
import { ColorPicker } from '@forestryio/xeditor-fields'
import { wrapFieldsWithMeta } from './wrapFieldWithMeta'

// TODO: `field` needs to be extensible
export const ColorPickerField = wrapFieldsWithMeta(({ input, field }) => {
  return <ColorPicker colorFormat={(field as any).colorFormat} input={input} />
})
