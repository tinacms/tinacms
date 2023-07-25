import { Field, FormApi } from '@toolkit/forms'
import { FieldRenderProps } from '@toolkit/form-builder'

export interface FieldProps<InputProps>
  extends FieldRenderProps<any, HTMLElement> {
  field: Field & InputProps
  form: FormApi
}
