import {
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
} from '@udecode/plate'
import { createSoftBreakPlugin } from '../soft-break'
import { autoformatRules } from './autoformat/autoformat-rules'
import { withCorrectVoidBehavior } from './with-correct-void-behavior'
import {
  createPluginFactory,
  isBlockAboveEmpty,
  isSelectionAtBlockStart,
} from '@udecode/plate-common'
import { markInputRules } from './mark-input-rules'

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

const createMarkInputRulesPlugin = createPluginFactory({
  key: 'MARK_INPUT_RULES',
  withOverrides: markInputRules,
})

export const plugins = [
  createTrailingBlockPlugin(),
  createCorrectNodeBehaviorPlugin(),
  createAutoformatPlugin({
    options: {
      rules: autoformatRules,
    },
  }),
  createMarkInputRulesPlugin(),
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
