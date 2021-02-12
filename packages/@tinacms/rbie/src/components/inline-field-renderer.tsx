import * as React from 'react'
import { useCMS, useCMSEvent } from 'tinacms'
import { FieldOverlay } from './field-overlay'
import { useMap } from 'react-use'

interface FieldNode {
  field: string
  node: any
}

const FormFieldRenderer = ({ form }: { form: any }) => {
  const [focusedField, setFocusedField] = React.useState<FieldNode>({
    field: '',
    node: null,
  })
  const [attentionFields, attentionFieldActions] = useMap<{
    [key: string]: any
  }>({})

  useCMSEvent(
    `form:${form.id}:fields:*:focus`,
    ({ field, node }) => {
      setFocusedField({ field, node })
    },
    [form.id, setFocusedField, Math.random()]
  )

  useCMSEvent(
    `form:${form.id}:fields:*:attentionStart`,
    ({ field, node }) => {
      attentionFieldActions.set(field, node)
    },
    []
  )

  useCMSEvent(
    `form:${form.id}:fields:*:attentionEnd`,
    ({ field }) => {
      attentionFieldActions.set(field, null)
    },
    []
  )

  const field = React.useMemo(() => {
    return form.fields.find((field: any) => field.name === focusedField.field)
  }, [form.id, focusedField.field])

  return (
    <>
      {Object.entries(attentionFields).map(([, node]) => {
        return <FieldOverlay targetNode={node} attention={true}></FieldOverlay>
      })}
      {focusedField ? (
        <FieldOverlay
          targetNode={focusedField.node}
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
