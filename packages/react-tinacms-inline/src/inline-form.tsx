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
import { FormRenderProps } from 'react-final-form'
import { FormBuilder, Form } from 'tinacms'
import { Dismissible } from 'react-dismissible'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'

export interface InlineFormProps {
  form: Form
  children: React.ReactElement | React.ReactElement[] | InlineFormRenderChild
}

export interface InlineFormRenderChild {
  (props: InlineFormRenderChildOptions):
    | React.ReactElement
    | React.ReactElement[]
}

export type InlineFormRenderChildOptions = InlineFormState &
  Omit<FormRenderProps<any>, 'form'>

export interface InlineFormState {
  form: Form
  focussedField: string
  setFocussedField(field: string): void
}

export function InlineForm({ form, children }: InlineFormProps) {
  const [focussedField, setFocussedField] = React.useState<string>('')

  const inlineFormState = React.useMemo(() => {
    return {
      form,
      focussedField,
      setFocussedField,
    }
  }, [form, focussedField, setFocussedField])

  const moveArrayItem = React.useCallback(
    (result: DropResult) => {
      if (!result.destination || !form) return
      const name = result.type
      const from = result.source.index
      const to = result.destination.index

      setFocussedField(`${name}.${to}`)
      form.mutators.move(name, from, to)
    },
    [form]
  )

  return (
    <InlineFormContext.Provider value={inlineFormState}>
      <Dismissible
        disabled={!focussedField}
        click
        allowClickPropagation
        onDismiss={() => {
          const settingsModalIsOpen = document.getElementById(
            'tinacms-inline-settings'
          )

          if (settingsModalIsOpen) {
            return
          }

          setFocussedField('')
        }}
      >
        <DragDropContext onDragEnd={moveArrayItem}>
          <div onClick={() => setFocussedField('')}>
            <FormBuilder form={form}>
              {({ form, ...formProps }) => {
                if (typeof children !== 'function') {
                  return children
                }

                return children({
                  ...formProps,
                  ...inlineFormState,
                })
              }}
            </FormBuilder>
          </div>
        </DragDropContext>
      </Dismissible>
    </InlineFormContext.Provider>
  )
}

export const InlineFormContext = React.createContext<InlineFormState | null>(
  null
)

export function useInlineForm() {
  const inlineFormContext = React.useContext(InlineFormContext)

  if (!inlineFormContext) {
    throw new Error('useInlineForm must be within an InlineFormContext')
  }

  return inlineFormContext
}
