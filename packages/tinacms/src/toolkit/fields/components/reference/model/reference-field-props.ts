import { CollectionFilters } from '../utils/fetch-options-query-builder'

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

type ReferenceFieldOptions = {
  optionComponent?: OptionComponent
  experimental___filter?: (list: Array<any>, searchQuery: string) => Array<any>
  collectionFilter?: CollectionFilters
}

export interface ReferenceFieldProps extends ReferenceFieldOptions {
  label?: string
  name: string
  component: string
  collections: string[]
  options: (Option | string)[]
}
