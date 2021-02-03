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
import { useMap } from 'react-use'
import { FieldOverlay, FieldTarget, FieldRefType } from './ref-fields'

type useMapObject<T> = { [key: string]: T }

type useMapActions<T> = {
  set(key: string, value: T): void
  setAll(data: useMapObject<T>): void
  remove(key: string): void
  reset(): void
}

type useMapType<T> = [useMapObject<T>, useMapActions<T>]

export interface InlineFormProps {
  form: Form
  children: React.ReactElement | React.ReactElement[] | InlineFormRenderChild
  fieldRefs?: {
    [key: string]: FieldRefType
  }
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
  fieldRefs: useMapObject<FieldRefType>
  fieldRefActions: useMapActions<FieldRefType>
}

export function InlineForm({ form, children }: InlineFormProps) {
  const [focussedField, setFocussedField] = React.useState<string>('')
  const [fieldRefs, fieldRefActions]: useMapType<FieldRefType> = useMap({})

  const inlineFormState = React.useMemo(() => {
    return {
      form,
      focussedField,
      setFocussedField,
      fieldRefs,
      fieldRefActions,
    }
  }, [form, focussedField, setFocussedField])

  React.useEffect(() => {
    let memoOpacity = '1.0'

    const focusRef = fieldRefs[focussedField]

    if (focusRef && focusRef.current) {
      memoOpacity = focusRef.current.style.opacity
      focusRef.current.style.opacity = '0.0'
    }

    return () => {
      if (focusRef && focusRef.current) {
        focusRef.current.style.opacity = memoOpacity
      }
    }
  }, [focussedField, fieldRefs])

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
        <FormBuilder form={form}>
          {({ form, ...formProps }) => {
            if (typeof children !== 'function') {
              return children
            }

            return (
              <>
                {children({
                  ...formProps,
                  ...inlineFormState,
                })}
                {Object.entries(fieldRefs).map(([field, ref]) => (
                  <FieldOverlay targetRef={ref}>
                    {focussedField === field ? (
                      <InlineComponent
                        form={inlineFormState.form}
                        field={field}
                      />
                    ) : (
                      <FieldTarget onClick={() => setFocussedField(field)} />
                    )}
                  </FieldOverlay>
                ))}
              </>
            )
          }}
        </FormBuilder>
      </Dismissible>
    </InlineFormContext.Provider>
  )
}

function InlineComponent({ form, field }: any) {
  const fieldConfig = form.fields.find(
    (formField: any) => formField.name === field
  )
  return fieldConfig.inlineComponent({ name: field })
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
