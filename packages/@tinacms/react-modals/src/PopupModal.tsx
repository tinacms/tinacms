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

import styled, { keyframes, StyledComponent } from 'styled-components'

const ModalPopupKeyframes = keyframes`
  0% {
    transform: translate3d( 0, -2rem, 0 );
    opacity: 0;
  }

  100% {
    transform: translate3d( 0, 0, 0 );
    opacity: 1;
  }
`

export const PopupModal: StyledComponent<'div', {}, {}> = styled.div`
  display: block;
  z-index: var(--tina-z-index-0);
  overflow: visible; /* Keep this as "visible", select component needs to overflow */
  background-color: var(--tina-color-grey-1);
  border-radius: var(--tina-radius-small);
  margin: 40px auto;
  width: 460px;
  max-width: 90%;
  animation: ${ModalPopupKeyframes} 150ms ease-out 1;
`

/**
 * @alias [PopupModal]
 * @deprecated
 */
export const ModalPopup = PopupModal
