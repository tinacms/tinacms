export type Option = {
  value: string
  label: string
}

type OptionComponent = (
  props: unknown,
  _sys: InternalSys
) => React.ReactElement | string

export interface InternalSys {
  filename: string
  path: string
}
export interface ReferenceFieldProps {
  label?: string
  name: string
  component: string
  collections: string[]
  options: (Option | string)[]
  optionComponent: OptionComponent
}
