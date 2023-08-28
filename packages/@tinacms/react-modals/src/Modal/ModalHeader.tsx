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
  back?(): void
  close?(): void
}

const BackArrow = () => {
  return (
    <svg version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 330 330">
      <path
        id="XMLID_28_"
        d="M315,150H51.213l49.393-49.394c5.858-5.857,5.858-15.355,0-21.213c-5.857-5.857-15.355-5.857-21.213,0
	l-75,75c-5.858,5.857-5.858,15.355,0,21.213l75,75C82.323,253.535,86.161,255,90,255c3.839,0,7.678-1.465,10.606-4.394
	c5.858-5.857,5.858-15.355,0-21.213L51.213,180H315c8.284,0,15-6.716,15-15S323.284,150,315,150z"
      />
    </svg>
  )
}

export const ModalHeader = styled(
  ({ children, close, back, ...styleProps }: ModalHeaderProps) => {
    return (
      <div {...styleProps}>
        <ModalTitle>{children}</ModalTitle>
        <div style={{ display: 'flex' }}>
          {back && (
            <NavigationButton onClick={back} style={{ marginRight: '35px' }}>
              <BackArrow />
            </NavigationButton>
          )}
          {close && (
            <NavigationButton onClick={close}>
              <CloseIcon />
            </NavigationButton>
          )}
        </div>
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

const NavigationButton = styled.div`
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
