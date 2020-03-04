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

export interface InlineFormProps {
  form: Form
  children: React.ReactElement | React.ReactElement[] | InlineFormRenderChild
  initialStatus?: InlineFormStatus
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
  status: InlineFormStatus
  activate(): void
  deactivate(): void
}

export type InlineFormStatus = 'active' | 'inactive'

export function InlineForm({
  form,
  children,
  initialStatus = 'inactive',
}: InlineFormProps) {
  const [status, setStatus] = React.useState<InlineFormStatus>(initialStatus)

  const inlineFormState = React.useMemo(() => {
    return {
      form,
      status,
      activate: () => setStatus('active'),
      deactivate: () => setStatus('inactive'),
    }
  }, [form, status])

  return (
    <InlineFormContext.Provider value={inlineFormState}>
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
