/**

*/

import React from 'react'
import { Transforms } from 'slate'
import { useSelected, ReactEditor } from 'slate-react'
import isHotkey from 'is-hotkey'

const handleCloseBase = (editor, element) => {
  const path = ReactEditor.findPath(editor, element)
  const editorEl = ReactEditor.toDOMNode(editor, editor)
  if (editorEl) {
    /**
     * FIXME: there must be a better way to do this. When jumping
     * back from a nested form, the entire editor doesn't receive
     * focus, so enable that, but what we also want is to ensure
     * that this node is selected - so do that, too. But there
     * seems to be a race condition where the `editorEl.focus` doesn't
     * happen in time for the Transform to take effect, hence the
     * setTimeout. I _think_ it just needs to queue and the actual
     * ms timeout is irrelevant, but might be worth checking on
     * devices with lower CPUs
     */
    editorEl.focus()
    setTimeout(() => {
      Transforms.select(editor, path)
    }, 1)
  }
}

const handleRemoveBase = (editor, element) => {
  const path = ReactEditor.findPath(editor, element)
  Transforms.removeNodes(editor, {
    at: path,
  })
}

export const useHotkey = (key, callback) => {
  const selected = useSelected()

  React.useEffect(() => {
    const handleEnter = (e) => {
      if (selected) {
        if (isHotkey(key, e)) {
          e.preventDefault()
          callback()
        }
      }
    }
    document.addEventListener('keydown', handleEnter)

    return () => document.removeEventListener('keydown', handleEnter)
  }, [selected])
}

export const useEmbedHandles = (editor, element) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleClose = () => {
    setIsExpanded(false)
    handleCloseBase(editor, element)
  }

  const handleSelect = (e) => {
    e.preventDefault()
    setIsExpanded(true)
  }

  const handleRemove = () => {
    handleRemoveBase(editor, element)
  }

  return { isExpanded, handleClose, handleRemove, handleSelect }
}
