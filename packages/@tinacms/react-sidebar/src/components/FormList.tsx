/**

Copyright 2021 Forestry.io Holdings, Inc.

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
import { Form } from '@einsteinindustries/tinacms-forms'
import { RightArrowIcon } from '@einsteinindustries/tinacms-icons'

export interface FormsListProps {
  forms: Form[]
  setActiveFormId(id: string): void
  isEditing: Boolean
}

export const FormList = ({
  forms,
  setActiveFormId,
  isEditing,
}: FormsListProps) => {
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

const FormListItem = styled.li`
  position: relative;
  font-size: var(--tina-font-size-6);
  line-height: 1.2;
  position: relative;
  padding: var(--tina-padding-big);
  margin: 0;
  color: var(--tina-color-grey-8);
  font-weight: normal;
  transition: color 150ms ease-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  svg {
    width: 28px;
    fill: var(--tina-color-grey-3);
    margin-top: -1px;
    height: auto;
    transform: translate3d(0, 0, 0);
    transition: transform 250ms ease-out;
  }
  &:after {
    content: '';
    display: block;
    width: 100%;
    background-color: var(--tina-color-grey-2);
    height: 1px;
    position: absolute;
    bottom: 0;
    left: var(--tina-padding-big);
    transform-origin: 0 0;
    transform: scale3d(0.15, 1, 1) translate3d(0, 0, 0);
    transition: all 250ms ease-out;
  }
  &:hover {
    color: var(--tina-color-primary);
    svg {
      transform: translate3d(3px, 0, 0);
      transition: transform 250ms ease;
      fill: var(--tina-color-grey-8);
    }
    &:after {
      transform: scale3d(1, 1, 1)
        translate3d(calc(var(--tina-padding-big) * -1), 0, 0);
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
  padding: var(--tina-padding-big);
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
