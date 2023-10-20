import React from 'react'
import { useFormPortal, FormBuilder } from '@toolkit/form-builder'
import { PanelHeader, GroupPanel } from '../../group-field-plugin'
import { Form, Field } from '@toolkit/forms'
import { uuid } from './plugins/ui/helpers'

export const NestedForm = (props: {
  onClose: () => void
  id: string
  label: string
  fields: Field[]
  initialValues: object
  onChange: (values: object) => void
}) => {
  const FormPortal = useFormPortal()
  const id = React.useMemo(() => uuid(), [props.id, props.initialValues])
  const form = React.useMemo(() => {
    return new Form({
      ...props,
      id,
      onChange: ({ values }) => {
        props.onChange(values)
      },
      onSubmit: () => {},
    })
  }, [id, props.onChange])

  return (
    <FormPortal>
      {({ zIndexShift }) => (
        <GroupPanel isExpanded={true} style={{ zIndex: zIndexShift + 1000 }}>
          <PanelHeader onClick={props.onClose}>{props.label}</PanelHeader>
          <FormBuilder form={{ tinaForm: form }} hideFooter={true} />
        </GroupPanel>
      )}
    </FormPortal>
  )
}
