import * as React from 'react'
import { MdKeyboardArrowDown } from 'react-icons/md'
import type { Field } from '@toolkit/forms'

type Option = {
  value: string
  label: string
}

interface SelectFieldProps {
  label?: string
  name: string
  component: string
  options: (Option | string)[]
}

export interface SelectProps {
  name: string
  input: React.SelectHTMLAttributes<HTMLSelectElement>
  field?: SelectFieldProps & Field
  disabled?: boolean
  options?: (Option | string)[]
  className?: string
}

export const selectFieldClasses =
  'shadow appearance-none bg-white block pl-3 pr-8 py-2 truncate w-full text-base cursor-pointer border border-gray-200 focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'

export const Select: React.FC<SelectProps> = ({
  input,
  field,
  options,
  className = '',
}) => {
  const selectOptions = options || field.options
  const ref = React.useRef(null)
  React.useEffect(() => {
    if (ref.current && field?.experimental_focusIntent) {
      ref.current.focus()
    }
  }, [field?.experimental_focusIntent, ref])

  return (
    <div className="relative group">
      <select
        id={input.name}
        ref={ref}
        value={input.value}
        onChange={input.onChange}
        className={`${selectFieldClasses} ${
          input.value ? 'text-gray-700' : 'text-gray-300'
        } } ${className}`}
        {...input}
      >
        {selectOptions ? (
          selectOptions.map(toProps).map(toComponent)
        ) : (
          <option>{input.value}</option>
        )}
      </select>
      <MdKeyboardArrowDown className="absolute top-1/2 right-2 w-6 h-auto -translate-y-1/2 text-gray-300 group-hover:text-blue-500 transition duration-150 ease-out pointer-events-none" />
    </div>
  )
}
function toProps(option: Option | string): Option {
  if (typeof option === 'object') return option
  return { value: option, label: option }
}

function toComponent(option: Option) {
  return (
    <option key={option.value} value={option.value}>
      {option.label}
    </option>
  )
}
