import { getBlockAbove, KeyboardHandler, queryNode } from '@udecode/plate-core'
import isHotkey from 'is-hotkey'
import { SoftBreakPlugin } from './types'
import { KEY_SOFT_BREAK } from './createSoftBreakPlugin'
import { insertNodes } from '@udecode/plate'

export const onKeyDownSoftBreak: KeyboardHandler<{}, SoftBreakPlugin> =
  (editor, { options: { rules = [] } }) =>
  (event) => {
    const entry = getBlockAbove(editor)
    if (!entry) return

    rules.forEach(({ hotkey, query }) => {
      if (isHotkey(hotkey, event as any) && queryNode(entry, query)) {
        event.preventDefault()

        insertNodes(editor, { type: KEY_SOFT_BREAK, children: [{ text: '' }] })
      }
    })
  }
