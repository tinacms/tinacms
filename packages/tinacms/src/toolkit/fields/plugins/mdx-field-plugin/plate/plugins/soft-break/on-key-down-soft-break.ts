import { getBlockAbove, queryNode, insertNodes } from '@udecode/plate-headless'
import { isHotkey } from 'is-hotkey'
import { KEY_SOFT_BREAK } from './create-soft-break-plugin'

export const onKeyDownSoftBreak =
  (editor, { options: { rules = [] } }) =>
  (event) => {
    const entry = getBlockAbove(editor)
    if (!entry) return

    rules.forEach(({ hotkey, query }) => {
      if (isHotkey(hotkey, event as any) && queryNode(entry, query)) {
        event.preventDefault()
        event.stopPropagation()

        insertNodes(
          editor,
          [
            { type: KEY_SOFT_BREAK, children: [{ text: '' }] },
            { type: 'text', text: '' },
          ],
          { select: true }
        )
      }
    })
  }
