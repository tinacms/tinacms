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
import { useCMS, useCMSEvent } from 'tinacms'
import { FieldOverlay } from './field-overlay'
import { useMap } from 'react-use'

// interface FieldNode {
//   field: string
//   node: any
// }

const FormFieldRenderer = ({ form }: { form: any }) => {
  const [fieldNodes, fieldNodeActions] = useMap<{ [key: string]: any }>({})
  const [focusedField, setFocusedField] = React.useState('')
  const [attentionFields, attentionFieldActions] = useMap<{
    [key: string]: any
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
    return form.fields.find((field: any) => field.name === focusedField)
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

export const InlineFieldRenderer = () => {
  const cms = useCMS()
  const forms = cms.plugins.getType<any>('form').all()

  return (
    <>
      {forms.map(form => (
        <FormFieldRenderer form={form} />
      ))}
    </>
  )
}
