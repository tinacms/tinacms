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
import { useFilter } from '@react-aria/i18n'
import { useTemplates } from '../../editor-context'
import { useKeyPress } from '../../hooks/use-key-press'
import { classNames } from './helpers'
import type { MdxTemplate } from '../../types'

type TemplateType = MdxTemplate & { selected?: boolean }

const findSelectedIndex = (activeTemplates) =>
  activeTemplates.findIndex(({ selected }) => !!selected)
const findSelected = (activeTemplates: TemplateType[]) =>
  activeTemplates.find(({ selected }) => !!selected)

export function SearchAutocomplete(props: {
  value: string
  onValue: (value: { name: string; inline?: boolean }) => void
  onCancel: () => void
  onMatches: (count: number) => void
}) {
  const templates = useTemplates()
  const arrowDownPressed = useKeyPress('ArrowDown')
  const arrowUpPressed = useKeyPress('ArrowUp')
  const enterPressed = useKeyPress('Enter')
  const escapePressed = useKeyPress('Escape')
  const initialTemplates = templates as TemplateType[]

  const [activeTemplates, setTemplates] =
    React.useState<TemplateType[]>(initialTemplates)

  React.useEffect(() => {
    props.onMatches(activeTemplates.length)
  }, [activeTemplates.length])

  const { contains } = useFilter({
    sensitivity: 'base',
  })

  React.useEffect(() => {
    if (escapePressed) {
      props.onCancel()
    }
  }, [escapePressed])

  React.useEffect(() => {
    if (enterPressed) {
      const selected = findSelected(activeTemplates)
      if (selected) {
        props.onValue(selected)
      } else {
        // If none selected, choose the first item
        // TODO: this should highlight the item
        props.onValue(activeTemplates[0])
      }
    }
  }, [enterPressed, activeTemplates.length, props.onValue])

  React.useEffect(() => {
    const matchedTemplates = initialTemplates.filter(
      (template) =>
        contains(template.name, props.value) ||
        contains(template.label, props.value)
    )

    setTemplates((activeTemplates) => {
      return matchedTemplates.map((matchedTemplate, index) => {
        // Retain "selected" state
        const existingTemplate = activeTemplates.find(
          ({ name }) => name == matchedTemplate.name
        )
        if (existingTemplate) {
          return existingTemplate
        } else {
          return matchedTemplate
        }
      })
    })
  }, [props.value])

  React.useEffect(() => {
    if (arrowDownPressed) {
      setTemplates((activeTemplates) => {
        const selectedIndex = findSelectedIndex(activeTemplates)
        return activeTemplates.map(({ selected, ...rest }, index) => {
          if (
            selectedIndex === activeTemplates.length - 1 &&
            index === activeTemplates.length - 1
          ) {
            return { selected: true, ...rest }
          }
          if (selectedIndex === -1 && index === 0) {
            return { selected: true, ...rest }
          }
          if (selectedIndex + 1 === index) {
            return { selected: true, ...rest }
          }
          return { selected: false, ...rest }
        })
      })
    }
  }, [arrowDownPressed, activeTemplates.length])
  React.useEffect(() => {
    if (arrowUpPressed) {
      setTemplates((activeTemplates) => {
        const selectedIndex = findSelectedIndex(activeTemplates)
        return activeTemplates.map(({ selected, ...rest }, index) => {
          if (selectedIndex === 0 && index === 0) {
            return { selected: true, ...rest }
          }
          if (selectedIndex === -1 && index === activeTemplates.length - 1) {
            return { selected: true, ...rest }
          }
          if (selectedIndex - 1 === index) {
            return { selected: true, ...rest }
          }
          return { selected: false, ...rest }
        })
      })
    }
  }, [arrowUpPressed, activeTemplates.length])
  const ref = React.useRef()
  useOnClickOutside(ref, () => props.onCancel())

  return (
    <span
      ref={ref}
      className="block w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <span className="block py-1">
        {activeTemplates.length === 0 && (
          <span className="block px-4 py-2 text-sm text-left w-full text-gray-500">
            No matches found
          </span>
        )}
        {activeTemplates.map((activeTemplate) => {
          return (
            <span key={activeTemplate.key} className="block">
              <button
                onClick={() => {
                  setTemplates((activeTemplates) => {
                    return activeTemplates.map((template) => {
                      if (template.name === activeTemplate.name) {
                        return { ...template, selected: true }
                      } else {
                        return { ...template, selected: false }
                      }
                    })
                  })
                  props.onValue(activeTemplate)
                }}
                className={classNames(
                  activeTemplate.selected
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-700',
                  'truncate block px-4 py-2 text-sm text-left w-full hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {activeTemplate.label || activeTemplate.name}
              </button>
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
