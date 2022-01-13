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

import styled from 'styled-components'
import { Button } from '@einsteinindustries/tinacms-styles'

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  border-radius: 0 0 5px 5px;
  padding: 0 var(--tina-padding-big) var(--tina-padding-big)
    var(--tina-padding-big);
  ${Button} {
    flex: 0 1 auto;
    min-width: 128px;
    margin: 0 var(--tina-padding-small) 0 0;
    &:last-child {
      margin-right: 0;
    }
  }
`
