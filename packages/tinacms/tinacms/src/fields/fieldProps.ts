import { FieldRenderProps } from 'react-final-form'
import { Field } from '@tinacms/core'

export interface FieldProps extends FieldRenderProps<any, HTMLElement> {
  field: Field
}
