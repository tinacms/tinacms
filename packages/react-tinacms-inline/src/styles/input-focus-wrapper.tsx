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

import styled from 'styled-components'
import { radius, color } from '@tinacms/styles'

export const InputFocusWrapper = styled.div`
  position: relative;

  &:focus-within {
    &:after {
      opacity: 1;
    }
  }

  &:hover:not(:focus-within) {
    &:after {
      opacity: 0.3;
    }
  }

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: -16px;
    top: -16px;
    width: calc(100% + 2rem);
    height: calc(100% + 2rem);
    border: 3px solid ${color.primary()};
    border-radius: ${radius()};
    opacity: 0;
    pointer-events: none;
    z-index: 1000;
    transition: all 150ms ease-out;
  }
`
