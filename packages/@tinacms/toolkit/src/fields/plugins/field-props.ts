import { Field, FormApi } from '@/forms'
import { FieldRenderProps } from '@/form-builder'

export interface FieldProps<InputProps>
  extends FieldRenderProps<any, HTMLElement> {
  field: Field & InputProps
  form: FormApi
}
