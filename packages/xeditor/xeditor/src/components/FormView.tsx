import * as React from 'react'
import { FormBuilder, FieldsBuilder } from '@forestryio/cms-final-form-builder'
import { useCMS, useSubscribable } from '@forestryio/cms-react'
import { useState } from 'react'
import { Form, ScreenPlugin } from '@forestryio/cms'
import styled, { css } from 'styled-components'
import { TextField } from '@forestryio/xeditor-fields'
import { Modal, ModalBody, ModalHeader } from '..'

export const FormsView = () => {
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
  if (!forms.length)
    return (
      <>
        {cms.plugins.all('content-button').map(plugin => (
          <CreateContentButton plugin={plugin} />
        ))}
        <NoFormsPlaceholder />
      </>
    )
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
        {({ handleSubmit, pristine, form }) => {
          let isFile, fileRelativePath: any
          try {
            //@ts-ignore
            fileRelativePath = form.getState().values!.fields!.fileRelativePath
            isFile = true
          } catch (e) {
            isFile = false
          }
          return (
            <>
              {/* <h3>Editing form {editingForm.name}</h3> */}
              <FieldsWrapper>
                {cms.plugins.all('content-button').map(plugin => (
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
                <SaveButton onClick={() => handleSubmit()} disabled={pristine}>
                  Save
                </SaveButton>
                {isFile && (
                  <DeleteButton
                    onClick={() => {
                      if (
                        !confirm(
                          `Are you sure you want to delete ${fileRelativePath}?`
                        )
                      ) {
                        return
                      }
                      // @ts-ignore
                      cms.api.git.onDelete!({
                        relPath: fileRelativePath,
                      })
                    }}
                  >
                    Delete
                  </DeleteButton>
                )}
              </FormsFooter>
            </>
          )
        }}
      </FormBuilder>
    </>
  )
}

const CreateContentButton = ({ plugin }: any) => {
  let cms = useCMS()
  let [postName, setPostName] = React.useState('')
  let [open, setOpen] = React.useState(false)
  return (
    <div>
      <button onClick={() => setOpen(p => !p)}>{plugin.name}</button>
      {open && (
        <Modal>
          <ModalHeader>Create</ModalHeader>
          <ModalBody>
            <TextField
              onChange={e => setPostName(e.target.value)}
              value={postName}
            />

            <SaveButton
              onClick={() => {
                plugin.onSubmit(postName, cms)
                setOpen(false)
              }}
            >
              Save
            </SaveButton>
          </ModalBody>
        </Modal>
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

export const DummyView: ScreenPlugin = {
  __type: 'screen',
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

const DeleteButton = styled(SaveButton)`
  background-color: red;
`
