import * as React from 'react'
import Frame from 'react-frame-component'
import { FormBuilder, FieldsBuilder } from '@forestryio/cms-final-form-builder'
import { useCMS, useSubscribable } from '@forestryio/cms-react'
import { CMS } from '@forestryio/cms/src'
import { useState } from 'react'
import { Form } from '@forestryio/cms'

export const Sidebar = () => {
  const cms = useCMS()

  const [editingForm, setEditingForm] = useState(() => {
    return cms.forms.all()[0] as Form | null
  })

  useSubscribable(cms.forms, () => {
    const forms = cms.forms.all()
    if (forms.length == 1) {
      setEditingForm(forms[0])
      return
    }

    if (editingForm && forms.findIndex(f => f.name == editingForm.name) < 0) {
      setEditingForm(null)
    }
  })

  return (
    <Frame
      style={{
        width: '100%',
        height: '100%',
        margin: '0 auto',
        cursor: 'pointer',
      }}
    >
      <ul>
        {cms.forms.all().map(form => (
          <li
            key={form.name}
            onClick={() => {
              setEditingForm(form)
            }}
          >
            {form.name}
          </li>
        ))}
      </ul>
      <h3>Editing form {editingForm && editingForm.name}</h3>
      {editingForm && (
        <FormBuilder form={editingForm}>
          {() => {
            return <FieldsBuilder form={editingForm} />
          }}
        </FormBuilder>
      )}
    </Frame>
  )
}
