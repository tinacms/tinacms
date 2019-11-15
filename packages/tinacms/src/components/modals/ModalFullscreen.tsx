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

import styled, { keyframes } from 'styled-components'
import { ModalBody } from './ModalProvider'

const ModalFullscreenKeyframes = keyframes`
  0% {
    transform: translate3d( -2rem, 0, 0 );
    opacity: 0;
  }

  100% {
    transform: translate3d( 0, 0, 0 );
    opacity: 1;
  }
`

export const ModalFullscreen = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 1;
  overflow: visible;
  background-color: #fff;
  border-radius: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 170px);
  max-width: 1500px;
  height: 100%;
  animation: ${ModalFullscreenKeyframes} 150ms ease-out 1;

  ${ModalBody} {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
  }
`
