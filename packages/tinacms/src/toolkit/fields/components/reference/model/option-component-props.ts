import { InternalSys } from './reference-field-props'

export interface OptionComponentProps {
  id: string
  value: string
  field?: {
    optionComponent?: (
      values: unknown,
      internalSys: InternalSys
    ) => React.ReactNode
  }
  _values?: unknown
  node: {
    _internalSys: InternalSys
  }
  onSelect: (currentValue: string) => void
}
