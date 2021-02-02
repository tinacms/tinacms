/**

Copyright 2019 Forestry.io Inc

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
import styled from 'styled-components'

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
  const [
    activeRadioRef,
    setActiveRadioRef,
  ] = React.useState<HTMLDivElement | null>(null)
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
      <RadioOptionWrap
        key={option.value}
        variant={field.variant}
        ref={ref => {
          radioRefs[`radio_${option.value}`] = ref
        }}
      >
        <input
          type="radio"
          id={optionId}
          name={input.name}
          value={option.value}
          onChange={input.onChange}
          checked={checked}
        />
        <RadioOption
          htmlFor={optionId}
          checked={checked}
          variant={field.variant}
        >
          <Label variant={field.variant}>{option.label}</Label>
        </RadioOption>
      </RadioOptionWrap>
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

const Label = styled.span<{ variant?: 'radio' | 'button' }>`
  ${p => (p.variant === 'button' ? `position: relative;` : ``)}
`

const ActiveRadioIndicator = styled.div<{
  hasValue: boolean
  left: number | undefined
  top: number | undefined
  width: number | undefined
  height: number | undefined
}>`
  position: absolute;
  ${p => (p.width ? `width: ${p.width}px;` : ``)};
  ${p => (p.height ? `height: ${p.width}px;` : ``)};
  ${p => (p.left ? `left: ${p.left}px;` : ``)};
  ${p => (p.top ? `top: ${p.top}px;` : ``)}
  ${p =>
    `transform: scale(${
      p.hasValue ? `1` : `0`
    });`}
  transition: all 85ms ease-out;
  backface-visibility: hidden;
  background-color: var(--tina-color-primary);
  box-shadow: var(--tina-shadow-small);
  border-radius: var(--tina-radius-big);
  height: calc(40px - 6px);
  pointer-events: none;
`

const RadioOptions = styled.div<{
  direction?: 'horizontal' | 'vertical'
  variant?: 'radio' | 'button'
}>`
  display: flex;
  padding-top: 4px;
  ${p =>
    p.variant === 'button'
      ? `
    min-height: calc(40px + 2px);
    background-color: var(--tina-color-grey-0);
    border-radius: var(--tina-radius-big);
    box-shadow: var(--tina-shadow-small);
    background-color: var(--tina-color-grey-0);
    border: 1px solid var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    padding: 3px;
    box-shadow: 0 0 0 0 var(--tina-color-grey-3);
    transition: all 85ms ease-out;
    gap: 3px;
    &:hover {
      box-shadow: 0 0 0 2px var(--tina-color-grey-3);
    }
    &:focus-within, &:active {
      box-shadow: 0 0 0 2px var(--tina-color-primary);
    }
  `
      : `
    gap: 12px;
    flex-wrap: wrap;
  `}
  ${p => (p.direction === 'vertical' ? `flex-direction: column;` : ``)}
`
const RadioOptionWrap = styled.div<{
  direction?: 'horizontal' | 'vertical'
  variant?: 'radio' | 'button'
}>`
  ${p =>
    p.variant === 'button'
      ? `
      
    flex: 1;
    `
      : ``}
  & > input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
`

const RadioOption = styled.label<{
  checked: boolean
  variant?: 'radio' | 'button'
  htmlFor: string
}>`
  display: flex;
  align-items: center;
  font-size: var(--tina-font-size-1);
  ${p =>
    p.variant === 'button'
      ? `
    flex: 1;
    text-align: center;
    border-radius: var(--tina-radius-big);
    border: 1px solid var(--tina-color-grey-2);
    color: var(--tina-color-primary);
    font-weight: var(--tina-font-weight-regular);
    cursor: pointer;
    font-size: var(--tina-font-size-1);
    height: calc(40px - 6px);
    padding: 0 var(--tina-padding-small);
    transition: all 85ms ease-out;
    margin: 0;
    border: none;
    text-align: center;
    justify-content: center;
    input:checked + & {
      color: var(--tina-color-grey-0);
    }
    &:hover {
      background-color: var(--tina-color-grey-1);
    }
    &:active {
      background-color: var(--tina-color-grey-2);
    }
  `
      : `
  &:before {
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    border-radius: var(--tina-radius-big);
    background-color: var(--tina-color-primary);
    border: 1px solid var(${(p: { checked: boolean }) =>
      p.checked ? `--tina-color-primary` : `--tina-color-grey-2`});
    box-shadow: 0 0 0 0 var(--tina-color-grey-3), inset 0 0 0 8px white;
    transition: all 85ms ease-out;
  }
  &:hover:before {
    box-shadow: 0 0 0 2px var(--tina-color-grey-3), inset 0 0 0 8px white;
  }
  input:focus + &:before {
    border: 1px solid var(--tina-color-grey-2);
    box-shadow: 0 0 0 2px var(--tina-color-primary), inset 0 0 0 8px white;
  }
  input:checked + &:before {
    border: 1px solid var(--tina-color-primary);
    box-shadow: 0 0 0 0 var(--tina-color-primary), inset 0 0 0 4px white;
  }
  input:checked:focus + &:before {
    border: 1px solid var(--tina-color-grey-2);
    box-shadow: 0 0 0 2px var(--tina-color-primary), inset 0 0 0 4px white;
  }
  `}
`
