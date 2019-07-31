import * as React from 'react'
import { FormBuilder, FieldsBuilder } from '@forestryio/cms-final-form-builder'
import { useCMS, useSubscribable } from '@forestryio/cms-react'
import { useState } from 'react'
import { Form } from '@forestryio/cms'
import { StyledFrame } from './styled-frame'
import styled, { createGlobalStyle } from 'styled-components'

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
        margin: '0',
        padding: '0',
        border: '0',
        borderRight: '2px solid #efefef',
      }}
    >
      <>
        <RootElement />
        <SidebarHeader>Header</SidebarHeader>
        <FieldsWrapper>
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
        </FieldsWrapper>
        <SidebarFooter>
          <SaveButton onClick={saveForms}>Save document</SaveButton>
        </SidebarFooter>
      </>
    </StyledFrame>
  )
}

const NoFormsPlaceholder = () => <p>There is nothing to edit on this page</p>

const NoFieldsPlaceholder = () => (
  <p>There are no fields registered with this form</p>
)

// Styling
const HeaderHeight = 4
const FooterHeight = 3

const SidebarHeader = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: ${HeaderHeight}rem;
  border-bottom: 1px solid #efefef;
`

const FieldsWrapper = styled.div`
  position: absolute;
  left: 0;
  top: ${HeaderHeight}rem;
  height: calc(100vh - (${HeaderHeight + FooterHeight}rem));
  overflow-y: auto;
  padding: 1rem;
  ul, li {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`

const SidebarFooter = styled.div`
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
  height: ${FooterHeight}rem;
  border: 0;
  background-color: #0085ff;
  color: white;
  font-weight: 500;
  cursor: pointer;
`

const RootElement = createGlobalStyle`
  @import url('https://rsms.me/inter/inter.css');
  html {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    box-sizing: border-box;
  }
  @supports (font-variation-settings: normal) {
    html { font-family: 'Inter var', sans-serif; }
  }
  body {
    margin: 0;
    padding: 0;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
`
