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

import * as React from 'react'
import { RedoIcon, UndoIcon } from '@tinacms/icons'

import { MenuButton } from '../../../components/MenuHelpers'

export const MarkdownMenu = () => (
  <>
    <UndoControl />
    <RedoControl />
  </>
)

const UndoControl = () => (
  <MenuButton data-tooltip="Undo" data-side="top" disabled>
    <UndoIcon />
  </MenuButton>
)

const RedoControl = () => (
  <MenuButton data-tooltip="Redo" data-side="top" disabled>
    <RedoIcon />
  </MenuButton>
)
