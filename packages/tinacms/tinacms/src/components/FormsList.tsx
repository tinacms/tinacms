import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { Form } from '@tinacms/core'
import { padding, color } from '@tinacms/styles'
import { RightArrowIcon } from '@tinacms/icons'

interface FormsListProps {
  forms: Form[]
  setActiveFormId(id?: string): void
  isEditing: Boolean
}
const FormsList = ({ forms, setActiveFormId, isEditing }: FormsListProps) => {
  return (
    <StyledFormList isEditing={isEditing}>
      {forms.sort(byId).map(form => (
        <FormListItem key={form.id} onClick={() => setActiveFormId(form.id)}>
          <span>{form.label}</span>
          <RightArrowIcon />
        </FormListItem>
      ))}
    </StyledFormList>
  )
}

const byId = (b: Form, a: Form) => {
  if (a.id < b.id) {
    return -1
  }
  if (a.id > b.id) {
    return 1
  }
  return 0
}

export default FormsList

const FormListItem = styled.li`
  position: relative;
  font-size: 1.3rem;
  position: relative;
  padding: ${padding()}rem;
  color: #433e52;
  font-weight: normal;
  transition: color 150ms ease-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  svg {
    width: 1.5rem;
    fill: #e1ddec;
    margin-top: -1px;
    height: auto;
    transform: translate3d(0, 0, 0);
    transition: transform 250ms ease-out;
  }
  &:after {
    content: '';
    display: block;
    width: 100%;
    background-color: #edecf3;
    height: 1px;
    position: absolute;
    bottom: 0;
    left: ${padding()}rem;
    transform-origin: 0 0;
    transform: scale3d(0.15, 1, 1) translate3d(0, 0, 0);
    transition: all 250ms ease-out;
  }
  &:hover {
    color: ${color('primary')};
    svg {
      transform: translate3d(3px, 0, 0);
      transition: transform 250ms ease;
      fill: #433e52;
    }
    &:after {
      transform: scale3d(1, 1, 1) translate3d(-${padding()}rem, 0, 0);
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

function slideInMixin(i: number) {
  return `
    &:nth-child(${i + 1}) {
      animation-delay: ${25 * i}ms;
    }
  `
}

function staggerSlideIn() {
  let animationCss = ''
  for (let index = 0; index < 15; index += 1) {
    animationCss += slideInMixin(index)
  }
  return animationCss
}

const StyledFormList = styled.ul<{ isEditing: Boolean }>`
  padding: ${padding()}rem;
  cursor: pointer;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  ${FormListItem} {
    animation: ${slideIn} 150ms ease-out both 1;
    ${staggerSlideIn()}
  }
`
