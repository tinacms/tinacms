import { FieldRenderProps } from 'react-final-form'

export interface Props<ExtraFieldProps>
  extends FieldRenderProps<any, HTMLElement> {
  field: any
  extraProps: ExtraFieldProps
}
