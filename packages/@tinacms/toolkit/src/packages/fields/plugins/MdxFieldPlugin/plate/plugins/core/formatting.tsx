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

import {
  createPluginFactory,
  isSelectionAtBlockStart,
  isBlockAboveEmpty,
  createAutoformatPlugin,
  createResetNodePlugin,
  createTrailingBlockPlugin,
  createExitBreakPlugin,
  ELEMENT_PARAGRAPH,
  ELEMENT_CODE_BLOCK,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  KEYS_HEADING,
} from '@udecode/plate-headless'
import { createSoftBreakPlugin } from '../soft-break'
import { autoformatRules } from './autoformat/autoformatRules'
import { withCorrectVoidBehavior } from './with-correct-void-behavior'

export const HANDLES_MDX = [
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_PARAGRAPH,
]

const resetBlockTypesCommonRule = {
  types: [
    ELEMENT_BLOCKQUOTE,
    ELEMENT_H1,
    ELEMENT_H2,
    ELEMENT_H3,
    ELEMENT_H3,
    ELEMENT_H4,
    ELEMENT_H5,
    ELEMENT_H6,
    // NOTE: code blocks behave strangely when used here
  ],
  defaultType: ELEMENT_PARAGRAPH,
}

const createCorrectNodeBehaviorPlugin = createPluginFactory({
  key: 'WITH_CORRECT_NODE_BEHAVIOR',
  withOverrides: withCorrectVoidBehavior,
})
export const plugins = [
  createTrailingBlockPlugin(),
  createCorrectNodeBehaviorPlugin(),
  createAutoformatPlugin({
    options: {
      rules: autoformatRules,
    },
  }),
  createExitBreakPlugin({
    options: {
      rules: [
        // Break out of a block entirely, eg. get out of a blockquote
        // TOOD: maybe this should be shift+enter, but that's a soft break
        // for other things like list items (see below)
        {
          hotkey: 'mod+enter',
        },
        // Same as above but drops you at the top of a block
        {
          hotkey: 'mod+shift+enter',
          before: true,
        },
        {
          hotkey: 'enter',
          query: {
            start: true,
            end: true,
            allow: KEYS_HEADING,
          },
        },
      ],
    },
  }),
  createResetNodePlugin({
    options: {
      rules: [
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Enter',
          predicate: isBlockAboveEmpty,
        },
        {
          ...resetBlockTypesCommonRule,
          hotkey: 'Backspace',
          predicate: isSelectionAtBlockStart,
        },
      ],
    },
  }),
  createSoftBreakPlugin({
    options: {
      rules: [
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE],
          },
        },
      ],
    },
  }),
]
