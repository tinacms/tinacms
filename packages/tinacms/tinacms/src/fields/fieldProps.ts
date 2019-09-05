import { FieldRenderProps } from 'react-final-form'
import { Field } from '@tinacms/core'

export interface FieldProps<InputProps>
  extends FieldRenderProps<any, HTMLElement> {
  field: Field & InputProps
}
