import * as React from 'react'
import { wrapFieldsWithMeta } from './wrap-field-with-meta'
import { NumberInput as BaseNumberField, InputProps } from '../components'
import { parse } from './number-format'

export const NumberField = wrapFieldsWithMeta<{
  step: string | number
  input: InputProps
}>(({ input, field }) => {
  // @ts-ignore field.step
  return <BaseNumberField {...input} step={field.step} />
})

export const NumberFieldPlugin = {
  name: 'number',
  Component: NumberField,
  parse,
  validate(value: any, values: any, meta: any, field: any) {
    if (field.required && typeof value !== 'number') return 'Required'
  },
}
