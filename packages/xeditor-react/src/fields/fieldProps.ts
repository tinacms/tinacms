import { FieldRenderProps } from 'react-final-form'
import { Field } from '@forestryio/cms'

export interface FieldProps extends FieldRenderProps<any, HTMLElement> {
  field: Field
}
