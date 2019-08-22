import * as React from 'react'
import { FormBuilder, FieldsBuilder } from '@forestryio/cms-final-form-builder'
import { useCMS, useSubscribable } from '@forestryio/cms-react'
import { useState } from 'react'
import { Form, Plugin } from '@forestryio/cms'
import styled, { css } from 'styled-components'
import { TextField } from '@forestryio/xeditor-fields'

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
    if (!editingForm)
      return (
        <FormsList
          forms={forms}
          activeForm={editingForm}
          setActiveForm={setEditingForm}
        />
      )

    return (
      <>
        {/* <FormsList
          forms={forms}
          activeForm={editingForm}
          setActiveForm={setEditingForm}
        /> */}
        <FormBuilder form={editingForm as any}>
          {({ handleSubmit, pristine }) => {
            return (
              <>
                {/* <h3>Editing form {editingForm.name}</h3> */}
                <FieldsWrapper>
                  {cms.plugins.all('create-button').map(plugin => (
                    <CreateContentButton plugin={plugin} />
                  ))}
                  {editingForm &&
                    (editingForm.fields.length ? (
                      <FieldsBuilder form={editingForm} />
                    ) : (
                      <NoFieldsPlaceholder />
                    ))}
                </FieldsWrapper>
                <FormsFooter>
                  <SaveButton
                    onClick={() => handleSubmit()}
                    disabled={pristine}
                  >
                    Save
                  </SaveButton>
                </FormsFooter>
              </>
            )
          }}
        </FormBuilder>
      </>
    )
  },
}

const CreateContentButton = ({ plugin }: any) => {
  let cms = useCMS()
  let [postName, setPostName] = React.useState('')
  let [open, setOpen] = React.useState(false)
  return (
    <div>
      <button onClick={() => setOpen(p => !p)}>{plugin.name}</button>
      {open && (
        <>
          <TextField
            onChange={e => setPostName(e.target.value)}
            value={postName}
          />

          <button onClick={() => plugin.onSubmit(postName, cms)}>Save</button>
        </>
      )}
    </div>
  )
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
const FormsFooterHeight = 4
const HeaderHeight = 5

const FieldsWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: calc(100vh - (${FormsFooterHeight + HeaderHeight}rem));
  width: 100%;
  padding: 1rem;
  overflow-y: auto;
`

const FormsFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: ${FormsFooterHeight}rem;
  background-color: white;
  border-top: 1px solid #efefef;
  padding: 0.5rem 1rem;
`

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0.3rem;
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
