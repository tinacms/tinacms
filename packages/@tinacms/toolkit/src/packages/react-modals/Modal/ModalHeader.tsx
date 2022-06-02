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
import { CloseIcon } from '../../icons'

export interface ModalHeaderProps {
  children: React.ReactChild | React.ReactChild[]
  close?(): void
}

export const ModalHeader = ({ children, close }: ModalHeaderProps) => {
  return (
    <div className="h-14 flex items-center justify-between px-5 border-b border-gray-200 m-0">
      <ModalTitle>{children}</ModalTitle>
      {close && (
        <CloseButton onClick={close}>
          <CloseIcon />
        </CloseButton>
      )}
    </div>
  )
}

const ModalTitle = ({ children }) => {
  return (
    <h2 className="text-gray-600 font-sans font-medium text-base leading-none m-0">
      {children}
    </h2>
  )
}

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
