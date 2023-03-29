import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  INDENT_CONTENT_COMMAND,
  KEY_TAB_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical'
import { ListNode } from '@lexical/list'
import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

export function TabIndentationPlugin() {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerCommand(
      KEY_TAB_COMMAND,
      (event: KeyboardEvent) => {
        const selection = $getSelection()
        const a = $getRoot()

        if (!$isRangeSelection(selection)) {
          return false
        }
        const focus = selection.focus
        const focusNode = focus.getNode()
        const parents = focusNode.getParents()
        if (parents.some((parent) => parent instanceof ListNode)) {
          event.preventDefault()
          return editor.dispatchCommand(
            event.shiftKey ? OUTDENT_CONTENT_COMMAND : INDENT_CONTENT_COMMAND,
            undefined
          )
        }
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )
  })
  return null
}
