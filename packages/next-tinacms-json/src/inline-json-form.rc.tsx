import React from 'react'
import { TinaForm, Form } from 'tinacms'
import { FC } from 'react'
import { JsonFile, useJsonForm } from './use-json-form'

export interface InlineJsonFormProps {
  jsonFile: JsonFile
  children(props: InlineJsonFormRenderProps): React.ReactElement
}

export interface InlineJsonFormRenderProps {
  form: Form
  data: any
  isEditing: boolean
  setIsEditing(value: boolean): void
}

export const InlineJsonForm: FC<InlineJsonFormProps> = props => {
  const [data, form] = useJsonForm(props.jsonFile)

  return (
    <TinaForm form={form}>
      {editingProps => {
        return props.children({
          ...editingProps,
          form,
          data,
        })
      }}
    </TinaForm>
  )
}
