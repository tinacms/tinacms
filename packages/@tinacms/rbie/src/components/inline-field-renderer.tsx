import * as React from 'react'
import { useCMS, useCMSEvent } from 'tinacms'
import { FieldOverlay } from './field-overlay'
import { useMap } from 'react-use'

interface FieldNode {
  field: string
  node: any
}

const FormFieldRenderer = ({ form }: { form: string }) => {
  const [focusedField, setFocusedField] = React.useState<FieldNode>({
    field: '',
    node: null,
  })
  const [attentionFields, attentionFieldActions] = useMap<{
    [key: string]: any
  }>({})

  useCMSEvent(
    `form:${form}:fields:*:focus`,
    ({ field, node }) => {
      setFocusedField({ field, node })
    },
    [form, setFocusedField, Math.random()]
  )

  useCMSEvent(
    `form:${form}:fields:*:attentionStart`,
    ({ field, node }) => {
      attentionFieldActions.set(field, node)
    },
    []
  )

  useCMSEvent(
    `form:${form}:fields:*:attentionEnd`,
    ({ field }) => {
      attentionFieldActions.set(field, null)
    },
    []
  )

  return (
    <>
      {Object.entries(attentionFields).map(([_field, node]) => {
        return <FieldOverlay targetNode={node} attention={true}></FieldOverlay>
      })}
      {focusedField ? (
        <FieldOverlay targetNode={focusedField.node} attention={false}>
          <span>focused field</span>
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
        <FormFieldRenderer form={form.id} />
      ))}
    </>
  )
}
