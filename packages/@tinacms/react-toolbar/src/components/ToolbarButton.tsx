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
import { Button } from '@tinacms/styles'

export const ToolbarButton = styled(Button)`
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding: 0 10px;

  &:focus {
    outline: none;
  }

  svg {
    fill: currentColor;
    opacity: 0.7;
    width: 2.5em;
    height: 2.5em;
  }

  &:disabled {
    opacity: 0.6;
    filter: grayscale(25%);
  }

  @media (min-width: 1030px) {
    padding: 0 20px;

    svg {
      margin-right: 0.25rem;
    }
  }
`
