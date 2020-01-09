/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react'
import styled, { keyframes } from 'styled-components'
import { Form } from '@tinacms/forms'
import { padding, color, font } from '@tinacms/styles'
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
  font-size: ${font.size(6)};
  position: relative;
  padding: ${padding()};
  color: ${color.grey(8)};
  font-weight: normal;
  transition: color 150ms ease-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  svg {
    width: 1.5rem;
    fill: ${color.grey(3)};
    margin-top: -1px;
    height: auto;
    transform: translate3d(0, 0, 0);
    transition: transform 250ms ease-out;
  }
  &:after {
    content: '';
    display: block;
    width: 100%;
    background-color: ${color.grey(2)};
    height: 1px;
    position: absolute;
    bottom: 0;
    left: ${padding()};
    transform-origin: 0 0;
    transform: scale3d(0.15, 1, 1) translate3d(0, 0, 0);
    transition: all 250ms ease-out;
  }
  &:hover {
    color: ${color.primary()};
    svg {
      transform: translate3d(3px, 0, 0);
      transition: transform 250ms ease;
      fill: ${color.grey(8)};
    }
    &:after {
      transform: scale3d(1, 1, 1) translate3d(-${padding()}, 0, 0);
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
  padding: ${padding()};
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
