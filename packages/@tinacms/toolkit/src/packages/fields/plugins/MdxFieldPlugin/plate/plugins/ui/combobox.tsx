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

import React from 'react'
import { useTemplates } from '../../editor-context'
import { classNames } from './helpers'
import type { MdxTemplate } from '../../types'
import { useHotkey } from '../../hooks/embed-hooks'

type TemplateType = MdxTemplate

export type Dispatch = React.Dispatch<Action>
export type State = {
  initialTemplates: TemplateType[]
  activeIndex: number
  activeTemplates: TemplateType[]
  value: string
  status: 'pending' | 'selected' | 'cancelled'
}

type Action =
  | { type: 'selectItem'; value: number }
  | { type: 'selectCurrentItem' }
  | { type: 'updateValue'; value: string }
  | { type: 'move'; value: 'up' | 'down' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'selectItem':
      return {
        ...state,
        activeIndex: action.value,
        status: 'selected',
      }
    case 'updateValue':
      const lowerCaseValue = action.value.toLocaleLowerCase()
      const activeTemplates =
        lowerCaseValue === ''
          ? state.initialTemplates
          : state.activeTemplates.filter((template) => {
              return (
                template.name.toLocaleLowerCase().startsWith(lowerCaseValue) ||
                template.label.toLocaleLowerCase().startsWith(lowerCaseValue)
              )
            })

      if (activeTemplates.length === 0) {
        return {
          ...state,
          activeTemplates,
          activeIndex: 0,
          value: action.value,
          status: 'cancelled',
        }
      }
      return {
        ...state,
        activeTemplates,
        activeIndex: 0,
        value: action.value,
      }
    case 'selectCurrentItem':
      return {
        ...state,
        status: 'selected',
      }

    case 'move':
      if (action.value === 'down') {
        if (state.activeIndex === state.activeTemplates.length - 1) {
          return {
            ...state,
            activeIndex: 0,
          }
        } else {
          return {
            ...state,
            activeIndex: state.activeIndex + 1,
          }
        }
      }
      if (action.value === 'up') {
        if (state.activeIndex === 0) {
          return {
            ...state,
            activeIndex: state.activeTemplates.length - 1,
          }
        } else {
          return {
            ...state,
            activeIndex: state.activeIndex - 1,
          }
        }
      }
      throw new Error(`Unexpected value for move action ${action.value}`)
    default:
      return {
        ...state,
      }
  }
}

/**
 * This could (should?) be replaced by something like downshift, but in some
 * ways it's not like a traditional combobox because so much of what's needed
 * here should _not_ steal focus from the editor. Some of the combobox libraries
 * I've tried really shine when it comes to accessibility out-of-the-box which is
 * sort of the opposite of what we want here. I'm not sure of the best way to make
 * this accessible, but I have a feeling the plate combobox is the way to go.
 * At first glance, there's very little documentation for using it, though it
 * does seem to support bringing out own UI (it uses downshift).
 */
export function SearchAutocomplete(props: {
  value: string
  onValue: (value: { name: string; inline?: boolean }) => void
  onCancel: () => void
}) {
  const templates = useTemplates()

  const [state, dispatch] = React.useReducer(reducer, {
    activeIndex: 0,
    status: 'pending',
    value: props.value,
    initialTemplates: templates,
    activeTemplates: templates,
  })

  React.useEffect(() => {
    if (state.status === 'selected') {
      props.onValue(state.activeTemplates[state.activeIndex])
    }
    if (state.status === 'cancelled') {
      props.onCancel()
    }
  }, [state.status])

  React.useEffect(() => {
    dispatch({ type: 'updateValue', value: props.value })
  }, [props.value])

  useHotkey('escape', () => {
    props.onCancel()
  })

  useHotkey('ArrowDown', () => {
    dispatch({ type: 'move', value: 'down' })
  })
  useHotkey('ArrowUp', () => {
    dispatch({ type: 'move', value: 'up' })
  })
  const ref = React.useRef()
  useOnClickOutside(ref, () => props.onCancel())

  return (
    <span
      ref={ref}
      className="block w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[10rem] overflow-y-auto"
    >
      <span className="block py-1">
        {state.activeTemplates.length === 0 && (
          <span className="block px-4 py-2 text-sm text-left w-full text-gray-500">
            No matches found
          </span>
        )}
        {state.activeTemplates.map((activeTemplate, index) => {
          return (
            <span key={activeTemplate.key} className="block">
              <span
                onMouseDown={(e) => {
                  e.preventDefault()
                  dispatch({ type: 'selectItem', value: index })
                }}
                className={classNames(
                  index === state.activeIndex
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-700',
                  'cursor-pointer truncate block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {activeTemplate.label || activeTemplate.name}
              </span>
            </span>
          )
        })}
      </span>
    </span>
  )
}

// Hook
function useOnClickOutside(ref, handler) {
  React.useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
