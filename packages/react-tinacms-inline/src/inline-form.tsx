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
import { FormRenderProps } from 'react-final-form'
import { Form, useCMS } from '@einsteinindustries/tinacms'
import { FormLegacy } from '@einsteinindustries/tinacms-form-builder'
import { Dismissible } from 'react-dismissible'
import { RBIEPlugin } from './rbie/plugins/rbie-plugin'
import { InlineFieldsRenderer } from './rbie/components/inline-fields-renderer'

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

  const cms = useCMS()
  const rbie = React.useMemo(() => {
    return cms.plugins
      .getType<RBIEPlugin>('unstable_featureflag')
      .find('ref-based-inline-editor')
  }, [cms.plugins])

  const inlineFormState = React.useMemo(() => {
    return {
      form,
      focussedField,
      setFocussedField,
    }
  }, [form, focussedField, setFocussedField])

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
        <div
          onClick={() => {
            cms.events.dispatch({
              type: `form:${form.id}:fields::focus`,
              form: form.id,
              field: '',
            })
            setFocussedField('')
          }}
        >
          <FormLegacy form={form as any}>
            {({ form, ...formProps }) => (
              <>
                {typeof children !== 'function'
                  ? children
                  : //
                    // @ts-ignore
                    children({ ...formProps, ...inlineFormState })}
                {rbie?.active && <InlineFieldsRenderer />}
              </>
            )}
          </FormLegacy>
        </div>
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
