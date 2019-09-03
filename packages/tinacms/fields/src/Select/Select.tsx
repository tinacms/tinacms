import * as React from 'react'
import { useMemo, useCallback, useEffect, useState } from 'react'
import SelectBase, { components, Async } from 'react-select'
import { Props as ReactSelectProps } from 'react-select/lib/Select'
import { Props as AsyncProps } from 'react-select/lib/Async'
import { Icon } from '@tinacms/icons'

type Styles = {
  [key: string]: (provided: any, state: any) => object
}
// https://react-select.com/styles
const customStyles: Styles = {
  // The main container
  control: (provided, state) => ({
    ...provided,
    fontSize: '0.9rem',
    minHeight: 32,
    borderWidth: '1px',
    borderColor: state.isFocused ? '#333' : '#dedede',
    boxShadow: null,
  }),
  // The dropdown list items
  option: (provided, state) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
    height: 26,
    fontSize: '0.9rem',
    color: state.isSelected ? 'black' : '#666',
    backgroundColor: state.isDisabled
      ? null
      : state.isSelected
      ? '#f3f3f3'
      : state.isFocused
      ? '#fafafa'
      : null,
  }),
  // The selected value placed in the container
  singleValue: (provided, state) => ({
    ...provided,
    opacity: state.isDisabled ? 0.4 : 1,
    transition: 'opacity 300ms',
    color: 'black',
  }),
  dropdownIndicator: provided => ({
    ...provided,
    cursor: 'pointer',
  }),
  multiValue: (provided, state) => ({
    ...provided,
    borderRadius: 4.8,
    backgroundColor: '#f3f3f3',
  }),
  multiValueLabel: provided => ({
    ...provided,
  }),
  multiValueRemove: (provided, state) => ({
    ...provided,
    borderRadius: '0 0.3rem 0.3rem 0',
    backgroundColor: state.isFocused ? '#333' : null,
    padding: '0 0.4rem',
    cursor: 'pointer',
  }),
  noOptionsMessage: provided => ({
    ...provided,
    fontSize: '0.8rem',
    padding: '1rem 0',
  }),
}

const indicatorSeparatorStyle = {
  alignSelf: 'stretch',
  backgroundColor: '#dedede',
  marginBottom: 4,
  marginTop: 4,
  width: 1,
}

const clearIndicatorStyle = {
  fontSize: '0.8rem',
  cursor: 'pointer',
  padding: '0.5rem',
}

const DropdownIndicator = (props: any) => {
  return (
    // @ts-ignore
    <components.DropdownIndicator {...props}>
      <Icon name="ChevronDown" width={12} height={12} />
    </components.DropdownIndicator>
  )
}

const IndicatorSeparator = ({ innerProps }: any) => {
  return <span style={indicatorSeparatorStyle} {...innerProps} />
}

const MultiValueRemove = (props: any) => {
  return (
    <components.MultiValueRemove {...props}>
      <Icon name="X" width={8} height={8} />
    </components.MultiValueRemove>
  )
}

const ClearIndicator = (props: any) => {
  const {
    innerProps: { ref, ...restInnerProps },
  } = props
  return (
    <div style={clearIndicatorStyle} {...restInnerProps} ref={ref}>
      <Icon name="X" width={8} height={8} />
    </div>
  )
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface Option {
  label: string
  value: string | number
}

interface SelectProps
  extends Omit<ReactSelectProps, 'onChange' | 'options' | 'value'> {
  value: string | number
  options: (Option | string | number)[]
  onChange(value: string): any
}

/**
 * `Select` is an adapter for the `react-select` library.
 *
 * This adapter changes the API in 3 ways:
 *
 * 1. It expects the `value` prop to be a `string` instead of the selected `Option`
 * 2. The `onChange` prop is passed a `string` instead of the selected `Option`
 * 3. If `value` is not a valid option, it calls `onChange` to update it immediately
 * 4. The `options` prop can contain a list of strings
 * 5. It is styled specifically for Tina
 */
export function Select(props: SelectProps) {
  /**
   * Convert any `string`items to valid `Option`s.
   */
  let options = useMemo((): Option[] => {
    let o: any[] = props.options || []

    return o.map((o: any) => {
      if (['string', 'number'].indexOf(typeof o) >= 0) {
        return { label: o, value: o }
      }
      return o
    })
  }, [props.options])

  /**
   * Determine the selected `Option` based on `value` prop.
   */
  let selectedOption = useMemo(() => {
    return options.find(option => option.value === props.value)
  }, [options, props.value])

  /**
   * Calls the `onChange` prop with `option.value`.
   */
  let onChange = useCallback(
    (option?: Option) => {
      if (!option) return props.onChange('')
      return (props.onChange as any)(option.value as any)
    },
    [props.onChange]
  )

  /**
   * Calls `onChange` immediately to correct invalid data.
   */
  useEffect(
    function fixInvalidData() {
      // If we found an option, don't do anything.
      if (selectedOption || props.isLoading) return

      // If we didn't, then `props.value` is an invalid option.
      if (props.isClearable) {
        // If the select isClearable
        // and the value is not empty
        // then clear the value
        if (props.value) onChange()
      } else {
        // otherwise set it to the first option (doesn't matter if it exists)
        onChange(options[0])
      }
    },
    [props.value, props.isLoading, props.isClearable]
  )

  return (
    <SelectBase
      styles={customStyles}
      theme={theme => ({
        ...theme,
        borderRadius: 4.8,
        colors: {
          ...theme.colors,
          primary: '#333',
          primary50: '#dedede',
        },
      })}
      {...props}
      options={options}
      value={selectedOption}
      // @ts-ignore
      onChange={onChange}
      components={{
        ClearIndicator,
        DropdownIndicator,
        MultiValueRemove,
        IndicatorSeparator,
        ...props.components,
      }}
    />
  )
}

interface AsyncFieldProps<O> extends AsyncProps<O> {
  // this will trigger a reload anytime the loadOptions datasource changes. Use this carefully, as passing in non-memoized loadOptions
  /// can have big performance impacts
  // You should properly wrap loadOptions in a callback to prevent lockup
  dynamicOptions?: boolean
}

export function AsyncSelect<O = any>({
  dynamicOptions = false,
  ...props
}: AsyncFieldProps<O>) {
  // hack to force refresh of data whenever loadOptions changes
  // see react select issue: https://github.com/JedWatson/react-select/issues/1581
  const [loadedOptionsChangedCount, setLoadedOptionsChangedCount] = useState(0)
  React.useEffect(() => {
    if (dynamicOptions) {
      setLoadedOptionsChangedCount(loadedOptionsChangedCount + 1)
    }
  }, [props.loadOptions, dynamicOptions])

  return (
    <Async
      styles={customStyles}
      theme={theme => ({
        ...theme,
        borderRadius: 4.8,
        colors: {
          ...theme.colors,
          primary: '#333',
          primary50: '#dedede',
        },
      })}
      {...props}
      key={`async-${loadedOptionsChangedCount}`}
      components={{
        ClearIndicator,
        DropdownIndicator,
        MultiValueRemove,
        IndicatorSeparator,
        ...props.components,
      }}
    />
  )
}

export { AsyncProps, SelectProps }
