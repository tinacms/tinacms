/**



*/

import { Listbox, Transition } from '@headlessui/react'
import * as React from 'react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid'

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

interface SelectComponentOverrides {
  prefix?: React.FC<SelectSlotProps>
  label?: React.FC<SelectSlotProps>
  subLabel?: React.FC<SelectSlotProps>
  suffix?: React.FC<SelectSlotProps>
}

export interface SelectProps {
  name: string
  input: React.SelectHTMLAttributes<HTMLSelectElement>
  field?: SelectFieldProps
  disabled?: boolean
  options?: (Option | string)[]
  componentOverrides?: SelectComponentOverrides
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export const selectFieldClasses =
  'min-w-[200px] shadow appearance-none bg-white block text-left pl-3 pr-8 py-2 truncate w-full text-base cursor-pointer border border-gray-200 focus:outline-none focus:ring-blue-500 focus:ring-1 focus:border-blue-500 sm:text-sm rounded-md'

function optionByValue(options: (Option | string)[], value: any) {
  return options.find((option) => {
    if (typeof option === 'string') {
      return option === value
    }
    return option.value === value
  })
}

export const Select: React.FC<SelectProps> = ({
  input,
  field,
  options,
  componentOverrides,
}) => {
  const selectOptions = options || field.options
  const [selected, setSelected] = React.useState(
    optionByValue(selectOptions, input.value) || selectOptions[0]
  )

  React.useEffect(() => {
    const option = optionByValue(selectOptions, input.value)
    if (option) {
      setSelected(option)
    }
  }, [input.value])

  const onChange = (value: string | number | string[]) => {
    const option = optionByValue(selectOptions, value)
    console.log('onChange', value, option)
    input.onChange({
      target: {
        value: option['value'] ?? value,
        name: input.name,
      },
    } as any)
  }

  return (
    <div className="relative group">
      <Listbox value={input.value} onChange={onChange}>
        {({ open }) => (
          <>
            <div className="relative mt-2">
              <Listbox.Button
                className={classNames(
                  'flex items-center space-x-1',
                  selectFieldClasses
                )}
              >
                {componentOverrides?.prefix &&
                  componentOverrides.prefix({
                    option: selected as any,
                    active: false,
                    selected: false,
                  })}
                <span
                  className={classNames(
                    'block truncate',
                    selected['value']?.length < 1 && 'text-gray-400 italic'
                  )}
                >
                  {selected['label'] ?? '-'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDownIcon
                    className="h-5 w-5 text-gray-300"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={React.Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 -translate-y-1"
                enterTo="transform opacity-100 100 translate-y-0"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 100 translate-y-0"
                leaveTo="transform opacity-0 -translate-y-1"
              >
                <Listbox.Options className="absolute !z-[1000] !min-w-[200px] origin-top z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white p-0.5 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {selectOptions.map(toProps).map((option: Option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) =>
                        classNames(
                          'relative cursor-default select-none py-2.5 px-3 pr-1 text-sm rounded',
                          active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        )
                      }
                      title={option.label ?? option.value}
                      value={option.value}
                    >
                      {({ selected, active }) => {
                        const isEmpty = option.value?.length < 1
                        return (
                          <div className="flex items-center space-x-1">
                            {componentOverrides?.prefix &&
                              componentOverrides.prefix({
                                option: option,
                                active: active,
                                selected: selected,
                              })}
                            <div
                              className={classNames(
                                'w-full flex flex-col pr-5',
                                isEmpty && 'italic',
                                isEmpty && active && 'text-white/90',
                                isEmpty &&
                                  !selected &&
                                  !active &&
                                  'text-gray-400'
                              )}
                            >
                              {componentOverrides?.label ? (
                                componentOverrides.label({
                                  option: option,
                                  active: active,
                                  selected: selected,
                                })
                              ) : (
                                <OptionLabel
                                  option={option}
                                  active={active}
                                  selected={selected}
                                />
                              )}
                              {componentOverrides?.subLabel && (
                                <div
                                  className={classNames(
                                    'text-xs font-normal truncate',
                                    !selected && !active && 'text-gray-400'
                                  )}
                                >
                                  {componentOverrides.subLabel({
                                    option: option,
                                    active: active,
                                    selected: selected,
                                  })}
                                </div>
                              )}
                            </div>
                            {componentOverrides?.suffix ? (
                              <div
                                className={classNames(
                                  active ? 'text-white' : 'text-blue-500',
                                  'flex items-center'
                                )}
                              >
                                {componentOverrides.suffix({
                                  option: option,
                                  active: active,
                                  selected: selected,
                                })}
                              </div>
                            ) : (
                              <OptionSuffix
                                option={option}
                                active={active}
                                selected={selected}
                              />
                            )}
                          </div>
                        )
                      }}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
    </div>
  )
}

interface SelectSlotProps {
  option: Option
  active: boolean
  selected: boolean
}

/* option label component */
export const OptionLabel = function ({
  option,
  active,
  selected,
}: SelectSlotProps) {
  const label = option.label ?? option.value
  const value = option.value
  const isEmpty = value?.length < 1
  return (
    <span
      className={classNames(
        selected ? 'font-semibold' : 'font-normal',
        isEmpty && 'italic',
        isEmpty && active && '!text-white/90',
        isEmpty && !selected && 'text-gray-400',
        'block truncate'
      )}
    >
      <span>{label}</span>
    </span>
  )
}

/* suffix after option item, used to show checkmark on selected item */
export const OptionSuffix = function ({ active, selected }: SelectSlotProps) {
  if (!selected) return null
  return (
    <span
      className={classNames(
        active ? 'text-white' : 'text-blue-500',
        'absolute inset-y-0 right-0 flex items-center pr-2.5'
      )}
    >
      <CheckIcon className="h-4 w-4" aria-hidden="true" />
    </span>
  )
}

function toProps(option: Option | string): Option {
  if (typeof option === 'object') return option
  return { value: option, label: option }
}
