import * as React from 'react'
import { BiCheck } from 'react-icons/bi'

type Option = {
  value: string
  label: string
}

interface RadioGroupFieldProps {
  label?: string
  name: string
  component: string
  options: (Option | string)[]
  direction?: 'horizontal' | 'vertical'
}

interface RadioRefsInterface {
  [key: string]: HTMLDivElement | null
}

export interface RadioGroupProps {
  name: string
  input: any
  field: RadioGroupFieldProps
  disabled?: boolean
  options?: (Option | string)[]
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  input,
  field,
  options,
}) => {
  const radioOptions = options || field.options
  const radioRefs: RadioRefsInterface = {}

  const toProps = (option: Option | string): Option => {
    if (typeof option === 'object') return option
    return { value: option, label: option }
  }

  const toComponent = (option: Option) => {
    const optionId = `field-${field.name}-option-${option.value}`
    const checked = option.value === input.value

    return (
      <div
        key={option.value}
        ref={(ref) => {
          radioRefs[`radio_${option.value}`] = ref
        }}
      >
        <input
          className="absolute w-0 h-0 opacity-0 cursor-pointer"
          type="radio"
          id={optionId}
          name={input.name}
          value={option.value}
          // https://github.com/final-form/react-final-form/issues/392#issuecomment-543118944
          onChange={(event) => {
            input.onChange(event.target.value)
          }}
          checked={checked}
        />
        <RadioOption htmlFor={optionId} checked={checked}>
          {option.label}
        </RadioOption>
      </div>
    )
  }

  return (
    <RadioOptions id={input.name} direction={field.direction}>
      {radioOptions ? radioOptions.map(toProps).map(toComponent) : input.value}
    </RadioOptions>
  )
}

const RadioOptions = ({ direction, children, ...props }) => (
  <div
    className={`flex w-full ${
      direction === 'horizontal'
        ? 'flex-wrap gap-y-1 gap-x-3'
        : 'flex-col gap-1'
    }`}
    {...props}
  >
    {children}
  </div>
)

const RadioOption = ({ checked, htmlFor, children, ...props }) => (
  <label
    className="cursor-pointer flex group items-center gap-2"
    htmlFor={htmlFor}
    {...props}
  >
    <span
      className={`relative h-[19px] w-[19px] rounded-full border text-indigo-600 focus:ring-indigo-500 transition ease-out duration-150 ${
        checked
          ? 'border-blue-500 bg-blue-500 shadow-sm group-hover:bg-blue-400 group-hover:border-blue-400'
          : 'border-gray-200 bg-white shadow-inner group-hover:bg-gray-100'
      }`}
    >
      <BiCheck
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[17px] h-[17px] transition ease-out duration-150 ${
          checked
            ? 'opacity-100 text-white group-hover:opacity-80'
            : 'text-blue-500 opacity-0 grou-hover:opacity-30'
        }`}
      />
    </span>
    <span
      className={`relative transition ease-out duration-150 ${
        checked
          ? 'text-gray-800 opacity-100'
          : 'text-gray-700 opacity-70 group-hover:opacity-100'
      }`}
    >
      {children}
    </span>
  </label>
)
