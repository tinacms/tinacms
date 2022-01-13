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

import { EditorState } from 'prosemirror-state'
// @ts-ignore
import {
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  AlignLeft as AlignLeftIcon,
  JustifyIcon,
} from '@einsteinindustries/tinacms-icons'

import { commandControl } from '../../../components/MenuHelpers'
import { textAlign } from 'plugins/TextAlignment/Commands'

function alignRight(state: EditorState, dispatch: any) {
  return textAlign(state, dispatch, 'pm-align--right')
}

function alignLeft(state: EditorState, dispatch: any) {
  return textAlign(state, dispatch, 'pm-align--left')
}

function alignCenter(state: EditorState, dispatch: any) {
  return textAlign(state, dispatch, 'pm-align--center')
}

function alignJustify(state: EditorState, dispatch: any) {
  return textAlign(state, dispatch, 'pm-align--justify')
}

export const AlignRight = commandControl(
  alignRight,
  AlignRightIcon,
  'Align right',
  'Align right'
)

export const AlignLeft = commandControl(
  alignLeft,
  AlignLeftIcon,
  'Align left',
  'Align left'
)

export const AlignCenter = commandControl(
  alignCenter,
  AlignCenterIcon,
  'Align center',
  'Align center'
)

export const AlignJustify = commandControl(
  alignJustify,
  JustifyIcon,
  'Align justify',
  'Align justify'
)
