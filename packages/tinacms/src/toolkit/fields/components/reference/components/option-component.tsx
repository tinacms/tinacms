import React from 'react'
import { OptionComponentProps } from '../model/option-component-props'
import { CommandItem } from './command'

const OptionComponent: React.FC<OptionComponentProps> = ({
  id,
  value,
  field,
  _values,
  node,
  onSelect,
}) => {
  return (
    <CommandItem
      key={`${id}-option`}
      value={id}
      onSelect={(currentValue) => {
        onSelect(currentValue === value ? '' : currentValue)
      }}
    >
      <div className="flex flex-col w-full">
        {field?.optionComponent && _values ? (
          field.optionComponent(_values, node._internalSys)
        ) : (
          <span className="text-x">{id}</span>
        )}
      </div>
    </CommandItem>
  )
}

export default OptionComponent
