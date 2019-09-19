import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { Form } from '@tinacms/core'
import { padding, color } from '@tinacms/styles'

interface FormsListProps {
  forms: Form[]
  activeForm: Form | null
  setActiveForm(form: Form): void
  isEditing: Boolean
}
const FormsList = ({
  forms,
  activeForm,
  setActiveForm,
  isEditing,
}: FormsListProps) => {
  return (
    <StyledFormList isEditing={isEditing}>
      {forms.map(form => (
        <FormListItem key={form.id} onClick={() => setActiveForm(form)}>
          {form.label}
        </FormListItem>
      ))}
    </StyledFormList>
  )
}

export default FormsList

const FormListItem = styled.li`
  position: relative;
  font-size: 1.3rem;
  position: relative;
  padding: ${padding()}rem;
  color: #333;
  font-weight: normal;
  transition: color 150ms ease-out;
  &:after {
    content: '';
    display: block;
    width: calc(100% - ${padding()}rem - ${padding()}rem);
    background-color: ${color('light')};
    height: 1px;
    position: absolute;
    bottom: 0;
    left: ${padding()};
    transform-origin: 0 0;
    transform: scale3d(0.15, 1, 1);
    transition: all 250ms ease-out;
  }
  &:hover {
    color: ${color('primary')};
    &:after {
      transform: scale3d(1, 1, 1);
    }
  }
`

const slideIn = keyframes`
  from {
    transform: translate3d(-100%,0,0);
    opacity: 0;
  }

  to {
    transform: translate3d(0,0,0);
    opacity: 1;
  }
`

const StyledFormList = styled.ul<{ isEditing: Boolean }>`
  padding: ${padding()}rem;
  transition: transform 150ms ease-out;
  transform: translate3d(${p => (p.isEditing ? `-100%` : '0')}, 0, 0);
  cursor: pointer;
  list-style: none;
  margin: 0;
  padding: 0;
  animation: ${slideIn} 150ms ease-out both 1;
`
