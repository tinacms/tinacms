import * as React from 'react'
import { FormBuilder, FieldsBuilder } from '@forestryio/cms-final-form-builder'
import { useCMS, useSubscribable } from '@forestryio/cms-react'
import { useState } from 'react'
import { Form } from '@forestryio/cms'
import { StyledFrame } from './styled-frame'

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

  const saveForms = () => {
    cms.forms.all().forEach(form => {
      form.finalForm.submit()
    })
  }

  const forms = cms.forms.all()
  return (
    <StyledFrame
      frameStyles={{
        width: '100%',
        height: '100%',
        margin: '0 auto',
        cursor: 'pointer',
      }}
    >
      <>
        {!forms.length ? (
          <NoFormsPlaceholder />
        ) : (
          <>
            <ul>
              {forms.map(form => (
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
            <button onClick={saveForms}>Save</button>
            <h3>Editing form {editingForm && editingForm.name}</h3>
            {editingForm &&
              (editingForm.fields.length ? (
                <FormBuilder form={editingForm}>
                  {() => {
                    return <FieldsBuilder form={editingForm} />
                  }}
                </FormBuilder>
              ) : (
                <NoFieldsPlaceholder />
              ))}
          </>
        )}
      </>
    </StyledFrame>
  )
}

const NoFormsPlaceholder = () => <p>There is nothing to edit on this page</p>

const NoFieldsPlaceholder = () => (
  <p>There are no fields registered with this form</p>
)
