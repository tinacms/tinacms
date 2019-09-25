import * as React from 'react'
import { Field } from '@tinacms/core'

export interface GroupFieldDefinititon extends Field {
  component: 'group'
  fields: Field[]
}

export interface GroupProps {
  input: any
  meta: any
  field: GroupFieldDefinititon
}

export function Group({ field }: GroupProps) {
  return (
    <div>
      <label>{field.label}</label>
      {field.fields.map(field => {
        return <GroupField field={field} />
      })}
    </div>
  )
}

export interface GroupFieldProps {
  field: Field
}

export function GroupField(props: GroupFieldProps) {
  return <div>Subfield: {props.field.label || props.field.name}</div>
}

export default {
  name: 'group',
  Component: Group,
}
