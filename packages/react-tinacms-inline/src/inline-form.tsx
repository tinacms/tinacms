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

type useMapObject<mapValue> = { [key: string]: mapValue }

type useMapActions<mapValue> = {
  set(key: string, value: mapValue): void
  setAll(data: useMapObject<mapValue>): void
  remove(key: string): void
  reset(): void
}

export interface InlineFormProps {
  form: Form
  children: React.ReactElement | React.ReactElement[] | InlineFormRenderChild
  fieldRefs?: any
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
  fieldRefs: useMapObject<React.Ref<any>>
  fieldRefActions: useMapActions<React.Ref<any>>
}

export function InlineForm({ form, children }: InlineFormProps) {
  const [focussedField, setFocussedField] = React.useState<string>('')
  const [fieldRefs, fieldRefActions] = useMap({})

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
    let memoOpacity: any = null
    // @ts-ignore
    const focusRef = fieldRefs[focussedField] as any
    if (focusRef && focusRef.current) {
      memoOpacity = focusRef.current.style.opacity
      focusRef.current.style.opacity = 0.0
      return () => (focusRef.current.style.opacity = memoOpacity || 1)
    }
    return
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

function FieldOverlay({
  targetRef,
  children,
}: {
  targetRef: any
  children: any
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: targetRef?.current?.offsetTop,
        left: targetRef?.current?.offsetLeft,
        width: targetRef?.current?.offsetWidth,
        height: targetRef?.current?.offsetHeight,
      }}
    >
      {children}
    </div>
  )
}

function FieldTarget({ onClick }: { onClick: () => void }) {
  const [opacity, setOpacity] = React.useState(0)
  return (
    <div
      onClick={onClick}
      onMouseOver={() => setOpacity(1.0)}
      onMouseLeave={() => setOpacity(0.0)}
      style={{
        width: '100%',
        height: '100%',
        border: '5px solid red',
        opacity,
      }}
    ></div>
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
