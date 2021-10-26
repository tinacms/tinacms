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
import styled, { css } from 'styled-components'
import { Dismissible } from '../../../../../react-dismissible'

export const HeaderPopup = ({ children, icon }) => {
  const [visible, setVisible] = React.useState(false)
  return (
    <span
      style={{
        position: 'relative',
      }}
    >
      <Button
        onClick={(event: any) => {
          event.stopPropagation()
          event.preventDefault()
          setVisible(true)
        }}
      >
        {icon}
      </Button>
      <BlockMenu open={visible}>
        <Dismissible
          click
          escape
          onDismiss={() => setVisible(false)}
          disabled={!visible}
        >
          {children}
        </Dismissible>
      </BlockMenu>
    </span>
  )
}

const Button = styled.button`
  svg {
    width: 20px;
    height: auto;
  }
`

const BlockMenu = styled.div<{ open: boolean }>`
  border-radius: var(--tina-radius-small);
  border: 1px solid #efefef;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  transform: translate3d(0, 0, 0) scale3d(0.5, 0.5, 1);
  opacity: 0;
  pointer-events: none;
  transition: all 150ms ease-out;
  transform-origin: 0 0;
  box-shadow: var(--tina-shadow-big);
  background-color: white;
  overflow: hidden;
  z-index: var(--tina-z-index-1);

  ${(props) =>
    props.open &&
    css`
      opacity: 1;
      pointer-events: all;
      transform: translate3d(0, 36px, 0) scale3d(1, 1, 1);
    `};
`
