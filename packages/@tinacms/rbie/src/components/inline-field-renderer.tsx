import * as React from 'react'
import { useCMS, useCMSEvent } from 'tinacms'
import { FieldOverlay } from './field-overlay'
import { useMap } from 'react-use'

interface FieldNode {
  field: string
  node: any
}

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
