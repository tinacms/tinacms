import { ReferenceFieldProps, Option } from './reference-field-props'

export interface ReferenceProps {
  name: string
  input: any
  field: ReferenceFieldProps
  disabled?: boolean
  options?: (Option | string)[]
}
