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
  AlignPluginOptions,
  AutoformatPluginOptions,
  CodeBlockElement,
  createPlateComponents,
  createPlateOptions,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_HR,
  ELEMENT_IMAGE,
  ELEMENT_PARAGRAPH,
  ELEMENT_TD,
  ELEMENT_TODO_LI,
  ExitBreakPluginOptions,
  IndentPluginOptions,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
  KEYS_HEADING,
  NormalizeTypesPluginOptions,
  PlatePluginOptions,
  ResetBlockTypePluginOptions,
  SelectOnBackspacePluginOptions,
  SoftBreakPluginOptions,
  TrailingBlockPluginOptions,
  withProps,
} from '@udecode/plate'
import { EditableProps } from 'slate-react/dist/components/editable'
import { css } from 'styled-components'
import { autoformatRules } from './autoformat/autoformatRules'

const resetBlockTypesCommonRule = {
  types: [ELEMENT_BLOCKQUOTE, ELEMENT_TODO_LI],
  defaultType: ELEMENT_PARAGRAPH,
}

export const CONFIG: {
  options: Record<string, PlatePluginOptions>
  components: Record<string, any>
  editableProps: EditableProps

  autoformat: AutoformatPluginOptions
  exitBreak: ExitBreakPluginOptions
  forceLayout: NormalizeTypesPluginOptions
  indent: IndentPluginOptions
  resetBlockType: ResetBlockTypePluginOptions
  selectOnBackspace: SelectOnBackspacePluginOptions
  softBreak: SoftBreakPluginOptions
  trailingBlock: TrailingBlockPluginOptions
} = {
  editableProps: {
    spellCheck: false,
    autoFocus: false,
    placeholder: 'Type…',
    style: {
      padding: '15px',
    },
  },
  options: createPlateOptions(),
  components: createPlateComponents({
    [ELEMENT_CODE_BLOCK]: withProps(CodeBlockElement, {
      styles: {
        root: [
          css`
            background-color: #111827;
            code {
              color: white;
            }
          `,
        ],
      },
    }),
  }),
  /**
   * Indenting isn't really represented in markdown, so disable it.
   * TODO: remove this block when it's clear this is the correct behavior
   */
  indent: {
    validTypes: [
      // ELEMENT_PARAGRAPH,
      // ELEMENT_H1,
      // ELEMENT_H2,
      // ELEMENT_H3,
      // ELEMENT_H4,
      // ELEMENT_H5,
      // ELEMENT_H6,
      // ELEMENT_BLOCKQUOTE,
      // ELEMENT_CODE_BLOCK,
    ],
  },
  resetBlockType: {
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
  trailingBlock: { type: ELEMENT_PARAGRAPH },
  softBreak: {
    rules: [
      { hotkey: 'shift+enter' },
      {
        hotkey: 'enter',
        query: {
          allow: [ELEMENT_CODE_BLOCK, ELEMENT_BLOCKQUOTE, ELEMENT_TD],
        },
      },
    ],
  },
  exitBreak: {
    rules: [
      {
        hotkey: 'mod+enter',
      },
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
  selectOnBackspace: { allow: [ELEMENT_IMAGE, ELEMENT_HR] },
  autoformat: {
    rules: autoformatRules,
  },
  forceLayout: {
    // Forces first item to be H1
    // rules: [{ path: [0], strictType: ELEMENT_H1 }],
    rules: [],
  },
}
