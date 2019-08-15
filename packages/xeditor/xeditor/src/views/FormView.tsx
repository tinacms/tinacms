import * as React from 'react'
import { FormBuilder, FieldsBuilder } from '@forestryio/cms-final-form-builder'
import { useCMS, useSubscribable } from '@forestryio/cms-react'
import { useState } from 'react'
import { Form, Plugin } from '@forestryio/cms'
import styled, { createGlobalStyle, css } from 'styled-components'

export interface ViewPlugin extends Plugin {
  type: 'view'
  Component: any
}

export const FormsView: ViewPlugin = {
  type: 'view',
  name: 'Content',
  Component: () => {
    const cms = useCMS()
    const forms = cms.forms.all()

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

    /**
     * No Forms
     */
    if (!forms.length) return <NoFormsPlaceholder />

    return (
      <>
        <FormsList
          forms={forms}
          activeForm={editingForm}
          setActiveForm={setEditingForm}
        />
        <FormBuilder form={editingForm as any}>
          {({ handleSubmit, pristine }) => {
            return (
              <>
                <h3>Editing form {editingForm && editingForm.name}</h3>
                {editingForm &&
                  (editingForm.fields.length ? (
                    <FieldsBuilder form={editingForm} />
                  ) : (
                    <NoFieldsPlaceholder />
                  ))}
                <FormsFooter>
                  {editingForm && (
                    <SaveButton
                      onClick={() => handleSubmit()}
                      disabled={pristine}
                    >
                      Save
                    </SaveButton>
                  )}
                </FormsFooter>
              </>
            )
          }}
        </FormBuilder>
      </>
    )
  },
}

interface FormsListProps {
  forms: Form[]
  activeForm: Form | null
  setActiveForm(form: Form): void
}
const FormsList = ({ forms, activeForm, setActiveForm }: FormsListProps) => {
  return (
    <ul>
      {forms.map(form => (
        <li
          key={form.name}
          style={{
            textDecoration:
              activeForm && activeForm.name === form.name
                ? 'underline'
                : 'none',
          }}
          onClick={() => setActiveForm(form)}
        >
          {form.name}
        </li>
      ))}
    </ul>
  )
}

export const DummyView: ViewPlugin = {
  type: 'view',
  name: 'Dummy',
  Component: () => {
    return <h2>Hello World</h2>
  },
}

const NoFormsPlaceholder = () => <p>There is nothing to edit on this page</p>

const NoFieldsPlaceholder = () => (
  <p>There are no fields registered with this form</p>
)

// Styling
const FormsFooterHeight = 3

const FormsFooter = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
`

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: ${FormsFooterHeight}rem;
  border: 0;
  background-color: #0085ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover {
    opacity: 0.6;
  }
  ${p =>
    p.disabled &&
    css`
      opacity: 0.25;
      pointer: not-allowed;
      pointer-events: none;
    `};
`
