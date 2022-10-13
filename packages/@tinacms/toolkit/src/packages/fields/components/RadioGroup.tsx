/**

Copyright 2021 Forestry.io Holdings, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'

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
  variant?: 'radio' | 'button'
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
  const [activeRadioRef, setActiveRadioRef] =
    React.useState<HTMLDivElement | null>(null)
  const radioOptions = options || field.options
  const radioRefs: RadioRefsInterface = {}

  React.useEffect(() => {
    setActiveRadioRef(radioRefs[`radio_${input.value}`])
  }, [input.value])

  const toProps = (option: Option | string): Option => {
    if (typeof option === 'object') return option
    return { value: option, label: option }
  }

  const toComponent = (option: Option) => {
    const optionId = `field-${field.name}-option-${option.value}`
    const checked = option.value === input.value

    return (
      <div
        className={field.variant === 'button' ? 'flex-1' : ''}
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
            console.log(optionId, event)
            console.log(event.target)
            console.log(event.target.value)
            input.onChange(event.target.value)
          }}
          checked={checked}
        />
        <RadioOption
          htmlFor={optionId}
          checked={checked}
          variant={field.variant}
        >
          <Label variant={field.variant}>{option.label}</Label>
        </RadioOption>
      </div>
    )
  }

  return (
    <RadioOptions
      id={input.name}
      direction={field.direction}
      variant={field.variant}
    >
      {field.variant === 'button' && (
        <ActiveRadioIndicator
          width={activeRadioRef?.offsetWidth}
          height={activeRadioRef?.offsetHeight}
          left={activeRadioRef?.offsetLeft}
          top={activeRadioRef?.offsetTop}
          hasValue={!!input.value}
        />
      )}
      {radioOptions ? radioOptions.map(toProps).map(toComponent) : input.value}
    </RadioOptions>
  )
}

const Label = ({ variant, ...props }) => (
  <span className={variant === 'button' ? 'relative' : ''} {...props} />
)
const ActiveRadioIndicator = ({
  hasValue,
  left,
  top,
  width,
  height,
  style = {},
  className = '',
  ...props
}) => (
  <div
    className={`absolute transition-all duration-100 ease-out bg-blue-500 shadow-[0_2px_3px_rgba(0,0,0,0.12)] rounded-3xl h-[34px] pointer-events-none ${className}`}
    style={{
      backfaceVisibility: 'hidden',
      width,
      height: height ? width : '',
      left,
      top,
      transform: `scale(${hasValue ? `1` : `0`})`,
      ...style,
    }}
    {...props}
  />
)

const RadioOptions = ({ direction, variant, className = '', ...props }) => (
  <div
    className={`flex pt-1 ${
      variant === 'button'
        ? 'min-h-[42px] bg-white rounded-3xl text-blue-500 padding-[3px] shadow-[0_0_0_0_#e1ddec] transition-all duration-100 ease-out gap-[3px] [&:not(:active)]:[&:not(:focus-within)]:hover:shadow-[0_0_0_2px_#e1ddec] focus-within:shadow-[0_0_0_2px_#0084ff] active:shadow-[0_0_0_2px_#0084ff]'
        : 'gap-3 flex-wrap'
    } ${direction === 'vertical' ? 'flex-col' : ''} ${className}`}
    {...props}
  />
)

const RadioOption = ({ checked, variant, className = '', ...props }) => (
  <label
    className={`flex items-center text-[13px] ${
      variant === 'button'
        ? `flex-1 text-center rounded-3xl font-normal cursor-pointer h-[34px] px-3 transition-all duration-100 ease-out m-0 border-none justify-center ${
            checked ? 'text-white' : 'text-blue-500'
          } [&:not(:active)]:hover:bg-gray-50 active:bg-gray-100`
        : `before:content-[""] before:block before:w-4 before:h-4 before:mr-1 before:rounded-3xl before:bg-blue-500 ${
            checked
              ? 'before:border before:border-solid before:border-blue-500'
              : 'before:border-gray-100'
          } before:shadow-[0_0_0_0_#e1ddec,_inset_0_0_0_8px_white] before:transition-all before:duration-100 before:ease-out ${
            checked
              ? 'before:shadow-[0_0_0_0_#0084ff,_inset_0_0_0_4px_white] [input:focus+&:before]:border [input:focus+&:before]:border-solid [input:focus+&:before]:border-gray-100 [input:focus+&:before]:shadow-[0_0_0_2px_#0084ff,_inset_0_0_0_4px_white]'
              : '[input:focus+&:before]:border [input:focus+&:before]:border-solid [input:focus+&:before]:border-gray-100 [input:focus+&:before]:shadow-[0_0_0_2px_#0084ff,_inset_0_0_0_8px_white] hover:before:shadow-[0_0_0_2px_#e1ddec,_inset_0_0_0_8px_white]'
          } ${className}`
    }`}
    {...props}
  />
)
