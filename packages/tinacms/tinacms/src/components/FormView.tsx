import * as React from 'react'
import { FormBuilder, FieldsBuilder } from '@tinacms/form-builder'
import { useCMS, useSubscribable } from '@tinacms/react-tinacms'
import { EllipsisVertical } from '@tinacms/icons'
import { TextField } from '@tinacms/fields'
import { useState } from 'react'
import { Form, ScreenPlugin } from '@tinacms/core'
import styled, { css } from 'styled-components'
import { Modal, ModalBody, ModalHeader } from '..'
import { Theme, RootElement, HEADER_HEIGHT, FOOTER_HEIGHT } from '../Globals'
import { Button } from './Button'

export const FormsView = () => {
  const cms = useCMS()
  const forms = cms.forms.all()
  const [actionMenuVisibility, setActionMenuVisibility] = useState(false)

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

                {isFile ? (
                  <>
                    <MoreActions
                      onClick={() =>
                        setActionMenuVisibility(!actionMenuVisibility)
                      }
                    ></MoreActions>
                    <ActionMenu open={actionMenuVisibility}>
                      <ActionButton>Do Something</ActionButton>
                      <ActionButton
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
                      </ActionButton>
                    </ActionMenu>
                  </>
                ) : null}
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

const MoreActions = styled(p => (
  <button {...p}>
    <EllipsisVertical />
  </button>
))`
  height: 100%;
  width: 2rem;
  background-color: transparent;
  background-position: center;
  background-size: auto 1.125rem;
  background-repeat: no-repeat;
  margin-left: 0.75rem;
  margin-right: -0.75rem;
  border: 0;
  outline: none;
  cursor: pointer;
  transition: opacity 85ms ease-out;
  &:hover {
    opacity: 0.6;
  }
`

const ActionMenu = styled.div<{ open: boolean }>`
  min-width: 12rem;
  border-radius: 0.5rem;
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  bottom: ${p => p.theme.padding}rem;
  right: ${p => p.theme.padding}rem;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 85ms ease-out;
  transform-origin: 100% 100%;
  box-shadow: ${p => p.theme.shadow.big};
  background-color: white;
  overflow: hidden;
  ${props =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, -1.75rem, 0) scale3d(1, 1, 1);
    `};
`

const ActionButton = styled.button`
  position: relative;
  text-align: center;
  font-size: 0.75rem;
  padding: 0.75rem;
  font-weight: 500;
  width: 100%;
  background: none;
  cursor: pointer;
  outline: none;
  border: 0;
  &:after {
    content: '';
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity 75ms ease-out;
    background-color: #f8f8f8;
    z-index: -1;
  }
  &:hover {
    &:after {
      opacity: 1;
    }
  }
  &:not(:last-child) {
    border-bottom: 1px solid #efefef;
  }
`

const CreateButton = styled(Button)`
  width: 100%;
`

const FieldsWrapper = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: calc(100vh - (${HEADER_HEIGHT + FOOTER_HEIGHT}rem));
  width: 100%;
  padding: ${p => p.theme.padding}rem ${p => p.theme.padding}rem 0
    ${p => p.theme.padding}rem;
  overflow-y: auto;
`

const FormsFooter = styled.div`
  display: flex;
  justify-content: space-between;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: ${FOOTER_HEIGHT}rem;
  background-color: white;
  border-top: 1px solid #efefef;
  padding: 0.75rem 1.25rem;
  box-shadow: inset -1px 0 0 #efefef;
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
