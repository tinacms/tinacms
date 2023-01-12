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
import styled from 'styled-components'
import { CloseIcon } from '@einsteinindustries/tinacms-icons'

export interface ModalHeaderProps {
  children: React.ReactChild | React.ReactChild[]
  close?(): void
}

export const ModalHeader = styled(
  ({ children, close, ...styleProps }: ModalHeaderProps) => {
    return (
      <div {...styleProps}>
        <ModalTitle>{children}</ModalTitle>
        {close && (
          <CloseButton onClick={close}>
            <CloseIcon />
          </CloseButton>
        )}
      </div>
    )
  }
)`
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--tina-padding-big) 0 var(--tina-padding-big);
  border-bottom: 1px solid var(--tina-color-grey-3);
  margin: 0;
`

const ModalTitle = styled.h2`
  all: unset;
  color: var(--tina-color-grey-10);
  font-weight: var(--tina-font-weight-regular);
  font-family: var(--tina-font-family);
  font-size: var(--tina-font-size-4);
  font-weight: var(--tina-font-weight-regular);
  line-height: 1;
  margin: 0;
`

const CloseButton = styled.div`
  display: flex;
  align-items: center;
  fill: var(--tina-color-grey-5);
  cursor: pointer;
  transition: fill 85ms ease-out;
  svg {
    width: 24px;
    height: auto;
  }
  &:hover {
    fill: var(--tina-color-grey-8);
  }
`
