import * as React from 'react'
import { FormBuilder, FieldsBuilder } from '@tinacms/form-builder'
import { useCMS, useSubscribable } from '@tinacms/react-tinacms'
import { EllipsisVertical } from '@tinacms/icons'
import { TextField } from '@tinacms/fields'
import { useState } from 'react'
import { Form, ScreenPlugin } from '@tinacms/core'
import styled, { css } from 'styled-components'
import { Modal, ModalBody, ModalHeader } from '..'
import { Theme, GlobalStyles, HEADER_HEIGHT, FOOTER_HEIGHT } from '../Globals'
import { Button } from './Button'
import { ActionsMenu } from './ActionsMenu'

export const FormsView = () => {
  const cms = useCMS()
  const forms = cms.forms.all()
  const [editingForm, setEditingForm] = useState<Form | null>(() => {
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
      //how to get this forms list to render again???
  return (
    <>
      <FormsList
        forms={forms}
        activeForm={editingForm}
        setActiveForm={setEditingForm}
      />
      <FormBuilder form={editingForm as any}>
        {({ handleSubmit, pristine, form }) => {
          return (
            <>
              {/* <h3>Editing form {editingForm.name}</h3> */}
              <FieldsWrapper>
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
                {editingForm.actions.length > 0 && (
                  <ActionsMenu actions={editingForm.actions} />
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
      <CreateButton onClick={() => setOpen(p => !p)}>
        {plugin.name}
      </CreateButton>
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
  console.log(forms)
  return (
    <StyledFormList>
      <h1>Editable Files</h1>
      <ul>
        {forms.map(form => (
          <li
            key={form.name}
            style={{
              color:
                activeForm && activeForm.name === form.name
                  ? Theme.color.primary
                  : 'inherit',
            }}
            onClick={() => setActiveForm(form)}
          >
            {form.name}
          </li>
        ))}
      </ul>
    </StyledFormList>
  )
}

export const MediaView: ScreenPlugin = {
  __type: 'screen',
  name: 'Media Manager',
  icon: 'forestry-logo',
  Component: () => {
    return <h2>Hello World</h2>
  },
}

export const SettingsView: ScreenPlugin = {
  __type: 'screen',
  name: 'Site Settings',
  icon: 'forestry-logo',
  Component: () => {
    return <h2>Hello World</h2>
  },
}

const NoFormsPlaceholder = () => <p>There is nothing to edit on this page</p>

const NoFieldsPlaceholder = () => (
  <p>There are no fields registered with this form</p>
)

const CreateButton = styled(Button)`
  width: 100%;
`

const StyledFormList = styled.div`
  padding: ${Theme.padding}rem;
  background-color: ${Theme.color.light};
  border-bottom: 1px solid rgba(51,51,51,0.04);
  h1 {
    font-size: 1.2rem;
    color: #333;
    font-weight: normal;
    padding: 0 0 ${Theme.input.padding} 0;
    margin: 0 0 .85rem 0;
    border-bottom: 0.5px solid lightgray;
  }
  ul {
    cursor: pointer;
    list-style: none;
    margin: 0;
    padding: 0;
    color: #747474;
    font-size: .8rem;
    li:not(:last-child) {
      margin-bottom: ${Theme.input.padding};
      padding-bottom: .5rem;
    }
    li {
      -webkit-transition: color 300ms ease;
      transition: color 300ms ease;
    }
    li:active {
      -webkit-transition: color 300ms ease;
      transition: color 300ms ease;
    }
  }
`

export const FieldsWrapper = styled.div`
  width: 100%;
  padding: ${p => p.theme.padding}rem ${p => p.theme.padding}rem 0
    ${p => p.theme.padding}rem;
  overflow-y: auto;
  flex: 1 0 4rem;
  ul,
  li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const FormsFooter = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: ${FOOTER_HEIGHT}rem;
  background-color: white;
  border-top: 1px solid #efefef;
  padding: 0.75rem 1.25rem;
  flex: 0 0 ${FOOTER_HEIGHT}rem;
`

export const SaveButton = styled(Button)`
  flex: 1 0 auto;
  padding: 0.75rem 1.5rem;
`

export const CancelButton = styled(SaveButton)`
  background-color: transparent;
  border: 1px solid #0084ff;
  color: #0084ff;
  &:hover {
    background-color: #f7f7f7;
    opacity: 1;
  }
`
