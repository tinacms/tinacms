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
import { useCMS, useCMSEvent, Form, Field } from '@einsteinindustries/tinacms'
import { FieldOverlay } from './field-overlay'
import { useMap } from 'react-use'

interface FormFieldRendererProps {
  form: Form
}

const FormFieldRenderer = ({ form }: FormFieldRendererProps) => {
  const [fieldNodes, fieldNodeActions] = useMap<{
    [key: string]: HTMLElement | null
  }>({})
  const [focusedField, setFocusedField] = React.useState('')
  const [attentionFields, attentionFieldActions] = useMap<{
    [key: string]: boolean
  }>({})

  useCMSEvent(
    `form:${form.id}:ref:*`,
    ({ field, node }) => {
      fieldNodeActions.set(field, node)
    },
    [fieldNodeActions.set]
  )

  useCMSEvent(
    `form:${form.id}:fields:*:focus`,
    ({ field }) => {
      setFocusedField(field)
    },
    [setFocusedField]
  )

  useCMSEvent(
    `form:${form.id}:fields:*:attentionStart`,
    ({ field }) => {
      attentionFieldActions.set(field, true)
    },
    [attentionFieldActions.set]
  )

  useCMSEvent(
    `form:${form.id}:fields:*:attentionEnd`,
    ({ field }) => {
      attentionFieldActions.set(field, false)
    },
    [attentionFieldActions.set]
  )

  const field = React.useMemo(() => {
    return form.fields.find((field: Field) => field.name === focusedField)
  }, [form.id, focusedField])

  return (
    <>
      {Object.entries(attentionFields)
        .filter(([, hasAttention]) => hasAttention)
        .map(([field]) => {
          return (
            <FieldOverlay
              targetNode={fieldNodes[field]}
              attention={true}
            ></FieldOverlay>
          )
        })}
      {focusedField ? (
        <FieldOverlay
          targetNode={fieldNodes[focusedField]}
          attention={!(field && field.inlineComponent)}
        >
          {field && field.inlineComponent ? (
            <field.inlineComponent name={field.name} />
          ) : (
            undefined
          )}
        </FieldOverlay>
      ) : null}
    </>
  )
}

export const InlineFieldsRenderer = () => {
  const cms = useCMS()
  const forms = cms.plugins.getType<Form>('form').all()

  return (
    <>
      {forms.map(form => (
        <FormFieldRenderer form={form} />
      ))}
    </>
  )
}
